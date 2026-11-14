package ru.yandex.music.mod;

import android.animation.ValueAnimator;
import android.app.Activity;
import android.graphics.*;
import android.os.Bundle;
import android.view.*;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.FrameLayout;
import java.lang.reflect.*;

/** A presentation for the original tab controller, not a second navigation stack. */
final class ModBottomNav extends FrameLayout {
    private static final String TAG = "music.mod.navigation";
    private final Activity owner;
    private final View original;
    private final Paint paint = new Paint(3);
    private final RectF rect = new RectF();
    private final View[] tabs = new View[2];
    private Object home, collection;
    private Method navigate, selectedTab;
    private Field navigationListener;
    private Method selectNativeTab;
    private int selection = -1;
    private final NavMotion motion = new NavMotion();
    private View indicator, labels;
    private boolean moving;
    private long frameTime;
    private final Choreographer.FrameCallback motionFrame = this::onMotionFrame;
    private final NavRequests requests = new NavRequests();
    private final Runnable dispatchTask = this::dispatchNavigation;
    private final Runnable settleTask = this::settleNavigation;
    private long flightStarted, stableSince;
    private View stableView;
    private Method currentFragment, fragmentView, fragmentResumed;
    private Class<?> waveFragment, collectionFragment;
    private final float density;

    static boolean isAnimating(Activity activity) {
        ViewGroup root = activity.findViewById(android.R.id.content);
        View bar = root == null ? null : root.findViewWithTag(TAG);
        return bar instanceof ModBottomNav && ((ModBottomNav)bar).moving;
    }

    static boolean isHome(Activity activity) {
        View bar = activity.findViewById(0x7f0a00e5);
        if (bar == null) return false;
        try {
            Object tab = bar.getClass().getMethod("getSelectedTab").invoke(bar);
            return tab instanceof Enum<?> && "WAVE".equals(((Enum<?>)tab).name());
        } catch (ReflectiveOperationException | RuntimeException ignored) { return false; }
    }
    static boolean headerOnRight(Activity activity) {
        View bar = activity.findViewById(0x7f0a00e5);
        if (bar == null) return false;
        try { Object tab = bar.getClass().getMethod("getSelectedTab").invoke(bar); return tab instanceof Enum<?> && "LANDING".equals(((Enum<?>)tab).name()); }
        catch (ReflectiveOperationException ignored) { return false; }
    }

    static void sync(Activity activity) {
        ViewGroup root = activity.findViewById(android.R.id.content);
        View nativeBar = activity.findViewById(0x7f0a00e5);
        if (!(root instanceof FrameLayout) || nativeBar == null || !"b7k".equals(nativeBar.getClass().getName())) return;
        ModBottomNav bar = (ModBottomNav) root.findViewWithTag(TAG);
        if (bar == null) {
            try {
                bar = new ModBottomNav(activity, nativeBar);
                root.addView(bar, new FrameLayout.LayoutParams(-1, bar.height(), Gravity.BOTTOM));
                bar.setElevation(ModRuntime.dp(activity, 16));
            } catch (ReflectiveOperationException | RuntimeException e) {
                android.util.Log.w("MusicModNav", "Native tab binding unavailable", e); return;
            }
        }
        // No reflection, semantics scans or anchor layout changes while the pill moves.
        if (bar.moving) return;
        boolean visible = nativeBar.getVisibility() != GONE && nativeBar.getParent() instanceof View
            && ((View)nativeBar.getParent()).isShown() && !ModNativeUi.hasPlayer(root);
        bar.setVisibility(visible ? VISIBLE : GONE);
        nativeBar.setAlpha(0);
        if (nativeBar.getVisibility() == VISIBLE) nativeBar.setVisibility(INVISIBLE);
        nativeBar.setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
        // Retain the native anchor so the mini-player and scroll insets stay above the bar.
        ViewGroup.LayoutParams lp = nativeBar.getLayoutParams();
        if (lp.height != bar.height()) { lp.height = bar.height(); nativeBar.setLayoutParams(lp); }
        ViewGroup.LayoutParams own = bar.getLayoutParams();
        if (own.height != bar.height()) { own.height = bar.height(); bar.setLayoutParams(own); }
        try {
            int selected = bar.actualTab();
            // A native tab flag changes before its Fragment transaction commits.
            // Never use that flag as acknowledgement of an unfinished navigation.
            if (!bar.requests.pending() && selected >= 0) bar.select(selected, true);
        }
        catch (ReflectiveOperationException ignored) {}
    }

    private ModBottomNav(Activity activity, View nativeBar) throws ReflectiveOperationException {
        super(activity); owner = activity; original = nativeBar; setTag(TAG); setWillNotDraw(false);
        density = getResources().getDisplayMetrics().density;
        Class<?> type = Class.forName("yz3");
        home = type.getField("l").get(null); collection = type.getField("k").get(null);
        if (activity.getClass().getName().equals("ru.yandex.music.main.MainScreenActivity")) {
            navigate = activity.getClass().getMethod("K", type, Bundle.class);
            currentFragment = activity.getClass().getMethod("I");
            Class<?> fragment = Class.forName("androidx.fragment.app.o");
            fragmentView = fragment.getMethod("getView");
            fragmentResumed = fragment.getMethod("isResumed");
            waveFragment = Class.forName("oyx"); collectionFragment = Class.forName("jo5");
        } else {
            navigationListener = nativeBar.getClass().getField("i");
            selectNativeTab = Class.forName("v6k").getMethod("c", type);
        }
        selectedTab = nativeBar.getClass().getMethod("getSelectedTab");
        indicator = new View(activity);
        android.graphics.drawable.GradientDrawable material = new android.graphics.drawable.GradientDrawable(
            android.graphics.drawable.GradientDrawable.Orientation.TOP_BOTTOM,
            new int[]{0x40ffffff, 0x19ffffff, 0x25ffffff});
        material.setCornerRadius(px(22)); material.setStroke(Math.max(1, px(.6f)), 0x48ffffff);
        indicator.setBackground(material); indicator.setPivotX(0);
        indicator.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        indicator.setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        addView(indicator);
        labels = new View(activity) { @Override protected void onDraw(Canvas canvas) { drawLabels(canvas); } };
        labels.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        labels.setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        addView(labels);
        for (int i = 0; i < 2; i++) {
            final int index = i;
            View target = new View(activity);
            target.setContentDescription(i == 0 ? "Главная" : "Коллекция");
            target.setFocusable(true); target.setClickable(true);
            // One moving selection surface. The former full-cell ripple looked like
            // a second, stationary capsule lighting up underneath the moving pill.
            if (android.os.Build.VERSION.SDK_INT >= 26) target.setDefaultFocusHighlightEnabled(false);
            target.setOnFocusChangeListener((view, focused) -> labels.invalidate());
            target.setOnClickListener(v -> {
                if (requests.desired == index) return;
                requests.request(index);
                select(index, true);
                v.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK);
                if (!moving) scheduleNavigation();
            });
            target.setAccessibilityDelegate(new View.AccessibilityDelegate() {
                @Override public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
                    super.onInitializeAccessibilityNodeInfo(host, info);
                    info.setClassName("android.widget.Button"); info.setSelected(selection == index);
                }
            });
            tabs[i] = target; addView(target, new FrameLayout.LayoutParams(-1, px(56)));
        }
        select(selectedTab.invoke(nativeBar) == collection ? 1 : 0, false);
    }

    private int px(float dp) { return Math.round(dp * density); }
    private int height() {
        WindowInsets insets = owner.getWindow().getDecorView().getRootWindowInsets();
        return px(68) + (insets == null ? 0 : insets.getSystemWindowInsetBottom());
    }
    private void select(int value, boolean animate) {
        if (selection == value) return;
        int previous = selection; selection = value;
        for (int i = 0; i < 2; i++) if (tabs[i] != null) tabs[i].setSelected(i == value);
        labels.invalidate();
        if (!animate || previous < 0 || !ValueAnimator.areAnimatorsEnabled() || ModRuntime.enabled("economy", false)) {
            Choreographer.getInstance().removeFrameCallback(motionFrame);
            moving = false; motion.snap(value); applyMotion(); return;
        }
        motion.target(value);
        // A reversal changes only the target: position and velocity stay continuous.
        if (!moving) {
            moving = true; frameTime = 0;
            Choreographer.getInstance().postFrameCallback(motionFrame);
        }
    }
    private void onMotionFrame(long time) {
        if (!moving || !isAttachedToWindow()) return;
        double elapsed = frameTime == 0 ? 0 : (time - frameTime) / 1_000_000_000.0;
        frameTime = time;
        moving = motion.step(elapsed);
        applyMotion();
        if (moving) Choreographer.getInstance().postFrameCallback(motionFrame);
        else {
            // Let the final capsule frame present before Compose rebuilds the page.
            scheduleNavigation();
        }
    }
    private void applyMotion() {
        float width = indicator.getWidth(); if (width <= 0) return;
        float span = getWidth() - px(40);
        float stretch = Math.min(width * .09f, (float)Math.abs(motion.velocity) * width * .012f);
        float pillWidth = width + stretch;
        float start = (float)motion.position * (span / 2) - stretch / 2;
        start = Math.max(0, Math.min(span - pillWidth, start));
        indicator.setTranslationX(start); indicator.setScaleX(pillWidth / width);
    }
    private void scheduleNavigation() {
        removeCallbacks(dispatchTask);
        postOnAnimation(dispatchTask);
    }
    private int actualTab() throws ReflectiveOperationException {
        Object tab = selectedTab.invoke(original);
        return tab == home ? 0 : tab == collection ? 1 : -1;
    }
    private View readyFragment(int tab) throws ReflectiveOperationException {
        Object fragment = currentFragment.invoke(owner);
        Class<?> expected = tab == 0 ? waveFragment : collectionFragment;
        if (!expected.isInstance(fragment) || !Boolean.TRUE.equals(fragmentResumed.invoke(fragment))) return null;
        View view = (View)fragmentView.invoke(fragment);
        return view != null && view.isAttachedToWindow() && view.isShown() ? view : null;
    }
    private void dispatchNavigation() {
        if (moving || !requests.pending() || requests.inFlight >= 0 || !isAttachedToWindow() || owner.isFinishing()) return;
        if (!owner.hasWindowFocus()) { requests.cancel(); return; }
        try {
            int actual = actualTab();
            // If the user returns to the page which is already on screen, the pill
            // can return on its own; do not re-create the Wave/GL surface.
            if (navigate != null && actual == requests.desired) { requests.cancel(); return; }
            if (navigate != null && actual >= 0 && readyFragment(actual) == null) {
                removeCallbacks(dispatchTask); postDelayed(dispatchTask, 80); return;
            }
            int destinationTab = requests.take(actual, navigate == null);
            if (destinationTab < 0) return;
            Object destination = destinationTab == 0 ? home : collection;
            flightStarted = android.os.SystemClock.uptimeMillis(); stableView = null; stableSince = 0;
            Object listener = navigationListener == null ? null : navigationListener.get(original);
            boolean accepted = navigate != null ? Boolean.TRUE.equals(navigate.invoke(owner, destination, null))
                : listener != null && Boolean.TRUE.equals(selectNativeTab.invoke(listener, destination));
            if (!accepted) {
                requests.cancel(); if (actual >= 0) select(actual, false);
            } else { removeCallbacks(settleTask); postDelayed(settleTask, 80); }
        } catch (ReflectiveOperationException error) {
            requests.cancel();
            android.util.Log.w("MusicModNav", "Tab selection failed", error);
        }
    }
    private void settleNavigation() {
        if (requests.inFlight < 0 || !isAttachedToWindow() || owner.isFinishing()) return;
        if (!owner.hasWindowFocus()) { requests.cancel(); return; }
        try {
            long now = android.os.SystemClock.uptimeMillis();
            int actual = actualTab();
            View ready = navigate == null ? original : readyFragment(requests.inFlight);
            boolean committed = actual == requests.inFlight && ready != null;
            if (committed && ready == stableView && now - stableSince >= 80) {
                requests.complete(); stableView = null;
                if (!moving && requests.pending()) scheduleNavigation();
                return;
            }
            if (!committed || ready != stableView) { stableView = committed ? ready : null; stableSince = now; }
            if (now - flightStarted > 2500) {
                // No blind retry: replacing a half-resumed Wave can destroy its surface.
                requests.cancel(); if (actual >= 0) select(actual, false); return;
            }
            postDelayed(settleTask, 80);
        } catch (ReflectiveOperationException error) {
            requests.cancel(); android.util.Log.w("MusicModNav", "Tab completion unavailable", error);
        }
    }
    @Override protected void onLayout(boolean changed, int l, int t, int r, int b) {
        float margin = px(20), width = (getWidth() - 2 * margin) / 2;
        for (int i = 0; i < 2; i++) tabs[i].layout(Math.round(margin + i * width), px(14), Math.round(margin + (i + 1) * width), px(66));
        indicator.layout(px(20), px(18), px(20) + Math.round(width), px(62));
        labels.layout(0, 0, getWidth(), getHeight());
        applyMotion();
    }
    @Override protected void onDraw(Canvas c) {
        super.onDraw(c);
        float left = px(16), top = px(14), right = getWidth() - left, bottom = px(66);
        rect.set(left, top, right, bottom);
        paint.setShader(null); paint.setColor(0xee202126);
        if (ModUi.glass() && c.isHardwareAccelerated()) {
            long size = ((long)Float.floatToRawIntBits(rect.width()) << 32) | (Float.floatToRawIntBits(rect.height()) & 0xffffffffL);
            paint.setShader(ModGlass.shader(0xe8292a30, px(26), size));
        }
        c.save(); c.translate(left, top); c.drawRoundRect(0, 0, rect.width(), rect.height(), px(26), px(26), paint); c.restore();
        paint.setShader(null);
    }
    private void drawLabels(Canvas c) {
        float innerLeft = px(20), cell = (getWidth() - px(40)) / 2f;
        for (int i = 0; i < 2; i++) {
            float x = innerLeft + cell * (i + .5f), y = px(32);
            float active = selection == i ? 1 : 0;
            int r = Math.round(Color.red(ModUi.MUTED) + active * (Color.red(ModUi.TEXT) - Color.red(ModUi.MUTED)));
            int g = Math.round(Color.green(ModUi.MUTED) + active * (Color.green(ModUi.TEXT) - Color.green(ModUi.MUTED)));
            int b = Math.round(Color.blue(ModUi.MUTED) + active * (Color.blue(ModUi.TEXT) - Color.blue(ModUi.MUTED)));
            paint.setColor(Color.rgb(r, g, b));
            paint.setStrokeWidth(px(1.8f)); paint.setStrokeCap(Paint.Cap.ROUND); paint.setStrokeJoin(Paint.Join.ROUND); paint.setStyle(Paint.Style.STROKE);
            if (i == 0) {
                Path path = new Path(); path.moveTo(x-px(9), y); path.lineTo(x, y-px(7)); path.lineTo(x+px(9), y);
                path.moveTo(x-px(6), y-px(1)); path.lineTo(x-px(6), y+px(9)); path.lineTo(x+px(6), y+px(9)); path.lineTo(x+px(6), y-px(1)); c.drawPath(path, paint);
            } else {
                c.drawRoundRect(x-px(8), y-px(7), x+px(8), y+px(9), px(2), px(2), paint);
                c.drawLine(x-px(3), y-px(7), x-px(3), y+px(9), paint);
                c.drawLine(x+px(2), y-px(2), x+px(5), y-px(2), paint);
            }
            paint.setStyle(Paint.Style.FILL); paint.setTypeface(ModUi.face(owner, 600)); paint.setTextSize(px(11)); paint.setTextAlign(Paint.Align.CENTER);
            c.drawText(i == 0 ? "Главная" : "Коллекция", x, px(57), paint);
            if (tabs[i].isFocused()) {
                paint.setStyle(Paint.Style.STROKE); paint.setStrokeWidth(px(1)); paint.setColor(ModUi.TEXT);
                c.drawRoundRect(innerLeft + cell * i + px(2), px(16), innerLeft + cell * (i + 1) - px(2), px(64), px(22), px(22), paint);
                paint.setStyle(Paint.Style.FILL);
            }
        }
    }
    @Override protected void onDetachedFromWindow() {
        Choreographer.getInstance().removeFrameCallback(motionFrame);
        removeCallbacks(dispatchTask); removeCallbacks(settleTask); requests.cancel(); stableView = null;
        moving = false; motion.snap(Math.max(0, selection));
        super.onDetachedFromWindow();
    }
}
