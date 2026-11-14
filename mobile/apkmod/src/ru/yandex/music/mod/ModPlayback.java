package ru.yandex.music.mod;

import android.content.Context;
import android.media.session.MediaController;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Handler;
import android.os.Looper;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/** Controllers obtained only from sessions created inside this original music APK. */
public final class ModPlayback {
    private static final List<MediaController> controllers = new ArrayList<>();
    private ModPlayback() {}

    public static synchronized void capture(MediaSession session, Context context) {
        if (session == null || context == null || !"ru.yandex.music".equals(context.getPackageName())) return;
        MediaController controller = session.getController();
        for (MediaController existing : controllers)
            if (existing.getSessionToken().equals(controller.getSessionToken())) return;
        controllers.add(controller);
        ModListening.observe(context, controller);
        controller.registerCallback(new MediaController.Callback() {
            @Override public void onSessionDestroyed() {
                synchronized (ModPlayback.class) { controllers.remove(controller); }
            }
        }, new Handler(Looper.getMainLooper()));
    }

    static synchronized MediaController current() {
        MediaController fallback = null;
        for (MediaController controller : controllers) {
            PlaybackState state = controller.getPlaybackState();
            if (state != null && (state.getState() == PlaybackState.STATE_PLAYING
                || state.getState() == PlaybackState.STATE_BUFFERING)) return controller;
            if (controller.getMetadata() != null) fallback = controller;
        }
        return fallback;
    }

    static boolean pause() {
        MediaController controller = current();
        if (controller == null) return false;
        controller.getTransportControls().pause();
        return true;
    }
}
