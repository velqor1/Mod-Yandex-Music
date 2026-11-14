package ru.yandex.music.mod;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.EditText;
import android.content.SharedPreferences;
import org.json.JSONArray;
import java.util.Set;
import java.util.HashSet;

/** Native mod hub: appearance, playback, on-device listening journal and insights. */
public final class ModSettingsActivity extends Activity {
    private LinearLayout root, page;
    private ScrollView scroll;
    private int tab, accent;
    private final int[] positions = new int[7];
    private final android.os.Handler ui = new android.os.Handler(android.os.Looper.getMainLooper());
    private String historyQuery = "";
    private long historyFrom, historyTo = Long.MAX_VALUE;
    private boolean onlyInterrupted;
    private int period = 1, historyGeneration;
    private LinearLayout historyRows;
    private static final int[] COLORS = {0xffff2d3c, 0xff8b5cf6, 0xff007acc, 0xffff637d, 0xff34c79b, 0xffe5b945};
    private static final String[] NAMES = {"Красный", "Фиолетовый", "Синий", "Розовый", "Зелёный", "Золотой"};

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        tab = state == null ? getIntent().getIntExtra("section", 0) : state.getInt("tab", 0);
        if (state != null) {
            historyQuery = state.getString("query", ""); historyFrom = state.getLong("from", 0);
            historyTo = state.getLong("to", Long.MAX_VALUE); onlyInterrupted = state.getBoolean("interrupted", false);
            period = state.getInt("period", 1);
        }
        if (tab < 0 || tab > 6) tab = 0;
        getWindow().setStatusBarColor(ModUi.BG);
        getWindow().setNavigationBarColor(ModUi.BG);
        getWindow().getDecorView().setSystemUiVisibility(0);
        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, () -> back());
        render();
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        state.putInt("tab", tab); state.putString("query", historyQuery); state.putLong("from", historyFrom);
        state.putLong("to", historyTo); state.putBoolean("interrupted", onlyInterrupted); state.putInt("period", period);
        super.onSaveInstanceState(state);
    }
    private int dp(float value) { return ModUi.dp(this, value); }
    private TextView text(String value, int size, int weight, int color) {
        TextView v = new TextView(this);
        v.setText(value); v.setTextSize(size); v.setTextColor(color);
        v.setTypeface(ModUi.face(this, weight)); v.setIncludeFontPadding(false); v.setLineSpacing(dp(2), 1);
        return v;
    }
    private LinearLayout column() {
        LinearLayout v = new LinearLayout(this); v.setOrientation(LinearLayout.VERTICAL); return v;
    }
    private void gap(LinearLayout parent, int height) { parent.addView(new View(this), new LinearLayout.LayoutParams(1, dp(height))); }
    private void refresh() { positions[tab] = scroll.getScrollY(); render(); }
    private LinearLayout card() {
        LinearLayout group = column(); group.setBackground(ModUi.shape(this, ModUi.SURFACE, 20, 0));
        group.setClipToOutline(true); page.addView(group, new LinearLayout.LayoutParams(-1, -2)); return group;
    }
    private void divider(LinearLayout parent) {
        View line = new View(this); line.setBackgroundColor(ModUi.LINE);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, dp(1));
        p.setMarginStart(dp(16)); p.setMarginEnd(dp(16)); parent.addView(line, p);
    }
    private View iconButton(int icon, String description, View.OnClickListener listener) {
        FrameLayout target = new FrameLayout(this);
        target.setContentDescription(description); target.setFocusable(true);
        target.setBackground(ModUi.control(this, false, 24)); target.setOnClickListener(listener);
        target.setAccessibilityDelegate(new View.AccessibilityDelegate() {
            @Override public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
                super.onInitializeAccessibilityNodeInfo(host, info); info.setClassName("android.widget.Button");
            }
        });
        target.addView(new ModUi.Icon(this, icon, ModUi.TEXT), new FrameLayout.LayoutParams(dp(24), dp(24), Gravity.CENTER));
        if (Build.VERSION.SDK_INT >= 26) target.setTooltipText(description);
        return target;
    }
    private void render() {
        accent = ModRuntime.accent(); root = column(); root.setBackgroundColor(ModUi.BG);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                root.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else root.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        setContentView(root); root.requestApplyInsets();
        LinearLayout header = new LinearLayout(this); header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(12), dp(8), dp(12), dp(8));
        header.addView(iconButton(ModUi.BACK, "Назад", v -> back()), new LinearLayout.LayoutParams(dp(48), dp(48)));
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(0, -2, 1); titleParams.setMarginStart(dp(8));
        if (tab == 0) {
            FrameLayout mark = new FrameLayout(this); mark.addView(ModUi.mark(this, 38), new FrameLayout.LayoutParams(dp(38), dp(38), Gravity.CENTER));
            header.removeViewAt(0); header.addView(mark, 0, new LinearLayout.LayoutParams(dp(48), dp(48)));
        }
        LinearLayout heading = column();
        String[] titles = {"Музыка Mod", "Оформление", "Плеер", "Удобство", "Мои пресеты", "История", "Статистика"};
        heading.addView(text(titles[tab], 23, 700, ModUi.TEXT));
        if (tab == 0) { gap(heading, 4); heading.addView(text("Настройки · " + ModRuntime.VERSION, 12, 400, ModUi.MUTED)); }
        header.addView(heading, titleParams);
        header.addView(iconButton(ModUi.INFO, "О моде", v -> ModUi.dialog(this).setTitle("Яндекс Музыка Mod")
            .setMessage("Версия " + ModRuntime.VERSION + "\nНа основе Яндекс Музыки 2026.11.1\n\nНастройки сохраняются автоматически.")
            .setPositiveButton("Понятно", null).show()), new LinearLayout.LayoutParams(dp(48), dp(48)));
        LinearLayout.LayoutParams closeParams = new LinearLayout.LayoutParams(dp(48), dp(48));
        closeParams.setMarginStart(dp(8));
        header.addView(iconButton(ModUi.CLOSE, "Закрыть настройки", v -> finish()), closeParams);
        root.addView(header);
        scroll = new ScrollView(this); scroll.setFillViewport(true); scroll.setClipToPadding(false); page = column();
        int gutter = Math.max(20, (getResources().getConfiguration().screenWidthDp - 640) / 2);
        page.setPadding(dp(gutter), dp(20), dp(gutter), dp(24)); scroll.addView(page);
        root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
        historyGeneration++;
        if (tab == 0) home(); else if (tab == 1) appearance(); else if (tab == 2) playback(); else if (tab == 3) convenience(); else if (tab == 4) presets(); else if (tab == 5) history(); else statistics();
        scroll.post(() -> scroll.scrollTo(0, positions[tab]));
    }
    private void toggle(LinearLayout parent, String title, String subtitle, String key, boolean fallback) {
        LinearLayout row = new LinearLayout(this); row.setGravity(Gravity.CENTER_VERTICAL); row.setMinimumHeight(dp(80));
        row.setPadding(dp(16), dp(16), dp(16), dp(16)); row.setBackground(ModUi.touch(this, 0x00000000, 0));
        LinearLayout labels = column(); labels.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
        labels.addView(text(title, 16, 600, ModUi.TEXT)); gap(labels, 5); labels.addView(text(subtitle, 13, 400, ModUi.MUTED));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMarginEnd(dp(16)); row.addView(labels, lp);
        Switch control = new Switch(this); control.setChecked(ModRuntime.enabled(key, fallback));
        control.setClickable(false); control.setFocusable(false); control.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
        control.setThumbTintList(new ColorStateList(new int[][]{new int[]{android.R.attr.state_checked}, new int[]{}}, new int[]{accent, 0xff858896}));
        control.setTrackTintList(new ColorStateList(new int[][]{new int[]{android.R.attr.state_checked}, new int[]{}}, new int[]{ModUi.soft(accent), 0xff383c49}));
        row.addView(control, new LinearLayout.LayoutParams(dp(44), -2));
        row.setContentDescription(title + ". " + subtitle); row.setFocusable(true);
        row.setAccessibilityDelegate(new View.AccessibilityDelegate() {
            @Override public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
                super.onInitializeAccessibilityNodeInfo(host, info); info.setClassName("android.widget.Switch");
                info.setCheckable(true); info.setChecked(control.isChecked());
            }
        });
        row.setOnClickListener(v -> {
            control.setChecked(!control.isChecked()); ModRuntime.preferences().edit().putBoolean(key, control.isChecked()).commit();
            if (key.equals("listening_history")) ModListening.recordingChanged();
            row.sendAccessibilityEvent(android.view.accessibility.AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED);
            if (key.equals("appearance") || key.equals("deep_dark") || key.equals("manrope")) ModProfiles.custom();
            if (key.equals("glass_ui") || key.equals("economy") || tab == 1) refresh();
        }); parent.addView(row, new LinearLayout.LayoutParams(-1, -2));
    }
    private void link(LinearLayout parent, int icon, String title, View.OnClickListener listener) {
        LinearLayout row = new LinearLayout(this); row.setGravity(Gravity.CENTER_VERTICAL); row.setMinimumHeight(dp(64));
        row.setPadding(dp(16), dp(8), dp(12), dp(8)); row.setBackground(ModUi.touch(this, 0x00000000, 0)); row.setFocusable(true);
        row.addView(new ModUi.Icon(this, icon, ModUi.MUTED), new LinearLayout.LayoutParams(dp(22), dp(22)));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMarginStart(dp(12)); lp.setMarginEnd(dp(8));
        row.addView(text(title, 15, 500, ModUi.TEXT), lp);
        row.addView(new ModUi.Icon(this, ModUi.CHEVRON, ModUi.MUTED), new LinearLayout.LayoutParams(dp(20), dp(20)));
        row.setOnClickListener(listener); parent.addView(row);
    }
    private void playback() {
        LinearLayout basic = card();
        toggle(basic, "Без активного Плюса", "Режим воспроизведения мода", "without_plus", true); divider(basic);
        toggle(basic, "Не гасить экран", "Пока открыта Яндекс Музыка", "keep_screen", false);
        gap(page, 16); timer(); gap(page, 16);
        LinearLayout links = card();
        link(links, ModUi.AUDIO, "Качество звука", v -> startActivity(new Intent().setClassName(getPackageName(), "ru.yandex.music.settings.screen.QualitySettingsActivity")));
        divider(links);
        link(links, ModUi.GEAR, "Настройки Яндекс Музыки", v -> startActivity(new Intent().setClassName(getPackageName(), "ru.yandex.music.settings.SettingsActivity")));
        gap(page, 20); TextView note = text("Изменения сохраняются автоматически", 12, 400, ModUi.MUTED);
        note.setGravity(Gravity.CENTER); page.addView(note);
    }
    private void timer() {
        LinearLayout timer = card(); timer.setPadding(dp(16), dp(12), dp(16), dp(16));
        long left = ModTimerService.remaining();
        LinearLayout heading = new LinearLayout(this); heading.setGravity(Gravity.CENTER_VERTICAL);
        heading.addView(new ModUi.Icon(this, ModUi.MOON, accent), new LinearLayout.LayoutParams(dp(24), dp(24)));
        LinearLayout labels = column(); labels.addView(text("Таймер сна", 16, 600, ModUi.TEXT)); gap(labels, 5);
        labels.addView(text(left > 0 ? "Пауза через " + ((left + 59_999) / 60_000) + " мин" : "Выключен", 13, 400, ModUi.MUTED));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMarginStart(dp(12)); heading.addView(labels, lp);
        if (left > 0) heading.addView(iconButton(ModUi.CLOSE, "Отменить таймер", v -> { ModTimerService.cancel(this); refresh(); }), new LinearLayout.LayoutParams(dp(48), dp(48)));
        else heading.setMinimumHeight(dp(48));
        timer.addView(heading); gap(timer, 16); LinearLayout presets = new LinearLayout(this);
        int[] values = {15, 30, 45, 60};
        for (int i = 0; i < values.length; i++) {
            final int minutes = values[i];
            boolean selected = left > 0 && ModRuntime.preferences().getInt("timer_preset", 0) == minutes;
            TextView choice = text(minutes + " мин", 13, 600, selected ? ModUi.TEXT : ModUi.MUTED);
            choice.setGravity(Gravity.CENTER); choice.setSelected(selected); choice.setFocusable(true);
            choice.setBackground(ModUi.control(this, selected, 16));
            choice.setOnClickListener(v -> {
                try {
                    if (!ModTimerService.start(this, minutes)) { Toast.makeText(this, "Сначала включи трек в плеере", Toast.LENGTH_LONG).show(); return; }
                    ModRuntime.preferences().edit().putInt("timer_preset", minutes).commit(); refresh();
                } catch (RuntimeException error) { Toast.makeText(this, "Не удалось запустить таймер. Вернись в плеер и попробуй ещё раз", Toast.LENGTH_LONG).show(); }
            });
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, dp(48), 1); if (i > 0) p.setMarginStart(dp(8)); presets.addView(choice, p);
        } timer.addView(presets);
    }
    private void appearance() {
        preview(); gap(page, 16);
        sectionTitle("Готовые темы");
        LinearLayout themes = new LinearLayout(this);
        for (String name : ModProfiles.THEMES) {
            TextView theme = button(name + (name.equals(ModProfiles.name()) ? " ✓" : ""), name.equals(ModProfiles.name()), v -> { ModProfiles.theme(name); refresh(); });
            theme.setTextSize(13); theme.setPadding(dp(6), dp(8), dp(6), dp(8));
            LinearLayout.LayoutParams choice = new LinearLayout.LayoutParams(0, -2, 1);
            if (themes.getChildCount() > 0) choice.setMarginStart(dp(8)); themes.addView(theme, choice);
        }
        page.addView(themes, new LinearLayout.LayoutParams(-1, -2));
        gap(page, 12);
        LinearLayout palette = card(); palette.setPadding(dp(16), dp(20), dp(16), dp(16));
        LinearLayout label = new LinearLayout(this); label.setGravity(Gravity.CENTER_VERTICAL);
        label.addView(text("Цвет акцента", 14, 600, ModUi.TEXT), new LinearLayout.LayoutParams(0, -2, 1));
        String name = "Свой цвет"; for (int i = 0; i < COLORS.length; i++) if (COLORS[i] == accent) name = NAMES[i];
        label.addView(text(name, 12, 400, ModUi.MUTED)); palette.addView(label); gap(palette, 8);
        LinearLayout swatches = new LinearLayout(this);
        for (int i = 0; i < COLORS.length; i++) {
            final int color = COLORS[i]; ColorSwatch swatch = new ColorSwatch(color, NAMES[i]);
            swatch.setOnClickListener(v -> { ModRuntime.preferences().edit().putInt("accent", color).commit(); ModProfiles.custom(); refresh(); });
            swatches.addView(swatch, new LinearLayout.LayoutParams(0, dp(56), 1));
        } palette.addView(swatches); gap(page, 16);
        LinearLayout options = card();
        toggle(options, "Оформление мода", "Цвета и шрифты в приложении", "appearance", true); divider(options);
        toggle(options, "Тёмная палитра", "Графитовые поверхности", "deep_dark", true); divider(options);
        toggle(options, "Шрифт Manrope", "Для интерфейса Яндекс Музыки", "manrope", true); gap(page, 16);
        LinearLayout material = card();
        toggle(material, "Liquid Glass", "Кнопки и панели во всём приложении", "glass_ui", true);
        if (ModRuntime.enabled("economy", false)) { TextView hint = text("Эффект отключён режимом экономии", 12, 400, ModUi.MUTED); hint.setPadding(dp(16), 0, dp(16), dp(16)); material.addView(hint); }
        gap(page, 16);
        LinearLayout size = card(); size.setPadding(dp(16), dp(16), dp(16), dp(8));
        LinearLayout title = new LinearLayout(this); title.addView(text("Размер текста", 16, 600, ModUi.TEXT), new LinearLayout.LayoutParams(0, -2, 1));
        int current = ModRuntime.preferences().getInt("text_scale", 100);
        TextView value = text(current + "%", 14, 600, ModUi.TEXT); title.addView(value); size.addView(title); gap(size, 8);
        SeekBar seek = new SeekBar(this); seek.setMax(7); seek.setProgress((current - 85) / 5);
        seek.setProgressTintList(ColorStateList.valueOf(accent)); seek.setThumbTintList(ColorStateList.valueOf(accent)); seek.setContentDescription("Размер текста");
        seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            public void onProgressChanged(SeekBar bar, int progress, boolean user) { value.setText((85 + progress * 5) + "%"); }
            public void onStartTrackingTouch(SeekBar bar) {}
            public void onStopTrackingTouch(SeekBar bar) { ModRuntime.preferences().edit().putInt("text_scale", 85 + bar.getProgress() * 5).commit(); ModProfiles.custom(); refresh(); }
        }); size.addView(seek, new LinearLayout.LayoutParams(-1, dp(48))); gap(page, 12);
        TextView reset = text("Сбросить оформление", 14, 600, ModUi.MUTED); reset.setGravity(Gravity.CENTER);
        reset.setMinHeight(dp(48)); reset.setFocusable(true); reset.setBackground(ModUi.touch(this, 0x00000000, 14));
        reset.setOnClickListener(v -> ModUi.dialog(this).setTitle("Сбросить оформление?")
            .setMessage("Вернутся исходные цвет, шрифт и размер текста мода.").setNegativeButton("Отмена", null)
            .setPositiveButton("Сбросить", (dialog, which) -> { ModRuntime.preferences().edit().remove("accent").remove("appearance").remove("deep_dark").remove("manrope").remove("text_scale").remove("amoled").remove("theme_name").remove("glass_ui").commit(); refresh(); }).show());
        TextView save = button("Сохранить как пресет", false, v -> savePreset());
        page.addView(save, new LinearLayout.LayoutParams(-1, dp(52))); gap(page, 8);
        page.addView(reset); gap(page, 8);
        TextView note = text("Цвета и шрифты полностью обновятся после перезапуска приложения.", 12, 400, ModUi.MUTED); note.setGravity(Gravity.CENTER); page.addView(note);
    }
    private void back() { if (tab == 0) finish(); else open(0); }
    @Override public void onBackPressed() { back(); }
    private void open(int section) { positions[tab] = scroll.getScrollY(); tab = section; render(); }
    private void sectionTitle(String title) { TextView label = text(title, 14, 600, ModUi.MUTED); label.setPadding(dp(4), 0, 0, dp(12)); page.addView(label); }
    private TextView button(String label, boolean selected, View.OnClickListener listener) {
        TextView v = text(label, 14, 600, ModUi.TEXT); v.setGravity(Gravity.CENTER); v.setPadding(dp(12), dp(8), dp(12), dp(8));
        v.setMinHeight(dp(48)); v.setFocusable(true); v.setSelected(selected); v.setBackground(ModUi.control(this, selected, 18)); v.setOnClickListener(listener);
        v.setAccessibilityDelegate(new View.AccessibilityDelegate() {
            @Override public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) { super.onInitializeAccessibilityNodeInfo(host, info); info.setClassName("android.widget.Button"); }
        }); return v;
    }
    private void home() {
        TextView intro = text("Больше о твоей музыке", 28, 700, ModUi.TEXT);
        page.addView(intro); gap(page, 8);
        page.addView(text("История и статистика всегда под рукой", 14, 400, ModUi.MUTED)); gap(page, 24);
        feature(ModUi.HISTORY, "История", "Найди то, что недавно звучало", 0xffb2a4f5, v -> open(5)); gap(page, 10);
        feature(ModUi.CHART, "Статистика", "Время, исполнители и любимые треки", 0xffa9d7c9, v -> open(6));
        gap(page, 28); sectionTitle("Сделай по-своему");
        LinearLayout design = card(); design.setPadding(dp(18), dp(18), dp(18), dp(18));
        LinearLayout identity = new LinearLayout(this); identity.setGravity(Gravity.CENTER_VERTICAL);
        identity.addView(new ModUi.Icon(this, ModUi.PALETTE, accent), new LinearLayout.LayoutParams(dp(28), dp(28)));
        LinearLayout labels = column(); labels.addView(text("Оформление", 19, 700, ModUi.TEXT)); gap(labels, 5);
        labels.addView(text(ModProfiles.name() + " · цвет, шрифт и стекло", 13, 400, ModUi.MUTED));
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, -2, 1); p.setMarginStart(dp(14)); identity.addView(labels, p);
        identity.addView(new ModUi.Icon(this, ModUi.CHEVRON, ModUi.MUTED), new LinearLayout.LayoutParams(dp(20), dp(20)));
        design.addView(identity); design.setOnClickListener(v -> open(1)); design.setFocusable(true);
        gap(design, 22);
        LinearLayout samples = new LinearLayout(this);
        for (int color : COLORS) {
            View swatch = new View(this); swatch.setBackground(ModUi.shape(this, color, 8, 0));
            swatch.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
            LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(0, dp(6), 1); if (samples.getChildCount() > 0) sp.setMarginStart(dp(6)); samples.addView(swatch, sp);
        } design.addView(samples);
        gap(page, 24); sectionTitle("Настройки"); LinearLayout sections = card();
        link(sections, ModUi.AUDIO, "Плеер и таймер сна", v -> open(2)); divider(sections);
        link(sections, ModUi.SLIDERS, "Мои пресеты", v -> open(4)); divider(sections);
        link(sections, ModUi.GEAR, "Удобство и данные", v -> open(3));
        Set<String> selected = ModProfiles.favorites();
        if (!selected.isEmpty()) { gap(page, 24); sectionTitle("Быстрые настройки"); }
        LinearLayout fav = selected.isEmpty() ? column() : card(); boolean first = true;
        String[] keys = {"keep_screen", "economy", "glass_ui"}; String[] names = {"Не гасить экран", "Режим экономии", "Liquid Glass"};
        String[] hints = {"Пока открыта Яндекс Музыка", "Без стекла и декоративного движения", "Стеклянные кнопки"};
        for (int i = 0; i < keys.length; i++) if (selected.contains(keys[i])) { if (!first) divider(fav); first = false; toggle(fav, names[i], hints[i], keys[i], keys[i].equals("glass_ui")); }
        gap(page, 24); TextView note = text("История хранится на этом телефоне", 12, 400, ModUi.MUTED); note.setGravity(Gravity.CENTER); page.addView(note);
    }
    private void feature(int icon, String title, String subtitle, int tint, View.OnClickListener listener) {
        LinearLayout row = new LinearLayout(this); row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(dp(18), dp(20), dp(16), dp(20)); row.setMinimumHeight(dp(94));
        row.setBackground(ModUi.control(this, false, 24)); row.setFocusable(true); row.setOnClickListener(listener);
        FrameLayout emblem = new FrameLayout(this); emblem.setBackground(ModUi.shape(this, ModUi.soft(tint), 14, 0));
        emblem.addView(new ModUi.Icon(this, icon, tint), new FrameLayout.LayoutParams(dp(25), dp(25), Gravity.CENTER));
        row.addView(emblem, new LinearLayout.LayoutParams(dp(48), dp(48)));
        LinearLayout labels = column(); labels.addView(text(title, 20, 700, ModUi.TEXT)); gap(labels, 5);
        labels.addView(text(subtitle, 13, 400, ModUi.MUTED));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMarginStart(dp(14)); lp.setMarginEnd(dp(8)); row.addView(labels, lp);
        row.addView(new ModUi.Icon(this, ModUi.CHEVRON, ModUi.MUTED), new LinearLayout.LayoutParams(dp(20), dp(20)));
        row.setAccessibilityDelegate(new View.AccessibilityDelegate() {
            @Override public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
                super.onInitializeAccessibilityNodeInfo(host, info); info.setClassName("android.widget.Button");
            }
        });
        page.addView(row, new LinearLayout.LayoutParams(-1, -2));
    }
    private void preview() {
        LinearLayout group = card(); group.setPadding(dp(18), dp(18), dp(18), dp(18));
        int previewAccent = ModRuntime.enabled("appearance", true) ? accent : 0xffffdb00;
        int bg = ModRuntime.enabled("amoled", false) ? 0xff000000 : ModRuntime.enabled("deep_dark", true) ? 0xff16171e : 0xff202020;
        group.setBackground(ModUi.shape(this, bg, 20, 0));
        TextView tag = text("Предпросмотр", 12, 500, ModUi.MUTED); group.addView(tag); gap(group, 16);
        LinearLayout row = new LinearLayout(this); row.setGravity(Gravity.CENTER_VERTICAL);
        FrameLayout cover = new FrameLayout(this); cover.setBackground(ModUi.shape(this, previewAccent, 16, 0));
        cover.addView(new ModUi.Icon(this, ModUi.AUDIO, 0xff16171e), new FrameLayout.LayoutParams(dp(36), dp(36), Gravity.CENTER));
        row.addView(cover, new LinearLayout.LayoutParams(dp(72), dp(72)));
        LinearLayout labels = column(); TextView title = text("Твоя музыка", 20, 700, ModUi.TEXT);
        title.setTypeface(ModRuntime.font(Typeface.DEFAULT_BOLD)); title.setTextSize(20 * ModRuntime.preferences().getInt("text_scale", 100) / 100f);
        labels.addView(title); gap(labels, 6); labels.addView(text("Так выглядит выбранный стиль", 12, 400, ModUi.MUTED));
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, -2, 1); p.setMarginStart(dp(16)); row.addView(labels, p); group.addView(row);
        gap(group, 18); View progress = new View(this); progress.setBackground(ModUi.shape(this, previewAccent, 2, 0)); group.addView(progress, new LinearLayout.LayoutParams(-1, dp(3)));
    }
    private void convenience() {
        sectionTitle("История и статистика");
        LinearLayout journal = card();
        toggle(journal, "Сохранять прослушивания", "Только на этом телефоне, без отправки на сервер", "listening_history", true);
        divider(journal); link(journal, ModUi.HISTORY, "Очистить историю и статистику", v -> clearHistory());
        gap(page, 12); page.addView(text("Запись начинается после установки этой версии. Слушания на других устройствах сюда не попадают.", 13, 400, ModUi.MUTED));
        gap(page, 24); sectionTitle("Приложение");
        LinearLayout group = card(); toggle(group, "Режим экономии", "Отключить стекло и декоративное движение", "economy", false); divider(group);
        link(group, ModUi.GEAR, "Избранные настройки", v -> chooseFavorites()); gap(page, 16);
        LinearLayout files = card(); link(files, ModUi.SLIDERS, "Экспорт оформления", v -> exportProfile()); divider(files);
        link(files, ModUi.SLIDERS, "Импорт оформления", v -> importProfile());
        gap(page, 16); TextView note = text("Файл содержит только оформление. Аккаунт и данные воспроизведения не экспортируются.", 12, 400, ModUi.MUTED); page.addView(note);
    }
    private void clearHistory() {
        ModUi.dialog(this).setTitle("Очистить историю?")
            .setMessage("Будут удалены история и статистика мода на этом телефоне. Плейлисты и понравившиеся песни сохранятся.")
            .setNegativeButton("Отмена", null).setPositiveButton("Очистить", (d, w) ->
                ModListening.clear(this, (ok, failed) -> { if (!isFinishing()) { message(failed ? "Не удалось очистить историю" : "История очищена"); refresh(); } })).show();
    }
    private String time(long millis) {
        long minutes = millis / 60_000;
        return minutes >= 60 ? (minutes / 60) + " ч " + (minutes % 60) + " мин" : minutes + " мин";
    }
    private String date(long when, String pattern) { return new java.text.SimpleDateFormat(pattern, new java.util.Locale("ru")).format(new java.util.Date(when)); }
    private void hint(LinearLayout parent, String title, String detail) {
        LinearLayout empty = column(); empty.setPadding(dp(8), dp(24), dp(8), dp(24));
        empty.addView(text(title, 20, 700, ModUi.TEXT)); gap(empty, 8); empty.addView(text(detail, 14, 400, ModUi.MUTED)); parent.addView(empty);
    }
    private void history() {
        page.addView(text("Твоя музыка по дням", 26, 700, ModUi.TEXT)); gap(page, 8);
        page.addView(text("На этом телефоне · поиск по треку, исполнителю или альбому", 13, 400, ModUi.MUTED)); gap(page, 20);
        EditText search = new EditText(this); search.setSingleLine(); search.setTextSize(15); search.setTextColor(ModUi.TEXT);
        search.setHintTextColor(ModUi.MUTED); search.setTypeface(ModUi.face(this, 400)); search.setHint("Найти в истории"); search.setContentDescription("Поиск в истории");
        search.setBackground(ModUi.shape(this, ModUi.SURFACE, 16, 0)); search.setPadding(dp(16), dp(12), dp(16), dp(12));
        search.setText(historyQuery); search.setMinimumHeight(dp(52)); page.addView(search, new LinearLayout.LayoutParams(-1, -2)); gap(page, 12);
        LinearLayout filters = new LinearLayout(this);
        TextView day = button(historyFrom == 0 ? "Выбрать день" : date(historyFrom, "d MMM"), historyFrom != 0, v -> chooseDay());
        TextView skipped = button(onlyInterrupted ? "Недослушано ✓" : "Недослушано", onlyInterrupted, v -> { onlyInterrupted = !onlyInterrupted; refresh(); });
        LinearLayout.LayoutParams half = new LinearLayout.LayoutParams(0, -2, 1); half.setMarginEnd(dp(8)); filters.addView(day, half);
        filters.addView(skipped, new LinearLayout.LayoutParams(0, -2, 1)); page.addView(filters);
        if (historyFrom != 0) { gap(page, 8); page.addView(button("Показать все дни", false, v -> { historyFrom = 0; historyTo = Long.MAX_VALUE; refresh(); })); }
        gap(page, 20); historyRows = column(); page.addView(historyRows);
        loadHistory(Long.MAX_VALUE, false);
        search.addTextChangedListener(new android.text.TextWatcher() {
            private final Runnable apply = () -> { if (tab == 5) loadHistory(Long.MAX_VALUE, false); };
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            public void onTextChanged(CharSequence s, int start, int before, int count) { historyQuery = s.toString(); historyGeneration++; ui.removeCallbacks(apply); ui.postDelayed(apply, 250); }
            public void afterTextChanged(android.text.Editable s) {}
        });
    }
    private void chooseDay() {
        java.util.Calendar now = java.util.Calendar.getInstance();
        if (historyFrom != 0) now.setTimeInMillis(historyFrom);
        new android.app.DatePickerDialog(this, (picker, year, month, day) -> {
            java.util.Calendar start = java.util.Calendar.getInstance(); start.clear(); start.set(year, month, day);
            historyFrom = start.getTimeInMillis(); start.add(java.util.Calendar.DAY_OF_MONTH, 1); historyTo = start.getTimeInMillis(); refresh();
        }, now.get(java.util.Calendar.YEAR), now.get(java.util.Calendar.MONTH), now.get(java.util.Calendar.DAY_OF_MONTH)).show();
    }
    private void loadHistory(long before, boolean append) {
        final int generation = ++historyGeneration;
        final LinearLayout container = historyRows;
        if (!append) { container.removeAllViews(); container.addView(text("Загрузка истории…", 14, 400, ModUi.MUTED)); }
        ModListening.history(this, historyQuery, historyFrom, historyTo, onlyInterrupted, before, (entries, failed) -> {
            if (isFinishing() || tab != 5 || generation != historyGeneration) return;
            if (!append) container.removeAllViews();
            if (failed) { hint(container, "История недоступна", "Не удалось прочитать локальные данные. Попробуй открыть раздел ещё раз."); return; }
            if (entries.isEmpty() && !append) {
                hint(container, historyQuery.isEmpty() && historyFrom == 0 && !onlyInterrupted ? "Здесь появится твоя музыка" : "Ничего не найдено",
                    ModRuntime.enabled("listening_history", true) ? "История собирается с этой версии. Включи музыку или измени фильтры." : "Запись выключена. Её можно включить в разделе «Удобство и данные»."); return;
            }
            String previousDay = "";
            for (ModListening.Entry e : entries) {
                String day = date(e.started, "d MMMM yyyy");
                if (!day.equals(previousDay)) { gap(container, 18); TextView heading = text(day, 13, 600, ModUi.MUTED); container.addView(heading); gap(container, 8); previousDay = day; }
                LinearLayout row = new LinearLayout(this); row.setGravity(Gravity.CENTER_VERTICAL); row.setPadding(dp(4), dp(12), dp(4), dp(12));
                row.setBackground(ModUi.touch(this, 0, 14)); row.setFocusable(true);
                row.addView(new ModCover(this, e.mediaId, e.title, e.artist, e.album, false), new LinearLayout.LayoutParams(dp(56), dp(56)));
                LinearLayout labels = column();
                labels.addView(text(e.title, 16, 600, ModUi.TEXT)); gap(labels, 4);
                labels.addView(text(e.artist.isEmpty() ? "Исполнитель не указан" : e.artist, 13, 400, ModUi.MUTED)); gap(labels, 6);
                labels.addView(text(date(e.started, "HH:mm") + " · " + time(e.listened) + ("interrupted".equals(e.outcome) ? " · недослушано" : ""), 12, 400, ModUi.MUTED));
                LinearLayout.LayoutParams info = new LinearLayout.LayoutParams(0, -2, 1); info.setMarginStart(dp(14)); row.addView(labels, info);
                row.setOnClickListener(v -> openHistoryTrack(e)); container.addView(row);
            }
            if (entries.size() == 100) {
                gap(container, 12); TextView more = button("Показать ещё", false, null);
                more.setOnClickListener(v -> { container.removeView(more); loadHistory(entries.get(entries.size() - 1).id, true); }); container.addView(more);
            }
        });
    }
    private void openHistoryTrack(ModListening.Entry e) {
        message("Проверяем запись…");
        ModTrackAssets.resolve(this, e.mediaId, e.title, e.artist, e.album, asset -> {
        if (isFinishing() || isDestroyed()) return;
        if (!asset.id.matches("\\d+")) {
            ModUi.dialog(this).setTitle(e.title).setMessage(e.artist + (e.album.isEmpty() ? "" : "\n" + e.album))
                .setPositiveButton("Скопировать название", (d, w) -> {
                    ((android.content.ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(android.content.ClipData.newPlainText("Трек", e.artist + " — " + e.title)); message("Название скопировано");
                }).setNegativeButton("Закрыть", null).show(); return;
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://music.yandex.ru/track/" + asset.id)).setPackage(getPackageName()));
        } catch (RuntimeException error) { message("Не удалось открыть трек в Яндекс Музыке"); }
        });
    }
    private void statistics() {
        page.addView(text("Твоя музыка в цифрах", 26, 700, ModUi.TEXT)); gap(page, 8);
        page.addView(text("Прослушивания на этом телефоне", 13, 400, ModUi.MUTED)); gap(page, 20);
        LinearLayout choices = new LinearLayout(this);
        String[] names = {"День", "Неделя", "Месяц", "Год"};
        for (int i = 0; i < names.length; i++) { final int p = i;
            TextView choice = button(names[i], period == i, v -> { period = p; refresh(); }); choice.setTextSize(12); choice.setPadding(dp(4), dp(10), dp(4), dp(10));
            LinearLayout.LayoutParams cp = new LinearLayout.LayoutParams(0, -2, 1); if (i > 0) cp.setMarginStart(dp(6)); choices.addView(choice, cp);
        } page.addView(choices); gap(page, 20);
        LinearLayout content = column(); page.addView(content); content.addView(text("Считаем прослушивания…", 14, 400, ModUi.MUTED));
        java.util.Calendar start = java.util.Calendar.getInstance(); start.set(java.util.Calendar.HOUR_OF_DAY, 0); start.set(java.util.Calendar.MINUTE, 0); start.set(java.util.Calendar.SECOND, 0); start.set(java.util.Calendar.MILLISECOND, 0);
        long[] days = new long[8]; java.util.Calendar day = (java.util.Calendar)start.clone(); day.add(java.util.Calendar.DAY_OF_MONTH, -6);
        for (int i = 0; i < 8; i++) { days[i] = day.getTimeInMillis(); day.add(java.util.Calendar.DAY_OF_MONTH, 1); }
        start.add(java.util.Calendar.DAY_OF_MONTH, period == 1 ? -6 : period == 2 ? -29 : period == 3 ? -364 : 0);
        long from = start.getTimeInMillis();
        java.util.Calendar end = java.util.Calendar.getInstance(); end.set(java.util.Calendar.SECOND, 0); end.set(java.util.Calendar.MILLISECOND, 0); end.add(java.util.Calendar.MINUTE, 1);
        final int requestedPeriod = period;
        ModListening.summary(this, from, end.getTimeInMillis(), days, (summary, failed) -> {
            if (isFinishing() || tab != 6 || period != requestedPeriod || content.getParent() != page) return;
            content.removeAllViews();
            if (failed) { hint(content, "Статистика недоступна", "Не удалось прочитать историю. Попробуй ещё раз."); return; }
            TextView total = text(time(summary.millis), 38, 700, ModUi.TEXT); content.addView(total); gap(content, 6);
            content.addView(text("время прослушивания", 13, 400, ModUi.MUTED)); gap(content, 12);
            String comparison = summary.previousMillis > 0 ? (summary.millis >= summary.previousMillis ? "+" : "") + Math.round((summary.millis - summary.previousMillis) * 100.0 / summary.previousMillis) + "% к предыдущему периоду" : "Для сравнения пока мало данных";
            content.addView(text(comparison, 13, 500, ModUi.MUTED)); gap(content, 24);
            LinearLayout numbers = new LinearLayout(this);
            statNumber(numbers, Long.toString(summary.plays), "прослушиваний"); statNumber(numbers, Long.toString(summary.artists), "исполнителей"); statNumber(numbers, Long.toString(summary.discoveries), "впервые в истории");
            content.addView(numbers); gap(content, 28);
            content.addView(text("Последние 7 дней", 17, 700, ModUi.TEXT)); gap(content, 12);
            for (int i = 0; i < 7; i++) {
                LinearLayout line = new LinearLayout(this); line.setGravity(Gravity.CENTER_VERTICAL);
                line.addView(text(date(days[i], "EE, d"), 12, 400, ModUi.MUTED), new LinearLayout.LayoutParams(dp(65), -2));
                long maximum = 1; for (long amount : summary.days) maximum = Math.max(maximum, amount);
                FrameLayout track = new FrameLayout(this); track.setBackground(ModUi.shape(this, ModUi.SURFACE, 3, 0));
                final float fraction = summary.days[i] / (float)maximum;
                View fill = new View(this); fill.setBackground(ModUi.shape(this, accent, 3, 0));
                track.addView(fill, new FrameLayout.LayoutParams(0, -1));
                track.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> { android.view.ViewGroup.LayoutParams lp = fill.getLayoutParams(); int width = Math.round((r - l) * fraction); if (lp.width != width) { lp.width = width; fill.setLayoutParams(lp); } });
                LinearLayout.LayoutParams bar = new LinearLayout.LayoutParams(0, dp(6), 1); bar.setMarginEnd(dp(12)); line.addView(track, bar);
                TextView amount = text(time(summary.days[i]), 12, 500, ModUi.MUTED); line.addView(amount); content.addView(line); gap(content, 12);
            }
            ranks(content, "Чаще слушаешь", summary.topArtists); ranks(content, "На повторе", summary.topTracks);
            gap(content, 20); content.addView(text(summary.first == 0 ? "Статистика появится после первого прослушивания. Старые данные и другие устройства не учитываются." : "Данные с " + date(summary.first, "d MMMM yyyy") + ". Прослушивание считается от 30 секунд. Паузы не входят во время.", 12, 400, ModUi.MUTED));
        });
    }
    private void statNumber(LinearLayout row, String value, String label) {
        LinearLayout item = column(); item.setPadding(0, 0, dp(8), 0); item.addView(text(value, 24, 700, ModUi.TEXT)); gap(item, 5); item.addView(text(label, 11, 400, ModUi.MUTED));
        row.addView(item, new LinearLayout.LayoutParams(0, -2, 1));
    }
    private void ranks(LinearLayout parent, String heading, java.util.List<ModListening.Rank> ranks) {
        gap(parent, 20); parent.addView(text(heading, 19, 700, ModUi.TEXT)); gap(parent, 12);
        if (ranks.isEmpty()) { parent.addView(text("Здесь появятся твои фавориты", 13, 400, ModUi.MUTED)); return; }
        int index = 1;
        for (ModListening.Rank rank : ranks) {
            LinearLayout line = new LinearLayout(this); line.setGravity(Gravity.CENTER_VERTICAL); line.setPadding(0, dp(10), 0, dp(10));
            line.addView(text(Integer.toString(index++), 13, 500, ModUi.MUTED), new LinearLayout.LayoutParams(dp(30), -2));
            boolean artist = rank.subtitle.isEmpty();
            line.addView(new ModCover(this, rank.mediaId, rank.title, rank.artist, rank.album, artist), new LinearLayout.LayoutParams(dp(44), dp(44)));
            LinearLayout labels = column(); labels.addView(text(rank.name, 15, 600, ModUi.TEXT)); if (!rank.subtitle.isEmpty()) { gap(labels, 4); labels.addView(text(rank.subtitle, 12, 400, ModUi.MUTED)); }
            LinearLayout.LayoutParams info = new LinearLayout.LayoutParams(0, -2, 1); info.setMarginStart(dp(12)); line.addView(labels, info); TextView value = text(time(rank.millis), 12, 500, ModUi.MUTED); value.setPadding(dp(10), 0, 0, 0); line.addView(value); parent.addView(line);
        }
    }
    private void chooseFavorites() {
        String[] keys = {"keep_screen", "economy", "glass_ui"}; String[] labels = {"Не гасить экран", "Режим экономии", "Liquid Glass"};
        Set<String> selected = ModProfiles.favorites(); boolean[] checked = new boolean[keys.length];
        for (int i = 0; i < keys.length; i++) checked[i] = selected.contains(keys[i]);
        ModUi.dialog(this).setTitle("Избранные настройки").setMultiChoiceItems(labels, checked, (dialog, which, value) -> checked[which] = value)
            .setNegativeButton("Отмена", null).setPositiveButton("Сохранить", (dialog, which) -> {
                Set<String> result = new HashSet<>(); for (int i = 0; i < keys.length; i++) if (checked[i]) result.add(keys[i]);
                ModRuntime.preferences().edit().putStringSet("favorites", result).commit(); refresh();
            }).show();
    }
    private void savePreset() {
        EditText input = new EditText(this); input.setSingleLine(); input.setHint("Название пресета"); input.setFilters(new android.text.InputFilter[]{new android.text.InputFilter.LengthFilter(32)});
        AlertDialog dialog = ModUi.dialog(this).setTitle("Сохранить оформление").setView(input).setNegativeButton("Отмена", null).setPositiveButton("Сохранить", null).create();
        dialog.setOnShowListener(d -> { ModUi.styleDialog(dialog); dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            try { ModProfiles.save(input.getText().toString()); dialog.dismiss(); Toast.makeText(this, "Пресет сохранён", Toast.LENGTH_SHORT).show(); if (tab == 4) refresh(); }
            catch (Exception error) { input.setError(error.getMessage()); }
        }); }); dialog.show();
    }
    private void presets() {
        page.addView(button("Сохранить текущее оформление", false, v -> savePreset()), new LinearLayout.LayoutParams(-1, dp(52))); gap(page, 20);
        JSONArray saved = ModProfiles.saved();
        if (saved.length() == 0) { TextView hint = text("Сохрани свой первый стиль — цвет, шрифт, размер текста и стеклянные кнопки.", 14, 400, ModUi.MUTED); page.addView(hint); }
        for (int i = 0; i < saved.length(); i++) {
            final int index = i;
            try {
                String name = saved.getJSONObject(i).getString("name");
                page.addView(button(name, false, v -> ModUi.dialog(this).setTitle(name).setItems(new String[]{"Применить", "Удалить"}, (dialog, action) -> {
                    try {
                        if (action == 0) { ModProfiles.apply(ModProfiles.saved().getJSONObject(index).getJSONObject("settings")); ModRuntime.preferences().edit().putString("theme_name", name).commit(); refresh(); }
                        else ModUi.dialog(this).setTitle("Удалить пресет?").setMessage(name).setNegativeButton("Отмена", null).setPositiveButton("Удалить", (d, w) -> { try { ModProfiles.remove(index); refresh(); } catch (Exception error) { message("Не удалось удалить пресет"); } }).show();
                    } catch (Exception error) { message("Не удалось применить пресет"); }
                }).show()), new LinearLayout.LayoutParams(-1, dp(52))); gap(page, 8);
            } catch (Exception ignored) {}
        }
        gap(page, 20); LinearLayout group = card(); link(group, ModUi.GEAR, "Экспорт оформления", v -> exportProfile()); divider(group); link(group, ModUi.GEAR, "Импорт оформления", v -> importProfile());
    }
    private void message(String value) { Toast.makeText(this, value, Toast.LENGTH_LONG).show(); }
    private void exportProfile() {
        try { startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("application/json").addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE, "Music-Mod-appearance.json"), 41); }
        catch (RuntimeException error) { message("Не удалось открыть выбор файла"); }
    }
    private void importProfile() {
        try { startActivityForResult(new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("application/json").addCategory(Intent.CATEGORY_OPENABLE), 42); }
        catch (RuntimeException error) { message("Не удалось открыть выбор файла"); }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (result != RESULT_OK || data == null || data.getData() == null) return;
        try {
            if (request == 41) {
                try (java.io.OutputStream out = getContentResolver().openOutputStream(data.getData(), "wt")) {
                    if (out == null) throw new java.io.IOException(); out.write(ModProfiles.exportText().getBytes(java.nio.charset.StandardCharsets.UTF_8));
                } message("Оформление экспортировано");
            } else if (request == 42) {
                String value;
                try (java.io.InputStream in = getContentResolver().openInputStream(data.getData()); java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
                    if (in == null) throw new java.io.IOException(); byte[] bytes = new byte[2048]; int size;
                    while ((size = in.read(bytes)) != -1) { if (out.size() + size > 16384) throw new java.io.IOException("Слишком большой файл"); out.write(bytes, 0, size); }
                    value = new String(out.toByteArray(), java.nio.charset.StandardCharsets.UTF_8);
                }
                final String profile = value;
                // Validate before asking to replace the current appearance; no changes until confirmed.
                org.json.JSONObject json = new org.json.JSONObject(profile);
                if (!"music-mod-appearance".equals(json.optString("format"))) throw new IllegalArgumentException();
                ModUi.dialog(this).setTitle("Применить оформление из файла?").setMessage("Текущие цвет, шрифт и кнопки будут заменены. Сохранённые пресеты останутся.")
                    .setNegativeButton("Отмена", null).setPositiveButton("Применить", (dialog, which) -> { try { ModProfiles.importText(profile); refresh(); message("Оформление применено"); } catch (Exception error) { message("Файл оформления повреждён или не поддерживается"); } }).show();
            }
        } catch (Exception error) { message("Не удалось обработать файл оформления"); }
    }
    private final class ColorSwatch extends View {
        private final int color; private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        ColorSwatch(int color, String name) {
            super(ModSettingsActivity.this); this.color = color; setFocusable(true); setSelected(color == accent); setContentDescription(name);
            setBackground(ModUi.touch(ModSettingsActivity.this, 0x00000000, 24));
            setAccessibilityDelegate(new View.AccessibilityDelegate() {
                @Override public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
                    super.onInitializeAccessibilityNodeInfo(host, info); info.setClassName("android.widget.RadioButton"); info.setCheckable(true); info.setChecked(color == accent);
                }
            });
        }
        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas); float x = getWidth() / 2f, y = getHeight() / 2f;
            paint.setStyle(Paint.Style.FILL); paint.setColor(color); canvas.drawCircle(x, y, dp(16), paint);
            if (color == accent || isFocused()) { paint.setStyle(Paint.Style.STROKE); paint.setStrokeWidth(dp(1.5f)); paint.setColor(ModUi.TEXT); canvas.drawCircle(x, y, dp(20), paint); }
            if (color == accent) {
                paint.setStyle(Paint.Style.STROKE); paint.setStrokeWidth(dp(2)); paint.setStrokeCap(Paint.Cap.ROUND); paint.setColor(color == 0xff007acc ? 0xffffffff : 0xff101116);
                canvas.drawLine(x - dp(5), y, x - dp(1), y + dp(4), paint); canvas.drawLine(x - dp(1), y + dp(4), x + dp(6), y - dp(4), paint);
            }
        }
    }
}
