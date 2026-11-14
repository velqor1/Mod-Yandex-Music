package ru.yandex.music.mod;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadata;
import android.os.Handler;
import android.os.Looper;
import android.util.LruCache;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;

/** Bounded public catalog lookup. No auth, account information or playback control. */
final class ModTrackAssets {
    static final class Asset {
        String id = "", cover = "", portrait = "", album = "";
    }
    interface Result { void done(Asset asset); }
    private static final ExecutorService io = Executors.newFixedThreadPool(2);
    private static final Handler main = new Handler(Looper.getMainLooper());
    private static final LruCache<String, Asset> cache = new LruCache<>(128);
    private static final Map<String, List<Result>> pending = new HashMap<>();
    private static final LruCache<String, Bitmap> bitmaps = new LruCache<String, Bitmap>(8 * 1024 * 1024) {
        @Override protected int sizeOf(String key, Bitmap bitmap) { return bitmap.getAllocationByteCount(); }
    };
    private ModTrackAssets() {}
    static void artwork(Context context, String mediaId, String title, String artist, String album, Result result) {
        final Context app = context.getApplicationContext(); final String key = TrackIdentity.key(title, artist, album);
        io.execute(() -> {
            Asset local = ModListening.asset(app, key);
            if (local != null && !local.cover.isEmpty()) main.post(() -> result.done(local));
            else main.post(() -> resolve(app, mediaId, title, artist, album, result));
        });
    }
    static void resolve(Context context, String mediaId, String title, String artist, String album, Result result) {
        final Context app = context.getApplicationContext(); final String key = TrackIdentity.key(title, artist, album);
        synchronized (pending) {
            Asset hit = cache.get(key);
            if (hit != null) { main.post(() -> result.done(hit)); return; }
            if (pending.containsKey(key)) { pending.get(key).add(result); return; }
            List<Result> callbacks = new ArrayList<>(); callbacks.add(result); pending.put(key, callbacks);
        }
        io.execute(() -> {
            Asset found = ModListening.asset(app, key);
            if (found == null || found.id.isEmpty()) {
                String nativeCover = found == null ? "" : found.cover;
                try { Asset catalog = lookup(mediaId, title, artist, album); if (catalog != null) found = catalog; }
                catch (Exception ignored) { /* Keep the original local cover; never open an unverified ID. */ }
                if (found == null) found = new Asset();
                if (!nativeCover.isEmpty()) found.cover = nativeCover;
                if (!found.id.isEmpty()) ModListening.saveAsset(app, key, found);
            }
            final Asset asset = found;
            List<Result> callbacks;
            synchronized (pending) {
                if (!asset.id.isEmpty()) cache.put(key, asset);
                callbacks = pending.remove(key);
            }
            if (callbacks != null) main.post(() -> { for (Result callback : callbacks) callback.done(asset); });
        });
    }
    private static Asset lookup(String candidate, String title, String artist, String album) throws Exception {
        // First verify the original candidate against metadata, including old 0.6 rows.
        String id = candidate == null ? "" : candidate.replaceFirst("^track:", "");
        if (id.matches("\\d+(?::\\d+)?")) {
            try {
                JSONArray tracks = new JSONObject(get("https://api.music.yandex.net/tracks/" + enc(id))).optJSONArray("result");
                if (tracks != null && tracks.length() == 1) {
                    JSONObject track = tracks.getJSONObject(0);
                    if (matches(track, title, artist, album)) return asset(track);
                }
            } catch (Exception ignored) { /* Search metadata if the queue ID is not a catalog ID. */ }
        }
        JSONObject result = new JSONObject(get("https://api.music.yandex.net/search?type=track&page=0&text=" + enc(artist + " " + title))).optJSONObject("result");
        JSONObject section = result == null ? null : result.optJSONObject("tracks");
        JSONArray items = section == null ? null : section.optJSONArray("results");
        Asset chosen = null;
        if (items != null) for (int i = 0; i < items.length(); i++) {
            JSONObject track = items.getJSONObject(i);
            if (!matches(track, title, artist, album)) continue;
            Asset current = asset(track);
            // Distinct matching recordings remain ambiguous; don't silently choose the first.
            if (chosen != null && !chosen.id.equals(current.id)) return null;
            chosen = current;
        }
        return chosen;
    }
    private static String artists(JSONObject track) {
        JSONArray artists = track.optJSONArray("artists"); List<String> names = new ArrayList<>();
        if (artists != null) for (int i = 0; i < artists.length(); i++) names.add(artists.optJSONObject(i).optString("name"));
        return String.join(", ", names);
    }
    private static boolean matches(JSONObject track, String title, String artist, String album) {
        String version = track.optString("version", ""); String name = track.optString("title");
        if (!version.isEmpty()) name += " (" + version + ")";
        if (!TrackIdentity.matches(title, artist, name, artists(track))) return false;
        if (album == null || album.isEmpty()) return true;
        JSONArray albums = track.optJSONArray("albums");
        if (albums != null) for (int i = 0; i < albums.length(); i++)
            if (TrackIdentity.normalize(album).equals(TrackIdentity.normalize(albums.optJSONObject(i).optString("title")))) return true;
        return false;
    }
    private static Asset asset(JSONObject track) {
        Asset a = new Asset(); a.id = track.optString("id"); a.cover = imageUri(track.optString("coverUri", ""));
        JSONArray albums = track.optJSONArray("albums");
        if (albums != null && albums.length() > 0) {
            JSONObject album = albums.optJSONObject(0); a.album = album.optString("title", "");
            if (a.cover.isEmpty()) a.cover = imageUri(album.optString("coverUri", ""));
        }
        JSONArray artists = track.optJSONArray("artists");
        if (artists != null && artists.length() > 0) {
            JSONObject cover = artists.optJSONObject(0).optJSONObject("cover");
            if (cover != null) a.portrait = imageUri(cover.optString("uri", ""));
        }
        return a;
    }
    private static String imageUri(String uri) {
        if (uri.isEmpty()) return "";
        String value = uri.replace("%%", "200x200");
        if (value.startsWith("//")) value = "https:" + value;
        else if (!value.startsWith("https://")) value = "https://" + value;
        try { String host = new URL(value).getHost(); return host.equals("avatars.yandex.net") || host.equals("avatars.mds.yandex.net") ? value : ""; }
        catch (MalformedURLException ignored) { return ""; }
    }
    private static String enc(String value) throws UnsupportedEncodingException { return URLEncoder.encode(value, "UTF-8"); }
    private static byte[] request(String url, int maximum) throws IOException {
        HttpURLConnection c = (HttpURLConnection)new URL(url).openConnection();
        c.setConnectTimeout(3500); c.setReadTimeout(3500); c.setInstanceFollowRedirects(false);
        c.setRequestProperty("User-Agent", "MusicMod/0.6.1");
        try {
            if (c.getResponseCode() != 200) throw new IOException("Catalog unavailable");
            try (InputStream in = c.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] bytes = new byte[8192]; int n;
                while ((n = in.read(bytes)) != -1) { if (out.size() + n > maximum) throw new IOException("Response too large"); out.write(bytes, 0, n); }
                return out.toByteArray();
            }
        } finally { c.disconnect(); }
    }
    private static String get(String url) throws IOException { return new String(request(url, 2 * 1024 * 1024), "UTF-8"); }
    static void capture(Context context, MediaMetadata data, String title, String artist, String album) {
        if (data == null) return;
        Bitmap image = data.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART);
        if (image == null) image = data.getBitmap(MediaMetadata.METADATA_KEY_ART);
        if (image == null) image = data.getDescription().getIconBitmap();
        if (image == null) return;
        final Bitmap bitmap = image; final Context app = context.getApplicationContext();
        final String key = TrackIdentity.key(title, artist, album);
        io.execute(() -> {
            try {
                File file = file(app, key);
                if (file.isFile()) return;
                Bitmap small = Bitmap.createScaledBitmap(bitmap, 192, 192, true);
                try (OutputStream out = new FileOutputStream(file)) { small.compress(Bitmap.CompressFormat.JPEG, 88, out); }
                Asset a = ModListening.asset(app, key); if (a == null) a = new Asset(); a.cover = file.toURI().toString(); ModListening.saveAsset(app, key, a);
            } catch (Exception ignored) { /* Artwork must never affect playback. */ }
        });
    }
    private static File file(Context context, String key) throws Exception {
        File dir = new File(context.getCacheDir(), "music-mod-covers"); dir.mkdirs();
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(key.getBytes("UTF-8")); StringBuilder name = new StringBuilder();
        for (byte b : digest) name.append(String.format(Locale.ROOT, "%02x", b & 255));
        return new File(dir, name + ".jpg");
    }
    interface Picture { void done(Bitmap bitmap); }
    static void bitmap(Context context, String key, String uri, Picture result) {
        Bitmap hit; synchronized (bitmaps) { hit = bitmaps.get(uri); }
        if (hit != null) { result.done(hit); return; }
        final Context app = context.getApplicationContext();
        io.execute(() -> {
            Bitmap image = null;
            try {
                File cached = file(app, key + "\n" + uri);
                if (uri.startsWith("file:")) image = BitmapFactory.decodeFile(new File(new URI(uri)).getPath());
                else if (!imageUri(uri).isEmpty()) {
                    if (!cached.isFile()) { byte[] bytes = request(imageUri(uri), 2 * 1024 * 1024); try (OutputStream out = new FileOutputStream(cached)) { out.write(bytes); } }
                    BitmapFactory.Options options = new BitmapFactory.Options(); options.inJustDecodeBounds = true; BitmapFactory.decodeFile(cached.getPath(), options);
                    options.inSampleSize = Math.max(1, Math.max(options.outWidth, options.outHeight) / 256); options.inJustDecodeBounds = false; image = BitmapFactory.decodeFile(cached.getPath(), options);
                }
            } catch (Exception ignored) {}
            final Bitmap value = image; if (value != null) synchronized (bitmaps) { bitmaps.put(uri, value); }
            main.post(() -> result.done(value));
        });
    }
}
