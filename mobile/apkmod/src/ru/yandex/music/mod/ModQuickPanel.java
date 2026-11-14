package ru.yandex.music.mod;

import android.app.Activity;
import android.app.Dialog;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ScrollView;
import android.widget.Toast;

/** A native in-process bottom dialog, never a system overlay. */
final class ModQuickPanel {
    private static int dp(Activity a, float v) { return ModUi.dp(a, v); }
    private static TextView text(Activity a, String label, int size, int weight, int color) {
        TextView v = new TextView(a); v.setText(label); v.setTextSize(size); v.setTextColor(color); v.setTypeface(ModUi.face(a, weight)); v.setIncludeFontPadding(false); return v;
    }
    private static void gap(Activity a, LinearLayout parent, int height) { parent.addView(new View(a), new LinearLayout.LayoutParams(1, dp(a, height))); }
    private static TextView action(Activity a, String label, View.OnClickListener listener) {
        TextView v = text(a, label, 14, 600, ModUi.TEXT); v.setGravity(Gravity.CENTER); v.setPadding(dp(a, 8), dp(a, 8), dp(a, 8), dp(a, 8));
        v.setMinHeight(dp(a, 52)); v.setBackground(ModUi.control(a, false, 18)); v.setFocusable(true); v.setOnClickListener(listener);
        v.setAccessibilityDelegate(new View.AccessibilityDelegate() {
            @Override public void onInitializeAccessibilityNodeInfo(View host, android.view.accessibility.AccessibilityNodeInfo info) { super.onInitializeAccessibilityNodeInfo(host, info); info.setClassName("android.widget.Button"); }
        }); return v;
    }
    static void show(Activity a) {
        if (a.isFinishing() || a.isDestroyed()) return;
        Dialog dialog = new Dialog(a); dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        LinearLayout body = new LinearLayout(a); body.setOrientation(LinearLayout.VERTICAL); body.setPadding(dp(a, 20), dp(a, 12), dp(a, 20), dp(a, 24));
        body.setBackground(ModUi.shape(a, ModUi.BG, 28, 0)); body.setClipToOutline(true);
        View grip = new View(a); grip.setBackground(ModUi.shape(a, 0xff53535e, 2, 0));
        LinearLayout.LayoutParams gripParams = new LinearLayout.LayoutParams(dp(a, 32), dp(a, 4)); gripParams.gravity = Gravity.CENTER_HORIZONTAL; body.addView(grip, gripParams); gap(a, body, 20);
        LinearLayout heading = new LinearLayout(a); heading.setGravity(Gravity.CENTER_VERTICAL);
        heading.addView(ModUi.mark(a, 32), new LinearLayout.LayoutParams(dp(a, 32), dp(a, 32)));
        TextView title = text(a, "Музыка Mod", 22, 700, ModUi.TEXT); LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(0, -2, 1); titleParams.setMarginStart(dp(a, 12)); heading.addView(title, titleParams);
        TextView close = action(a, "Закрыть", v -> dialog.dismiss()); heading.addView(close, new LinearLayout.LayoutParams(dp(a, 88), dp(a, 48))); body.addView(heading); gap(a, body, 24);
        long left = ModTimerService.remaining(); body.addView(text(a, "Таймер сна", 16, 600, ModUi.TEXT)); gap(a, body, 6);
        body.addView(text(a, left > 0 ? "Пауза через " + ((left + 59999) / 60000) + " мин" : "Выключен", 13, 400, ModUi.MUTED)); gap(a, body, 12);
        LinearLayout timer = new LinearLayout(a);
        for (int minutes : new int[]{15, 30, 60}) {
            TextView button = action(a, minutes + " мин", v -> {
                try {
                    if (!ModTimerService.start(a, minutes)) { Toast.makeText(a, "Сначала включи трек в плеере", Toast.LENGTH_LONG).show(); return; }
                    ModRuntime.preferences().edit().putInt("timer_preset", minutes).commit(); dialog.dismiss(); show(a);
                } catch (RuntimeException error) { Toast.makeText(a, "Не удалось запустить таймер", Toast.LENGTH_LONG).show(); }
            });
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, dp(a, 52), 1); if (timer.getChildCount() > 0) p.setMarginStart(dp(a, 8)); timer.addView(button, p);
        } body.addView(timer);
        if (left > 0) { gap(a, body, 8); body.addView(action(a, "Отменить таймер", v -> { ModTimerService.cancel(a); dialog.dismiss(); show(a); }), new LinearLayout.LayoutParams(-1, dp(a, 48))); }
        gap(a, body, 24); body.addView(text(a, "Оформление", 16, 600, ModUi.TEXT)); gap(a, body, 12);
        body.addView(action(a, ModProfiles.name() + "   ›", v -> ModUi.dialog(a).setTitle("Выбери тему").setItems(ModProfiles.THEMES, (d, which) -> {
            ModProfiles.theme(ModProfiles.THEMES[which]); dialog.dismiss(); show(a);
        }).setNegativeButton("Отмена", null).show()), new LinearLayout.LayoutParams(-1, dp(a, 52)));
        gap(a, body, 20); body.addView(action(a, "Все настройки", v -> { dialog.dismiss(); a.startActivity(new Intent(a, ModSettingsActivity.class)); }), new LinearLayout.LayoutParams(-1, dp(a, 56)));
        ScrollView scroll = new ScrollView(a); scroll.setFillViewport(false); scroll.addView(body); dialog.setContentView(scroll);
        Window w = dialog.getWindow(); if (w == null) return;
        w.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT)); w.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        w.setDimAmount(.45f); w.setGravity(Gravity.BOTTOM); w.setNavigationBarColor(ModUi.BG);
        dialog.show();
        int maxHeight = a.getResources().getDisplayMetrics().heightPixels * 85 / 100;
        w.setLayout(-1, -2); scroll.setOnApplyWindowInsetsListener((view, insets) -> { body.setPadding(dp(a, 20), dp(a, 12), dp(a, 20), dp(a, 24) + insets.getSystemWindowInsetBottom()); return insets; });
        scroll.post(() -> { if (scroll.getHeight() > maxHeight) w.setLayout(-1, maxHeight); });
    }
}
