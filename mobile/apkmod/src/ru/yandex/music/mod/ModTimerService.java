package ru.yandex.music.mod;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import java.text.DateFormat;
import java.util.Date;

/** A user-started sleep timer. Pauses the original player's own media session. */
public final class ModTimerService extends Service {
    private static final String CHANNEL = "music_mod_sleep";
    private static final int NOTIFICATION = 17492;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable finishTimer = () -> {
        ModPlayback.pause();
        clear();
        stopForeground(true);
        stopSelf();
    };

    static boolean start(Context context, int minutes) {
        if (minutes < 1 || minutes > 180 || ModPlayback.current() == null) return false;
        Intent intent = new Intent(context, ModTimerService.class).putExtra("minutes", minutes);
        ModRuntime.preferences().edit()
            .putLong("sleep_deadline", SystemClock.elapsedRealtime() + minutes * 60_000L)
            .putLong("sleep_wall_deadline", System.currentTimeMillis() + minutes * 60_000L)
            .putLong("sleep_boot", System.currentTimeMillis() - SystemClock.elapsedRealtime()).commit();
        try {
            if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(intent);
            else context.startService(intent);
        } catch (RuntimeException error) {
            clear();
            throw error;
        }
        return true;
    }

    static long remaining() {
        long boot = System.currentTimeMillis() - SystemClock.elapsedRealtime();
        if (Math.abs(boot - ModRuntime.preferences().getLong("sleep_boot", boot)) > 60_000) return 0;
        long deadline = ModRuntime.preferences().getLong("sleep_deadline", 0);
        return Math.max(0, deadline - SystemClock.elapsedRealtime());
    }

    static void cancel(Context context) {
        clear();
        context.stopService(new Intent(context, ModTimerService.class));
    }

    private static void clear() {
        ModRuntime.preferences().edit().remove("sleep_deadline").remove("sleep_wall_deadline").remove("sleep_boot").commit();
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "cancel".equals(intent.getAction())) {
            cancel(this);
            return START_NOT_STICKY;
        }
        int minutes = intent == null ? 0 : intent.getIntExtra("minutes", 0);
        if (minutes > 0) {
            ModRuntime.preferences().edit()
                .putLong("sleep_deadline", SystemClock.elapsedRealtime() + minutes * 60_000L)
                .putLong("sleep_wall_deadline", System.currentTimeMillis() + minutes * 60_000L).commit();
        }
        long left = remaining();
        if (left == 0) {
            finishTimer.run();
            return START_NOT_STICKY;
        }
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= 26)
            manager.createNotificationChannel(new NotificationChannel(CHANNEL, "Таймер сна", NotificationManager.IMPORTANCE_LOW));
        int immutable = Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0;
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, ModSettingsActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | immutable);
        PendingIntent cancel = PendingIntent.getService(this, 1,
            new Intent(this, ModTimerService.class).setAction("cancel"), PendingIntent.FLAG_UPDATE_CURRENT | immutable);
        long wall = ModRuntime.preferences().getLong("sleep_wall_deadline", System.currentTimeMillis() + left);
        Notification.Builder builder = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this);
        Notification notification = builder.setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Таймер сна")
            .setContentText("Музыка остановится в " + DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date(wall)))
            .setContentIntent(open).setOngoing(true).setOnlyAlertOnce(true)
            .addAction(new Notification.Action.Builder(android.R.drawable.ic_menu_close_clear_cancel, "Отменить", cancel).build()).build();
        startForeground(NOTIFICATION, notification);
        handler.removeCallbacks(finishTimer);
        handler.postDelayed(finishTimer, left);
        return START_STICKY;
    }

    @Override public void onDestroy() {
        handler.removeCallbacks(finishTimer);
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent) { return null; }
}
