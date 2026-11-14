package ru.yandex.music.mod;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.ContextWrapper;
import android.content.SharedPreferences;
import android.content.pm.ShortcutInfo;
import android.content.pm.ShortcutManager;
import android.content.res.Configuration;
import android.graphics.Typeface;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.ColorFilter;
import android.graphics.PixelFormat;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.Icon;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.RippleDrawable;
import android.content.res.ColorStateList;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Gravity;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.Collections;
import java.util.WeakHashMap;
import java.lang.ref.WeakReference;

/** Addition to the official application, retaining its account, navigation and audio engine. */
public final class ModRuntime {
    public static final String VERSION = "0.6.4-alpha.1";
    private static Application app;
    private static SharedPreferences prefs;
    private static volatile boolean nativeMusic;
    static boolean nativeMusicActive() { return nativeMusic; }
    private static Typeface manrope;
    private static final Typeface[] faces = new Typeface[4];
    private static final String BAR_TAG = "music.mod.settings.entry";
    private static WeakReference<Activity> musicActivity = new WeakReference<>(null);

    private ModRuntime() {}

    public static synchronized void init(Application application) {
        if (app != null) return;
        app = application;
        prefs = app.getSharedPreferences("music_mod", Context.MODE_PRIVATE);
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                // The variable font defaults to its lightest axis, even with create(BOLD).
                // Set the weight axis explicitly so body text and headings stay legible.
                for (int i = 0; i < 4; i++) {
                    int weight = (i & Typeface.BOLD) != 0 ? 700 : 400;
                    faces[i] = new Typeface.Builder(app.getAssets(), "music-mod/Manrope.ttf")
                        .setWeight(weight).setItalic((i & Typeface.ITALIC) != 0)
                        .setFontVariationSettings("'wght' " + weight).build();
                }
                manrope = faces[0];
            } else {
                manrope = Typeface.createFromAsset(app.getAssets(), "music-mod/Manrope.ttf");
                for (int i = 0; i < 4; i++) faces[i] = Typeface.create(manrope, i);
            }
        } catch (RuntimeException ignored) { /* Native fonts remain available. */ }
        app.registerActivityLifecycleCallbacks(new Application.ActivityLifecycleCallbacks() {
            public void onActivityPreCreated(Activity a, Bundle state) { nativeMusic = isMusicActivity(a); }
            public void onActivityPreResumed(Activity a) { nativeMusic = isMusicActivity(a); }
            public void onActivityCreated(Activity a, Bundle state) { nativeMusic = isMusicActivity(a); }
            public void onActivityStarted(Activity a) {}
            public void onActivityResumed(Activity a) {
                nativeMusic = isMusicActivity(a);
                if (a.getClass().getName().equals("ru.yandex.music.settings.SettingsActivity")) {
                    a.getWindow().getDecorView().post(() -> addSettingsEntry(a));
                }
                if (isMusicActivity(a)) {
                    musicActivity = new WeakReference<>(a);
                    updateScreen(a);
                    installViewStyling(a);
                    a.getWindow().getDecorView().post(() -> styleView(a.getWindow().getDecorView(), new WeakHashMap<>(), 0));
                }
            }
            public void onActivityPaused(Activity a) {}
            public void onActivityStopped(Activity a) {}
            public void onActivitySaveInstanceState(Activity a, Bundle state) {}
            public void onActivityDestroyed(Activity a) {}
        });
        // A launcher long-press shortcut, without another launcher icon or an overlay.
        if (Build.VERSION.SDK_INT >= 25) {
            try {
                ShortcutManager sm = app.getSystemService(ShortcutManager.class);
                ShortcutInfo shortcut = new ShortcutInfo.Builder(app, "music_mod_settings")
                    .setShortLabel("Настройки мода")
                    .setLongLabel("Яндекс Музыка · настройки мода")
                    .setIcon(Icon.createWithResource(app, app.getApplicationInfo().icon))
                    .setIntent(new Intent(app, ModSettingsActivity.class).setAction(Intent.ACTION_VIEW))
                    .build();
                if (sm != null && !sm.isRateLimitingActive())
                    sm.addDynamicShortcuts(Collections.singletonList(shortcut));
            } catch (RuntimeException ignored) { /* Native settings entry is always retained. */ }
        }
    }

    static SharedPreferences preferences() { return prefs; }
    static boolean enabled(String key, boolean fallback) {
        return prefs == null ? fallback : prefs.getBoolean(key, fallback);
    }
    static int accent() { return prefs == null ? 0xff8b5cf6 : prefs.getInt("accent", 0xff8b5cf6); }
    static int dp(Context c, float value) {
        return Math.round(value * c.getResources().getDisplayMetrics().density);
    }

    /** Called only by the two music-account capability accessors; no real purchase is changed. */
    public static Boolean subscription(Boolean original) {
        return enabled("without_plus", true) ? Boolean.TRUE : original;
    }

    public static boolean restricted(boolean original) {
        return enabled("without_plus", true) ? false : original;
    }

    public static boolean subscriptionFlag(boolean original) {
        return enabled("without_plus", true) || original;
    }

    private static final WeakHashMap<Activity, Boolean> screenFlags = new WeakHashMap<>();
    private static void updateScreen(Activity activity) {
        boolean keep = enabled("keep_screen", false);
        if (keep && !screenFlags.containsKey(activity)) {
            boolean original = (activity.getWindow().getAttributes().flags & WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) != 0;
            screenFlags.put(activity, original);
            activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else if (!keep && screenFlags.containsKey(activity)) {
            if (!screenFlags.remove(activity)) activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    private static Activity activity(Context context) {
        while (context instanceof ContextWrapper) {
            if (context instanceof Activity) return (Activity) context;
            Context base = ((ContextWrapper) context).getBaseContext();
            if (base == context) break;
            context = base;
        }
        return null;
    }

    private static final WeakHashMap<View, Boolean> modButtons = new WeakHashMap<>();
    private static final WeakHashMap<View, Boolean> plaqueCandidates = new WeakHashMap<>();
    /** Reuses the native header button after its SDK binding, keeping its layout and position. */
    public static void decoratePlus(View view) {
        // The SDK adapter can supply a plain LinearLayout before it is attached.
        // Remember that trusted view so the first measured header can suppress it.
        plaqueCandidates.put(view, true);
        Activity owner = activity(view.getContext());
        if (owner == null) {
            Activity candidate = musicActivity.get();
            if (candidate != null && view.getRootView() == candidate.getWindow().getDecorView()) owner = candidate;
        }
        if (owner == null || !isMusicActivity(owner)) return;
        CharSequence description = view.getContentDescription();
        android.graphics.Rect badgeRect = new android.graphics.Rect();
        boolean headerPlaque = view.getGlobalVisibleRect(badgeRect) && badgeRect.left < dp(owner, 64) && badgeRect.top < dp(owner, 120)
            && badgeRect.width() >= dp(owner, 20) && badgeRect.width() <= owner.getResources().getDisplayMetrics().widthPixels * .65f
            && badgeRect.height() <= dp(owner, 64);
        if (!modButtons.containsKey(view) && !headerPlaque && !"Плюс".contentEquals(description == null ? "" : description)
            && !"Plus".contentEquals(description == null ? "" : description)) return;
        if (!modButtons.containsKey(view)) {
            modButtons.put(view, true);
            view.getViewTreeObserver().addOnPreDrawListener(() -> { hidePlaqueContent(view); return true; });
        }
        hidePlaqueContent(view);
        owner.getWindow().getDecorView().post(() -> ensureHeaderEntry(activityForHeader(view)));
    }
    private static Activity activityForHeader(View view) {
        Activity owner = activity(view.getContext());
        if (owner == null) owner = musicActivity.get();
        return owner;
    }
    private static void hidePlaqueContent(View view) {
        // Keep native measurement, but never let its async picture leak through a transparent logo.
        if (view.getAlpha() != 0) view.setAlpha(0);
        view.setClickable(false); view.setFocusable(false); view.setEnabled(false);
        view.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
        Drawable background = view.getBackground();
        if (!(background instanceof ColorDrawable) || ((ColorDrawable)background).getColor() != android.graphics.Color.TRANSPARENT)
            view.setBackgroundColor(android.graphics.Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= 23 && view.getForeground() != null) view.setForeground(null);
        if (view instanceof android.widget.ImageView && ((android.widget.ImageView)view).getDrawable() != null) ((android.widget.ImageView)view).setImageDrawable(null);
        if (view instanceof TextView && ((TextView)view).getCurrentTextColor() != android.graphics.Color.TRANSPARENT) ((TextView)view).setTextColor(android.graphics.Color.TRANSPARENT);
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup)view;
            for (int i = 0; i < group.getChildCount(); i++) {
                View child = group.getChildAt(i); if (child.getAlpha() != 0) child.setAlpha(0);
                child.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
            }
        }
    }

    /** Keeps every native activity and its base context, with a local text-size adjustment. */
    public static Context wrap(Context context) {
        SharedPreferences p = context.getSharedPreferences("music_mod", Context.MODE_PRIVATE);
        float scale = p.getInt("text_scale", 100) / 100f;
        if (!p.getBoolean("appearance", true) || scale == 1f) return context;
        Configuration configuration = new Configuration(context.getResources().getConfiguration());
        configuration.fontScale *= Math.max(.85f, Math.min(1.2f, scale));
        return context.createConfigurationContext(configuration);
    }

    /** Color hooks preserve transparency and all colors outside the native music palette. */
    public static int color(int original) {
        if (!enabled("appearance", true)) return original;
        switch (original) {
            case 0xffffff00: case 0xffffdb00: case 0xffffcc00: case 0xffffd600:
            case 0xffff5500: case 0xffd6bb00: case 0xffa332ff:
                return accent();
            default: break;
        }
        if (enabled("amoled", false) && (original == 0xff000000 || original == 0xff0d0d0d || original == 0xff141414 || original == 0xff151515)) return 0xff000000;
        if (enabled("deep_dark", true)) {
            if (original == 0xff000000 || original == 0xff0d0d0d) return 0xff0b0c10;
            if (original == 0xff141414 || original == 0xff151515) return 0xff16171e;
            if (original == 0xff1f1f1f || original == 0xff262626) return 0xff20212a;
        }
        return original;
    }

    public static Typeface font(Typeface original) {
        if (manrope == null || !enabled("appearance", true) || !enabled("manrope", true))
            return original;
        return faces[original == null ? Typeface.NORMAL : original.getStyle()];
    }

    static GradientDrawable panel(int fill, float radius, int stroke) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(fill);
        drawable.setCornerRadius(dp(app, radius));
        if (stroke != 0) drawable.setStroke(dp(app, 1), stroke);
        return drawable;
    }

    static Drawable touch(Drawable background) {
        return new RippleDrawable(ColorStateList.valueOf(0x30ffffff), background, null);
    }

    private static boolean isMusicActivity(Activity a) {
        String name = a.getClass().getName();
        String lower = name.toLowerCase(java.util.Locale.ROOT);
        return name.startsWith("ru.yandex.music.") && !name.startsWith("ru.yandex.music.mod.")
            && !lower.contains("passport") && !lower.contains("auth") && !lower.contains("login")
            && !lower.contains("startup") && !lower.contains("onboarding") && !lower.contains("intro");
    }

    private static void addSettingsEntry(Activity a) {
        if (a.isFinishing() || a.isDestroyed()) return;
        ViewGroup content = a.findViewById(android.R.id.content);
        if (content == null || content.getChildCount() == 0 || content.findViewWithTag(BAR_TAG) != null) return;
        if (!(content instanceof FrameLayout)) return;
        // Never detach/reparent the native Fragment/Compose hierarchy on resume.
        // Its composition and lifecycle-bound loading must retain the original owner.
        FrameLayout entry = new FrameLayout(a); entry.setTag(BAR_TAG);
        entry.setBackground(ModUi.control(a, false, 24));
        entry.addView(ModUi.mark(a, 28), new FrameLayout.LayoutParams(dp(a, 28), dp(a, 28), Gravity.CENTER));
        entry.setFocusable(true); entry.setContentDescription("Настройки мода");
        entry.setOnClickListener(v -> a.startActivity(new Intent(a, ModSettingsActivity.class)));
        FrameLayout.LayoutParams p = new FrameLayout.LayoutParams(dp(a, 48), dp(a, 48), Gravity.TOP | Gravity.END);
        p.setMarginEnd(dp(a, 12)); p.topMargin = dp(a, 4);
        android.view.WindowInsets insets = content.getRootWindowInsets();
        if (insets != null) {
            int[] origin = new int[2]; content.getLocationOnScreen(origin);
            p.topMargin += Math.max(0, insets.getSystemWindowInsetTop() - origin[1]);
        }
        content.addView(entry, p);
    }

    private static final WeakHashMap<Activity, Boolean> observed = new WeakHashMap<>();
    private static void installViewStyling(Activity a) {
        if (observed.containsKey(a)) return;
        observed.put(a, true);
        View decor = a.getWindow().getDecorView();
        WeakHashMap<View, Boolean> styled = new WeakHashMap<>();
        Runnable pass = () -> {
            if (!a.isFinishing() && !a.isDestroyed() && !ModBottomNav.isAnimating(a)) { styleView(decor, styled, 0); ensureHeaderEntry(a); ModBottomNav.sync(a); }
        };
        decor.getViewTreeObserver().addOnGlobalLayoutListener(() -> {
            decor.removeCallbacks(pass);
            decor.postDelayed(pass, 80);
        });
        final long[] lastNavigation = {0};
        decor.getViewTreeObserver().addOnPreDrawListener(() -> {
            long now = android.os.SystemClock.uptimeMillis();
            // Do not walk Compose semantics twenty times a second while the bar animates.
            if (now - lastNavigation[0] >= 160 && !a.isFinishing() && !a.isDestroyed() && !ModBottomNav.isAnimating(a)) {
                lastNavigation[0] = now;
                ModBottomNav.sync(a); ensureHeaderEntry(a);
            }
            return true;
        });
        decor.post(pass);
    }

    /** Some native home modes omit the Plus plaque entirely. Keep the mod entry in the header. */
    private static void ensureHeaderEntry(Activity a) {
        if (a == null || !a.getClass().getName().equals("ru.yandex.music.main.MainScreenActivity")) return;
        // Bind callbacks may precede Activity.onResume and the first View measurement.
        // Only views registered by the Plus SDK path are candidates, never arbitrary avatars.
        android.graphics.Rect sdkBounds = new android.graphics.Rect();
        View decor = a.getWindow().getDecorView();
        for (View candidate : plaqueCandidates.keySet()) {
            if (candidate == null || candidate.getRootView() != decor || !candidate.getGlobalVisibleRect(sdkBounds)) continue;
            if (sdkBounds.left >= dp(a, 64) || sdkBounds.top >= dp(a, 120) || sdkBounds.width() < dp(a, 20)
                || sdkBounds.width() > a.getResources().getDisplayMetrics().widthPixels * .65f || sdkBounds.height() > dp(a, 64)) continue;
            if (!modButtons.containsKey(candidate)) {
                modButtons.put(candidate, true);
                candidate.getViewTreeObserver().addOnPreDrawListener(() -> { hidePlaqueContent(candidate); return true; });
            }
            hidePlaqueContent(candidate);
        }
        ViewGroup content = a.findViewById(android.R.id.content);
        if (!(content instanceof FrameLayout)) return;
        View entry = content.findViewWithTag("music.mod.header");
        boolean mountedPlaque = false;
        android.graphics.Rect plaqueBounds = new android.graphics.Rect();
        for (View plaque : modButtons.keySet()) {
            if (plaque != null && plaque.getRootView() == content.getRootView() && plaque.isShown()
                && plaque.getGlobalVisibleRect(plaqueBounds) && plaqueBounds.width() > 0 && plaqueBounds.left < dp(a, 64) && plaqueBounds.top < dp(a, 120)) { mountedPlaque = true; break; }
        }
        boolean show = ModBottomNav.isHome(a) && !ModBottomNav.headerOnRight(a)
            && (mountedPlaque || ModNativeUi.hasHeaderSearch(content)) && !hasPlayerClose(content, 0);
        if (!show) { if (entry != null && entry.getVisibility() != View.GONE) entry.setVisibility(View.GONE); return; }
        if (entry == null) {
            FrameLayout button = new FrameLayout(a); button.setTag("music.mod.header");
            button.addView(ModUi.mark(a, 32), new FrameLayout.LayoutParams(dp(a, 32), dp(a, 32), Gravity.CENTER));
            button.setBackground(ModUi.touch(a, 0x00000000, 24)); button.setFocusable(true);
            button.setContentDescription("Настройки мода");
            if (Build.VERSION.SDK_INT >= 26) button.setTooltipText("Настройки мода");
            button.setOnClickListener(v -> a.startActivity(new Intent(a, ModSettingsActivity.class)));
            button.setAccessibilityDelegate(new View.AccessibilityDelegate() {
                @Override public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
                    super.onInitializeAccessibilityNodeInfo(host, info); info.setClassName("android.widget.Button");
                }
            });
            FrameLayout.LayoutParams p = new FrameLayout.LayoutParams(dp(a, 48), dp(a, 48), Gravity.TOP | Gravity.START);
            p.setMarginStart(dp(a, 8)); p.topMargin = dp(a, 4);
            android.view.WindowInsets insets = content.getRootWindowInsets();
            if (insets != null) {
                int[] origin = new int[2]; content.getLocationOnScreen(origin);
                p.topMargin += Math.max(0, insets.getSystemWindowInsetTop() - origin[1]);
            }
            content.addView(button, p); button.setElevation(dp(a, 4)); entry = button;
        }
        if (entry.getVisibility() != View.VISIBLE) entry.setVisibility(View.VISIBLE);
        FrameLayout.LayoutParams placement = (FrameLayout.LayoutParams)entry.getLayoutParams();
        int edge = ModBottomNav.headerOnRight(a) && !mountedPlaque ? Gravity.END : Gravity.START;
        int wantedGravity = Gravity.TOP | edge;
        if (placement.gravity != wantedGravity) {
            placement.gravity = wantedGravity;
            placement.setMarginStart(edge == Gravity.START ? dp(a, 8) : 0);
            placement.setMarginEnd(edge == Gravity.END ? dp(a, 56) : 0);
            entry.setLayoutParams(placement);
        }
        if (content.indexOfChild(entry) != content.getChildCount() - 1) entry.bringToFront();
    }
    private static boolean hasPlayerClose(View view, int depth) {
        if (depth > 35 || !view.isShown() || "music.mod.header".equals(view.getTag())) return false;
        if ("androidx.compose.ui.platform.AndroidComposeView".equals(view.getClass().getName()) && ModNativeUi.hasBackAction(view)) return true;
        CharSequence label = view.getContentDescription();
        if (label != null && ("Свернуть".contentEquals(label) || "Закрыть плеер".contentEquals(label) || "Collapse player".contentEquals(label))) return true;
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup)view;
            for (int i = 0; i < group.getChildCount(); i++) if (hasPlayerClose(group.getChildAt(i), depth + 1)) return true;
        }
        return false;
    }

    private static final WeakHashMap<View, Drawable> nativeBackgrounds = new WeakHashMap<>();
    private static final WeakHashMap<TextView, ColorStateList> nativeTextColors = new WeakHashMap<>();
    public static void styleNativeButton(View view) {
        if (!(view instanceof android.widget.Button) && !(view instanceof android.widget.ImageButton)) return;
        if (view instanceof android.widget.CompoundButton) return;
        boolean use = nativeMusic && enabled("appearance", true) && ModUi.glass();
        int left = view.getPaddingLeft(), top = view.getPaddingTop(), right = view.getPaddingRight(), bottom = view.getPaddingBottom();
        if (use && !nativeBackgrounds.containsKey(view)) {
            nativeBackgrounds.put(view, view.getBackground()); view.setBackground(ModUi.control(view.getContext(), view.isSelected(), 24));
            if (view instanceof TextView) {
                TextView text = (TextView)view; nativeTextColors.put(text, text.getTextColors());
                text.setTextColor(new ColorStateList(new int[][]{new int[]{-android.R.attr.state_enabled}, new int[]{}}, new int[]{0xff777781, ModUi.TEXT}));
            }
        } else if (!use && nativeBackgrounds.containsKey(view)) {
            view.setBackground(nativeBackgrounds.remove(view));
            if (view instanceof TextView && nativeTextColors.containsKey(view)) ((TextView)view).setTextColor(nativeTextColors.remove(view));
        }
        view.setPadding(left, top, right, bottom);
    }

    private static void styleView(View view, WeakHashMap<View, Boolean> styled, int depth) {
        if (depth > 40) return;
        styleNativeButton(view);
        if (view.getClass().getName().startsWith("com.yandex.plus.plaquesdk.widget."))
            if (!modButtons.containsKey(view)) decoratePlus(view);
        if (!styled.containsKey(view)) {
            styled.put(view, true);
            if (view instanceof TextView) {
                TextView text = (TextView) view;
                text.setTypeface(font(text.getTypeface()));
                int current = text.getCurrentTextColor();
                if (color(current) != current) text.setTextColor(color(current));
            }
            if (view.getBackground() instanceof ColorDrawable) {
                int current = ((ColorDrawable) view.getBackground()).getColor();
                if (color(current) != current) view.setBackgroundColor(color(current));
            }
        }
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) styleView(group.getChildAt(i), styled, depth + 1);
        }
    }
}
