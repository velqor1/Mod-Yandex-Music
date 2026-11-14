package ru.yandex.music.mod;

import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.RuntimeShader;
import android.graphics.Shader;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.BitmapShader;
import android.os.Build;
import android.util.LruCache;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Shared material used by the original Compose controls and the native mod controls. */
public final class ModGlass {
    private static final java.util.WeakHashMap<Shader, Boolean> owned = new java.util.WeakHashMap<>();
    private static synchronized boolean ours(Shader shader) { return shader != null && owned.containsKey(shader); }
    private static final LruCache<String, Shader> shaders = new LruCache<>(96);
    private static final Pattern NUMBER = Pattern.compile("[-+]?[0-9]*\\.?[0-9]+");
    private static boolean shaderFailed;
    private static int applied;
    private static final ThreadLocal<Paint> scratch = new ThreadLocal<Paint>() { @Override protected Paint initialValue() { return new Paint(); } };
    private static final java.util.HashSet<String> observed = new java.util.HashSet<>();
    private static final String PROGRAM =
        "uniform float2 size; uniform float2 inset; uniform float radius; uniform float density; layout(color) uniform half4 tint; " +
        "half4 main(float2 p) { float2 area=size-inset*2.0; float2 local=p-inset; float r=min(radius,min(area.x,area.y)*0.5); " +
        "float2 q=abs(local-area*0.5)-(area*0.5-r); float sd=length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; " +
        "float edge=1.0-smoothstep(0.0,1.1*density,abs(sd+0.7*density)); " +
        "float top=pow(clamp(1.0-p.y/max(size.y,1.0),0.0,1.0),3.0); " +
        "float shine=0.035*exp(-pow((p.x/max(size.x,1.0)+p.y/max(size.y,1.0)*0.4-0.1)*2.0,2.0)); " +
        "half3 rgb=mix(tint.rgb,half3(1.0),half(clamp(edge*(0.23+0.24*top)+top*0.085+shine,0.0,0.55))); " +
        "half alpha=half(clamp(tint.a+edge*0.12,0.0,1.0)*(1.0-smoothstep(-0.6*density,0.5*density,sd))); return half4(rgb*alpha,alpha); }";

    private ModGlass() {}
    public static void drawRect(Canvas canvas, float left, float top, float right, float bottom, Paint paint) {
        if (!canvas.isHardwareAccelerated()) {
            Paint fallback = softwarePaint(paint);
            canvas.drawRect(left, top, right, bottom, fallback); return;
        }
        float w = right - left, h = bottom - top, dp = density();
        int color = paint.getColor();
        int max = Math.max(Color.red(color), Math.max(Color.green(color), Color.blue(color)));
        int min = Math.min(Color.red(color), Math.min(Color.green(color), Color.blue(color)));
        boolean surface = max - min < 42 || (color & 0xffffff) == (ModRuntime.accent() & 0xffffff);
        if (ModRuntime.nativeMusicActive() && ModRuntime.enabled("appearance", true) && ModUi.glass()
            && paint.getStyle() == Paint.Style.FILL && paint.getAlpha() >= 180 && !ours(paint.getShader()) && surface
            && h >= 32 * dp && h <= 100 * dp && w >= 180 * dp && w / h > 3) {
            drawRoundRect(canvas, left, top, right, bottom, 20 * dp, 20 * dp, paint);
        } else canvas.drawRect(left, top, right, bottom, paint);
    }
    /** Covers controls drawn directly by Compose Canvas instead of Modifier.background. */
    public static void drawRoundRect(Canvas canvas, float left, float top, float right, float bottom, float rx, float ry, Paint original) {
        if (!canvas.isHardwareAccelerated()) {
            canvas.drawRoundRect(left, top, right, bottom, rx, ry, softwarePaint(original)); return;
        }
        float w = right - left, h = bottom - top, dp = density();
        Shader existing = original.getShader();
        boolean dimensions = h >= 24 * dp && h <= 120 * dp && w >= 32 * dp
            && ((w / h > 2 && h <= 76 * dp) || (w <= 96 * dp && h <= 96 * dp));
        if (!ModRuntime.nativeMusicActive() || !ModRuntime.enabled("appearance", true) || !ModUi.glass()
            || original.getStyle() != Paint.Style.FILL || original.getAlpha() < 180 || !dimensions
            || ours(existing)
            || (existing instanceof BitmapShader && w / h < 2.5f)) {
            canvas.drawRoundRect(left, top, right, bottom, rx, ry, original); return;
        }
        Shader material;
        if (existing != null) {
            long size = ((long)Float.floatToIntBits(w) << 32) | (Float.floatToIntBits(h) & 0xffffffffL);
            material = overlay(existing, Math.min(rx, ry), size);
        } else {
            int color = original.getColor();
            int max = Math.max(Color.red(color), Math.max(Color.green(color), Color.blue(color)));
            int min = Math.min(Color.red(color), Math.min(Color.green(color), Color.blue(color)));
            boolean neutral = max - min < 42;
            boolean accent = (color & 0xffffff) == (ModRuntime.accent() & 0xffffff) || (color & 0xffffff) == 0xffdb00 || (color & 0xffffff) == 0xffff00;
            if (!neutral && !accent) { canvas.drawRoundRect(left, top, right, bottom, rx, ry, original); return; }
            color = ModRuntime.color(color);
            if (neutral && !(max > 225 && Color.alpha(color) > 220)) {
                int shade = Math.max(28, Math.min(64, max)); color = Color.argb(220, shade, shade, shade + 5);
            }
            material = shader(color, Math.min(rx, ry), w, h);
        }
        if (material == existing) { canvas.drawRoundRect(left, top, right, bottom, rx, ry, original); return; }
        Paint paint = scratch.get(); paint.set(original); paint.setColor(Color.WHITE); paint.setAlpha(original.getAlpha()); paint.setShader(material);
        int saved = canvas.save();
        try { canvas.translate(left, top); canvas.drawRoundRect(0, 0, w, h, rx, ry, paint); }
        finally { canvas.restoreToCount(saved); paint.setShader(null); }
    }
    private static Paint softwarePaint(Paint original) {
        if (!ours(original.getShader())) return original;
        Paint fallback = new Paint(original); fallback.setShader(null); fallback.setColor(0xe8292a30); return fallback;
    }
    public static boolean wrapGradient(Object brush, Object shape) {
        if (!ModRuntime.nativeMusicActive() || !ModRuntime.enabled("appearance", true) || !ModUi.glass() || shape == null) return false;
        String kind = shape.getClass().getName() + "/" + (brush == null ? "color" : brush.getClass().getName());
        if (observed.size() < 20 && observed.add(kind)) android.util.Log.i("MusicModGlass", "Native material: " + kind);
        return "cwq".equals(shape.getClass().getName()) && brush != null
            && ("wmh".equals(brush.getClass().getName()) || "tr0".equals(brush.getClass().getName()));
    }
    public static synchronized Shader overlay(Shader original, float corner, long packedSize) {
        float w = Float.intBitsToFloat((int)(packedSize >>> 32)), h = Float.intBitsToFloat((int)packedSize);
        float dp = density();
        // Functional strips and small controls; album/artist artwork retains its native shader.
        if (original == null || !Float.isFinite(w) || !Float.isFinite(h) || w < 1 || h < 1
            || !(h <= 120 * dp && (w / h > 2.5f || (w <= 96 * dp && h <= 96 * dp)))) return original;
        float radius = corner < 0 ? Math.min(w, h) * -corner : corner;
        String key = "overlay:" + System.identityHashCode(original) + ":" + w + ":" + h + ":" + radius;
        Shader cached = shaders.get(key); if (cached != null) return cached;
        if (Build.VERSION.SDK_INT >= 33 && !shaderFailed) try {
            String program = PROGRAM.replace("layout(color) uniform half4 tint;", "uniform shader backdrop;")
                .replace("half3 rgb=mix(tint.rgb,", "half4 source=backdrop.eval(p); half4 tint=half4(source.rgb/max(source.a,half(0.001)),source.a); half3 rgb=mix(tint.rgb,");
            RuntimeShader glass = new RuntimeShader(program); glass.setInputShader("backdrop", original);
            glass.setFloatUniform("size", w, h); glass.setFloatUniform("inset", 0, 0);
            glass.setFloatUniform("radius", radius); glass.setFloatUniform("density", dp);
            owned.put(glass, true); shaders.put(key, glass); return glass;
        } catch (RuntimeException error) { android.util.Log.w("MusicModGlass", "Gradient glass unavailable; keeping native gradient"); }
        return original;
    }
    public static int eligible(long packed, Object brush, Object shape) {
        if (!ModRuntime.nativeMusicActive() || !ModRuntime.enabled("appearance", true) || !ModUi.glass()) return 0;
        // Native rounded shapes retain their original outline, clipping, hit target and ripple.
        if (shape == null) return 0;
        boolean rounded = "cwq".equals(shape.getClass().getName());
        // RectangleShape is also used by tab rows, masks, full screens and scrims.
        // Turning it into an inset capsule paints a second control under its children.
        if (!rounded) return 0;
        if (brush != null) {
            // A real album/artist gradient is content; leave it intact.
            if (!"gnt".equals(brush.getClass().getName())) return 0;
            try { packed = brush.getClass().getField("a").getLong(brush); }
            catch (ReflectiveOperationException ignored) { return 0; }
        }
        if (observed.size() < 20 && observed.add("color:" + Long.toHexString(packed))) android.util.Log.i("MusicModGlass", "Native color: " + Long.toHexString(packed));
        if ((packed & 0xffffffffL) != 0) return 0; // Unspecified and non-sRGB colors keep the native path.
        int color = (int)(packed >>> 32), alpha = Color.alpha(color);
        if (alpha < 18) return 0; // Do not make invisible or disabled surfaces conspicuous.
        int max = Math.max(Color.red(color), Math.max(Color.green(color), Color.blue(color)));
        int min = Math.min(Color.red(color), Math.min(Color.green(color), Color.blue(color)));
        boolean neutral = max - min < 42;
        boolean accent = (color & 0xffffff) == (ModRuntime.accent() & 0xffffff)
            || (color & 0xffffff) == 0xffdb00 || (color & 0xffffff) == 0xffff00;
        if (!neutral && !accent) return 0;
        color = ModRuntime.color(color);
        // Keep the native alpha until actual geometry is known. In particular a sheet
        // must not inherit the reduced opacity intended for a small glass button.
        if (++applied == 1 || applied == 100) android.util.Log.i("MusicModGlass", "Native rounded surfaces styled: " + applied);
        return color;
    }
    public static float radius(Object shape) {
        if ("k3x".equals(shape.getClass().getName())) return Float.NaN;
        try {
            String corner = shape.getClass().getField("a").get(shape).toString();
            Matcher match = NUMBER.matcher(corner);
            if (match.find()) {
                float value = Float.parseFloat(match.group());
                return corner.contains("%") ? -value / 100f : value * density();
            }
        } catch (ReflectiveOperationException | NumberFormatException ignored) {}
        return 20 * density();
    }
    private static float density() { return android.content.res.Resources.getSystem().getDisplayMetrics().density; }
    public static Shader shader(int color, float corner, long packedSize) {
        float width = Float.intBitsToFloat((int)(packedSize >>> 32));
        float height = Float.intBitsToFloat((int)packedSize);
        if (!Float.isFinite(width) || width < 1) width = 1;
        if (!Float.isFinite(height) || height < 1) height = 1;
        float dp = density();
        boolean large = height > 120 * dp && width > 180 * dp;
        boolean content = height < 24 * dp || (height > 76 * dp && width > 120 * dp);
        if (Float.isNaN(corner) || large || content) {
            int max = Math.max(Color.red(color), Math.max(Color.green(color), Color.blue(color)));
            int min = Math.min(Color.red(color), Math.min(Color.green(color), Color.blue(color)));
            if (large && max - min < 42 && max < 180) color = 0xff202126;
            String key = "solid:" + color;
            synchronized (ModGlass.class) {
                Shader flat = shaders.get(key);
                if (flat == null) { flat = new LinearGradient(0, 0, 1, 1, color, color, Shader.TileMode.CLAMP); shaders.put(key, flat); }
                return flat;
            }
        }
        int max = Math.max(Color.red(color), Math.max(Color.green(color), Color.blue(color)));
        int min = Math.min(Color.red(color), Math.min(Color.green(color), Color.blue(color)));
        if (max - min < 42 && Color.alpha(color) >= 180 && max < 225) {
            int shade = Math.max(28, Math.min(56, max));
            color = Color.argb(235, shade, shade, shade + 5);
        }
        float radius = corner < 0 ? Math.min(width, height) * -corner : corner;
        return shader(color, radius, width, height);
    }
    static Shader shader(int color, float radius, float width, float height) { return shader(color, radius, width, height, 0, 0); }
    private static synchronized Shader shader(int color, float radius, float width, float height, float insetX, float insetY) {
        String key = color + ":" + Math.round(radius) + ":" + Math.round(width) + ":" + Math.round(height) + ":" + insetX + ":" + insetY;
        Shader cached = shaders.get(key); if (cached != null) return cached;
        Shader result = null;
        if (Build.VERSION.SDK_INT >= 33 && !shaderFailed) {
            try {
                RuntimeShader glass = new RuntimeShader(PROGRAM);
                glass.setFloatUniform("size", width, height); glass.setFloatUniform("inset", insetX, insetY); glass.setFloatUniform("radius", radius);
                glass.setFloatUniform("density", density()); glass.setColorUniform("tint", color); result = glass;
            } catch (RuntimeException error) {
                shaderFailed = true;
                android.util.Log.w("MusicModGlass", "AGSL unavailable; using static gradient fallback");
            }
        }
        if (result == null) result = new LinearGradient(0, 0, width * .25f, height,
            new int[]{blend(color, .18f), color, blend(color, .045f)}, new float[]{0, .5f, 1}, Shader.TileMode.CLAMP);
        owned.put(result, true); shaders.put(key, result); return result;
    }
    private static int blend(int c, float amount) {
        return Color.argb(Color.alpha(c), Math.round(Color.red(c) + (255 - Color.red(c)) * amount),
            Math.round(Color.green(c) + (255 - Color.green(c)) * amount), Math.round(Color.blue(c) + (255 - Color.blue(c)) * amount));
    }
}
