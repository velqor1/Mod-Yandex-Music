package ru.yandex.music.mod;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.widget.ImageView;

/** Loads only when drawn; long histories don't eagerly fetch hundreds of covers. */
final class ModCover extends ImageView {
    private final String id, title, artist, album;
    private final boolean portrait;
    private boolean requested, ready;
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    ModCover(Context c, String id, String title, String artist, String album, boolean portrait) {
        super(c); this.id = id; this.title = title; this.artist = artist; this.album = album; this.portrait = portrait;
        setScaleType(ScaleType.CENTER_CROP); setBackground(ModUi.shape(c, ModUi.RAISED, portrait ? 28 : 12, 0));
        setClipToOutline(true); setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
    }
    @Override protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (!ready) {
            canvas.save(); float scale = Math.min(getWidth(), getHeight()) / 48f;
            canvas.translate(getWidth() / 2f - 12 * scale, getHeight() / 2f - 12 * scale); canvas.scale(scale, scale);
            ModUi.drawIcon(canvas, paint, ModUi.AUDIO, ModUi.MUTED); canvas.restore();
        }
        if (!requested) {
            requested = true;
            ModTrackAssets.artwork(getContext(), id, title, artist, album, asset -> {
                String uri = portrait ? asset.portrait : asset.cover;
                if (uri.isEmpty()) return;
                ModTrackAssets.bitmap(getContext(), TrackIdentity.key(title, artist, album), uri, bitmap -> {
                    if (bitmap != null) { ready = true; setImageBitmap(bitmap); }
                });
            });
        }
    }
}
