package ru.yandex.music.mod;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Typeface;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.LinearGradient;
import android.graphics.ColorFilter;
import android.graphics.PixelFormat;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.content.res.ColorStateList;
import android.graphics.drawable.RippleDrawable;
import android.os.Build;
import android.view.View;
import java.util.HashMap;

/** Small native UI primitives sharing one palette, type scale and vector icon style. */
final class ModUi {
    static final int BG = 0xff0c0c0f, SURFACE = 0xff19191f, RAISED = 0xff292930, RED = 0xffff2d3c;
    static final int TEXT = 0xfff5f5f7, MUTED = 0xffa7a7b2, LINE = 0x12ffffff;
    static final int BACK = 0, CHEVRON = 1, SLIDERS = 2, MOON = 3, AUDIO = 4, GEAR = 5, CLOSE = 6, INFO = 7;
    static final int HISTORY = 8, CHART = 9, LIBRARY = 10, PALETTE = 11;
    private static final HashMap<Integer, Typeface> fonts = new HashMap<>();
    private static Bitmap logo;
    static Bitmap logo(Context context) {
        if (logo == null) try (java.io.InputStream input = context.getAssets().open("music-mod/desktop-logo.png")) {
            logo = BitmapFactory.decodeStream(input);
        } catch (java.io.IOException ignored) {}
        return logo;
    }
    static View mark(Context context, int size) {
        android.widget.ImageView image = new android.widget.ImageView(context);
        image.setImageBitmap(logo(context)); image.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
        image.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO); return image;
    }
    static boolean glass() { return ModRuntime.enabled("glass_ui", true) && !ModRuntime.enabled("economy", false); }
    static Drawable control(Context c, boolean selected, float radius) {
        Drawable base = glass() ? new Glass(c, selected, radius)
            : shape(c, selected ? soft(ModRuntime.accent()) : RAISED, radius, selected ? 0x70ffffff : 0);
        return new RippleDrawable(ColorStateList.valueOf(0x25ffffff), base, shape(c, 0xffffffff, radius, 0));
    }
    /** Android glass-style control: layered light and a specular rim, without per-frame blur. */
    private static final class Glass extends Drawable {
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final float radius, edge;
        private final boolean selected;
        private LinearGradient fill, rim;
        private RectF bounds = new RectF();
        Glass(Context c, boolean selected, float radius) { this.selected = selected; this.radius = dp(c, radius); edge = Math.max(1, dp(c, .6f)); }
        @Override protected void onBoundsChange(android.graphics.Rect b) {
            bounds.set(b.left + edge, b.top + edge, b.right - edge, b.bottom - edge);
            fill = new LinearGradient(b.left, b.top, b.right * .3f, b.bottom,
                new int[]{0x32ffffff, 0x0cffffff, 0x12ffffff}, new float[]{0, .48f, 1}, Shader.TileMode.CLAMP);
            rim = new LinearGradient(b.left, b.top, b.right, b.bottom,
                new int[]{0x80ffffff, 0x13ffffff, 0x08ffffff, 0x36ffffff}, new float[]{0, .35f, .7f, 1}, Shader.TileMode.CLAMP);
        }
        @Override public void draw(Canvas c) {
            int color = selected ? 0xe3443540 : 0xdc232329;
            p.setStyle(Paint.Style.FILL);
            p.setColor(color);
            p.setShader(c.isHardwareAccelerated() ? ModGlass.shader(color, radius, getBounds().width(), getBounds().height()) : fill);
            c.drawRoundRect(bounds, radius, radius, p); p.setShader(null);
            if (Build.VERSION.SDK_INT < 33) {
                p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(edge); p.setShader(rim); c.drawRoundRect(bounds, radius, radius, p); p.setShader(null);
            }
        }
        @Override public void setAlpha(int alpha) { p.setAlpha(alpha); }
        @Override public void setColorFilter(ColorFilter f) { p.setColorFilter(f); }
        @Override public int getOpacity() { return PixelFormat.TRANSLUCENT; }
    }
    static int dp(Context c, float v) { return ModRuntime.dp(c, v); }
    static Typeface face(Context c, int weight) {
        Typeface result = fonts.get(weight);
        if (result == null) {
            try {
                result = Build.VERSION.SDK_INT >= 26
                    ? new Typeface.Builder(c.getAssets(), "music-mod/Manrope.ttf").setWeight(weight)
                        .setFontVariationSettings("'wght' " + weight).build()
                    : Typeface.create("sans-serif", weight >= 600 ? Typeface.BOLD : Typeface.NORMAL);
            } catch (RuntimeException ignored) { result = Typeface.create("sans-serif", weight >= 600 ? 1 : 0); }
            fonts.put(weight, result);
        }
        return result;
    }
    static GradientDrawable shape(Context c, int color, float radius, int stroke) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color); d.setCornerRadius(dp(c, radius));
        if (stroke != 0) d.setStroke(dp(c, 1), stroke);
        return d;
    }
    static Drawable touch(Context c, int color, float radius) {
        return new RippleDrawable(ColorStateList.valueOf(0x1fffffff), shape(c, color, radius, 0), shape(c, 0xffffffff, radius, 0));
    }
    static int soft(int color) { return 0x22000000 | (color & 0xffffff); }

    static android.app.AlertDialog.Builder dialog(Context context) {
        // The host app can resolve light widget defaults even with a dark music theme.
        // Use one explicit theme for labels, adapters, checkmarks and the dialog window.
        return new android.app.AlertDialog.Builder(context, android.R.style.Theme_Material_Dialog_Alert) {
            @Override public android.app.AlertDialog create() {
                android.app.AlertDialog d = super.create(); d.setOnShowListener(event -> styleDialog(d)); return d;
            }
        };
    }
    static void styleDialog(android.app.AlertDialog dialog) {
        android.view.Window window = dialog.getWindow();
        if (window != null) {
            window.setBackgroundDrawable(shape(dialog.getContext(), SURFACE, 28, 0x20ffffff));
            window.addFlags(android.view.WindowManager.LayoutParams.FLAG_DIM_BEHIND);
            window.setDimAmount(.55f);
            styleDialogText(window.getDecorView());
        }
        android.widget.ListView list = dialog.getListView();
        if (list != null) {
            list.setDivider(null); list.setDividerHeight(0);
            list.setOnScrollListener(new android.widget.AbsListView.OnScrollListener() {
                public void onScrollStateChanged(android.widget.AbsListView view, int state) {}
                public void onScroll(android.widget.AbsListView view, int first, int visible, int total) { styleDialogText(view); }
            });
        }
        for (int id : new int[]{android.app.AlertDialog.BUTTON_POSITIVE, android.app.AlertDialog.BUTTON_NEGATIVE, android.app.AlertDialog.BUTTON_NEUTRAL}) {
            android.widget.Button button = dialog.getButton(id);
            if (button == null || button.getVisibility() != View.VISIBLE) continue;
            button.setAllCaps(false); button.setTypeface(face(button.getContext(), 600)); button.setTextSize(14);
            button.setTextColor(TEXT); button.setBackground(control(button.getContext(), false, 20));
            button.setMinHeight(dp(button.getContext(), 48)); button.setPadding(dp(button.getContext(), 16), dp(button.getContext(), 8), dp(button.getContext(), 16), dp(button.getContext(), 8));
        }
    }
    private static void styleDialogText(View view) {
        if (view instanceof android.widget.TextView) {
            android.widget.TextView text = (android.widget.TextView)view;
            text.setTextColor(TEXT); text.setTypeface(face(view.getContext(), 400));
            if (text instanceof android.widget.CheckedTextView) {
                ((android.widget.CheckedTextView)text).setCheckMarkTintList(ColorStateList.valueOf(ModRuntime.accent()));
            }
            if (!(text instanceof android.widget.Button)) text.setTextSize(16);
        }
        if (view instanceof android.view.ViewGroup) {
            android.view.ViewGroup group = (android.view.ViewGroup)view;
            for (int i = 0; i < group.getChildCount(); i++) styleDialogText(group.getChildAt(i));
        }
    }

    static final class Icon extends View {
        private final int kind, color;
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        Icon(Context c, int kind, int color) {
            super(c); this.kind = kind; this.color = color;
            setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        }
        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            canvas.save();
            float scale = Math.min(getWidth(), getHeight()) / 24f;
            canvas.translate((getWidth() - 24 * scale) / 2, (getHeight() - 24 * scale) / 2);
            canvas.scale(scale, scale);
            drawIcon(canvas, paint, kind, color);
            canvas.restore();
        }
    }
    static void drawIcon(Canvas c, Paint p, int kind, int color) {
        p.setColor(color); p.setStrokeWidth(1.8f); p.setStrokeCap(Paint.Cap.ROUND);
        p.setStrokeJoin(Paint.Join.ROUND); p.setStyle(Paint.Style.STROKE);
        Path path = new Path();
        switch (kind) {
            case BACK:
                path.moveTo(14, 5); path.lineTo(7, 12); path.lineTo(14, 19); c.drawPath(path, p); break;
            case CHEVRON:
                path.moveTo(9, 6); path.lineTo(15, 12); path.lineTo(9, 18); c.drawPath(path, p); break;
            case SLIDERS:
                c.drawLine(3, 6, 21, 6, p); c.drawLine(3, 12, 21, 12, p); c.drawLine(3, 18, 21, 18, p);
                p.setStyle(Paint.Style.FILL); p.setColor(SURFACE);
                c.drawCircle(8, 6, 3, p); c.drawCircle(16, 12, 3, p); c.drawCircle(10, 18, 3, p);
                p.setColor(color); p.setStyle(Paint.Style.STROKE);
                c.drawCircle(8, 6, 2.5f, p); c.drawCircle(16, 12, 2.5f, p); c.drawCircle(10, 18, 2.5f, p); break;
            case MOON:
                path.moveTo(20, 14); path.cubicTo(15, 16, 8, 11, 10, 4);
                path.cubicTo(1, 7, 3, 20, 12, 21); path.cubicTo(16, 21, 19, 18, 20, 14); c.drawPath(path, p); break;
            case AUDIO:
                c.drawLine(4, 10, 4, 14, p); c.drawLine(8, 6, 8, 18, p); c.drawLine(12, 3, 12, 21, p);
                c.drawLine(16, 7, 16, 17, p); c.drawLine(20, 10, 20, 14, p); break;
            case GEAR:
                c.drawCircle(12, 12, 7, p); c.drawCircle(12, 12, 2.5f, p);
                for (int i = 0; i < 8; i++) {
                    double a = i * Math.PI / 4;
                    c.drawLine(12 + (float)Math.cos(a) * 7, 12 + (float)Math.sin(a) * 7,
                               12 + (float)Math.cos(a) * 9.5f, 12 + (float)Math.sin(a) * 9.5f, p);
                } break;
            case CLOSE: c.drawLine(6, 6, 18, 18, p); c.drawLine(18, 6, 6, 18, p); break;
            case INFO: c.drawCircle(12, 12, 9, p); c.drawLine(12, 11, 12, 16, p); c.drawPoint(12, 7, p); break;
            case HISTORY:
                c.drawArc(4, 4, 21, 21, -140, 300, false, p);
                path.moveTo(3, 4); path.lineTo(3, 10); path.lineTo(9, 10); c.drawPath(path, p);
                c.drawLine(12, 7, 12, 13, p); c.drawLine(12, 13, 16, 15, p); break;
            case CHART:
                c.drawLine(4, 20, 21, 20, p); c.drawLine(6, 15, 6, 16, p);
                c.drawLine(12, 9, 12, 16, p); c.drawLine(18, 4, 18, 16, p); break;
            case LIBRARY:
                c.drawRoundRect(3, 4, 7, 20, 1, 1, p); c.drawRoundRect(10, 4, 14, 20, 1, 1, p);
                c.drawLine(17, 5, 21, 19, p); break;
            case PALETTE:
                path.moveTo(12, 3); path.cubicTo(1, 2, 0, 19, 10, 21);
                path.cubicTo(17, 23, 12, 16, 16, 15); path.cubicTo(26, 14, 22, 2, 12, 3); c.drawPath(path, p);
                c.drawPoint(7, 10, p); c.drawPoint(11, 7, p); c.drawPoint(16, 8, p); break;
        }
    }
}
