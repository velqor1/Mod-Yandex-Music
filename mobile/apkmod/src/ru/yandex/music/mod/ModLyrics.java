package ru.yandex.music.mod;

import android.util.Log;
import org.json.*;
import java.io.*;
import java.net.*;
import java.lang.reflect.*;
import java.text.Normalizer;
import java.util.*;
import java.util.concurrent.*;

/** Public lyric lookup feeding the original parser and original synchronized lyric screen. */
public final class ModLyrics {
    private static final ExecutorService IO = Executors.newFixedThreadPool(2, r -> {
        Thread t = new Thread(r, "MusicMod-Lyrics"); t.setDaemon(true); return t;
    });
    private static final ThreadLocal<Boolean> ORIGINAL = new ThreadLocal<>();
    private static final ThreadLocal<Long> DEADLINE = new ThreadLocal<>();
    private static final android.util.LruCache<String, Song> CACHE = new android.util.LruCache<>(24);
    private static final class Song { String title, artist, album, synced, plain, url; double duration; }
    private static Object availableInfo;
    public static boolean isPlaceholder(String value) {
        if (value == null || value.length() > 600) return false;
        String text = value.toLowerCase(Locale.ROOT);
        return text.contains("плюс") && (text.contains("подписк") || text.contains("подключ"));
    }
    public static synchronized Object availableInfo(Object original) {
        if (!ModRuntime.enabled("without_plus", true)) return original;
        try {
            if (availableInfo == null) availableInfo = Class.forName("jqv").getConstructor(boolean.class, boolean.class).newInstance(true, true);
            return availableInfo;
        } catch (ReflectiveOperationException ignored) { return original; }
    }
    public static Object sanitizeNative(Object lyrics) {
        try {
            Class<?> type = lyrics.getClass(); String text = String.valueOf(type.getField("g").get(lyrics));
            if (!isPlaceholder(text)) return lyrics;
            Object plain = Class.forName("cli").getField("b").get(null);
            Object result = type.getConstructors()[0].newInstance(type.getField("a").get(lyrics), type.getField("b").get(lyrics),
                type.getField("c").get(lyrics), type.getField("d").get(lyrics), type.getField("e").get(lyrics), plain,
                "Текст этой записи пока не найден в доступных источниках.", Collections.emptyList());
            Log.i("MusicModLyrics", "Native subscription placeholder replaced with unavailable state"); return result;
        } catch (ReflectiveOperationException | RuntimeException e) { return lyrics; }
    }
    private static final class Delivery {
        boolean waiting, done; Object value;
        synchronized Object suspend(Object marker) { if (done) return value; waiting = true; return marker; }
        void complete(Object result, Object continuation) throws ReflectiveOperationException {
            synchronized (this) { if (!waiting) { value = result; done = true; return; } }
            Class.forName("kotlin.coroutines.Continuation").getMethod("resumeWith", Object.class).invoke(continuation, result);
        }
    }

    /** Null delegates to the untouched resolver. No blocking work runs on the calling thread. */
    public static Object resolve(Object resolver, String id, Object format, Long revision, Object continuation) {
        if (!ModRuntime.enabled("without_plus", true) || Boolean.TRUE.equals(ORIGINAL.get())
            || id == null || format == null || continuation == null || !id.matches("[0-9]+(?::[0-9]+)?")) return null;
        try {
            Object marker = Class.forName("ij7").getField("a").get(null);
            Object intercepted = Class.forName("va7").getMethod("intercepted").invoke(continuation);
            Method original = resolver.getClass().getMethod("a", String.class, Class.forName("cli"), Long.class, Class.forName("va7"));
            Delivery delivery = new Delivery();
            IO.execute(() -> {
                try {
                    Song song;
                    synchronized (CACHE) { song = CACHE.get(id); }
                    if (song == null) {
                        DEADLINE.set(android.os.SystemClock.uptimeMillis() + 12000);
                        try { song = find(id.split(":")[0]); } finally { DEADLINE.remove(); }
                        if (song != null) synchronized (CACHE) { CACHE.put(id, song); }
                    }
                    if (song != null) {
                        // The server's track flags may advertise TEXT only; public timestamps
                        // still belong in the original synchronized renderer when available.
                        Object resolvedFormat = Class.forName("cli").getField(song.synced != null ? "c" : "b").get(null);
                        Object result = nativeResult(id, resolvedFormat, song);
                        Log.i("MusicModLyrics", "Public lyrics loaded; format=" + ((Enum<?>)resolvedFormat).name());
                        delivery.complete(result, intercepted); return;
                    }
                } catch (Exception e) { Log.w("MusicModLyrics", "Public lookup unavailable: " + e.getClass().getSimpleName()); }
                try {
                    ORIGINAL.set(true);
                    Object result = original.invoke(resolver, id, format, revision, continuation);
                    if (result != marker) delivery.complete(result, intercepted);
                } catch (Exception e) {
                    // Resume a proper Kotlin failure, rather than leave a permanently spinning screen.
                    try {
                        Throwable cause = e instanceof InvocationTargetException ? ((InvocationTargetException)e).getCause() : e;
                        Object failure = Class.forName("tmq").getConstructor(Throwable.class).newInstance(cause);
                        delivery.complete(failure, intercepted);
                    } catch (ReflectiveOperationException failure) { Log.e("MusicModLyrics", "Continuation failed", failure); }
                } finally { ORIGINAL.remove(); }
            });
            return delivery.suspend(marker);
        } catch (ReflectiveOperationException | RuntimeException e) { Log.w("MusicModLyrics", "Resolver binding unavailable", e); return null; }
    }

    private static Object nativeResult(String id, Object format, Song song) throws ReflectiveOperationException {
        Class<?> qli = Class.forName("qli"), bli = Class.forName("bli"), spi = Class.forName("spi"), cli = Class.forName("cli");
        Object key = qli.getConstructor(String.class, String.class, String.class).newInstance(id, null, null);
        boolean yandex = song.url != null && song.url.startsWith("https://api.music.yandex.net/");
        boolean genius = song.url != null && song.url.startsWith("https://genius.com/");
        Object provider = spi.getConstructor(int.class, String.class, String.class).newInstance(0, yandex ? "Яндекс Музыка" : genius ? "Genius" : "LRCLIB", yandex ? "https://music.yandex.ru" : genius ? "https://genius.com" : "https://lrclib.net");
        Object info = bli.getConstructor(int.class, String.class, String.class, ArrayList.class, spi)
            .newInstance(0, "", song.url, new ArrayList<String>(), provider);
        boolean sync = "LRC".equals(((Enum<?>)format).name());
        String text = sync ? normalizeLrc(song.synced) : song.plain;
        if (text == null) text = normalizeLrc(song.synced).replaceAll("(?m)^\\[[^]]+]", "");
        Object lyrics = Class.forName("qp7").getMethod("B", qli, bli, cli, String.class).invoke(null, key, info, format, text);
        Log.i("MusicModLyrics", "Native synchronized lines=" + ((List<?>)lyrics.getClass().getField("h").get(lyrics)).size());
        return Class.forName("le7").getConstructor(Object.class).newInstance(lyrics);
    }

    static String normalizeLrc(String text) {
        if (text == null) return "";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\[(\\d+):(\\d{2})(?:\\.(\\d{1,3}))?]").matcher(text);
        StringBuffer result = new StringBuffer();
        while (m.find()) {
            String fraction = m.group(3) == null ? "00" : (m.group(3) + "00").substring(0, 2);
            m.appendReplacement(result, "[" + String.format(Locale.ROOT, "%02d", Integer.parseInt(m.group(1))) + ":" + m.group(2) + "." + fraction + "]");
        }
        m.appendTail(result); return result.toString();
    }
    private static String normalized(String s) {
        return Normalizer.normalize(s.toLowerCase(Locale.ROOT).replace('ё','е'), Normalizer.Form.NFKC).replaceAll("[^\\p{L}\\p{N}]", "");
    }
    private static String enc(String s) throws UnsupportedEncodingException { return URLEncoder.encode(s, "UTF-8"); }
    private static String nullable(JSONObject o, String name) { String s = o.optString(name, ""); return s.trim().isEmpty() || s.equals("null") ? null : s; }

    private static Song find(String id) throws Exception {
        JSONObject response = new JSONObject(get("https://api.music.yandex.net/tracks/" + enc(id)));
        JSONArray tracks = response.optJSONArray("result");
        if (tracks == null || tracks.length() == 0) return null;
        JSONObject track = tracks.getJSONObject(0); Song target = new Song();
        target.title = track.getString("title"); target.duration = track.optDouble("durationMs", 0) / 1000;
        JSONArray artists = track.optJSONArray("artists"); if (artists == null || artists.length() == 0) return null;
        ArrayList<String> names = new ArrayList<>();
        for (int i = 0; i < artists.length(); i++) names.add(artists.getJSONObject(i).getString("name"));
        target.artist = String.join(", ", names);
        JSONArray albums = track.optJSONArray("albums"); target.album = albums != null && albums.length() > 0 ? albums.getJSONObject(0).optString("title", "") : "";
        Song supplement = supplement(id);
        if (supplement != null && supplement.synced != null) return supplement;
        String query = "track_name=" + enc(target.title) + "&artist_name=" + enc(names.get(0));
        Song best = null;
        try {
            best = choose(new JSONArray(get("https://lrclib.net/api/search?" + query)), target, names);
            if (best == null || best.synced == null) {
                String words = titleBase(target.title).replaceAll("[^\\p{L}\\p{N}\\s]", " ").replaceAll("\\s+", " ").trim();
                Song broader = choose(new JSONArray(get("https://lrclib.net/api/search?q=" + enc(words))), target, names);
                if (broader != null && (best == null || broader.synced != null)) best = broader;
            }
        } catch (IOException | JSONException ignored) { /* Native/supplement result is still usable. */ }
        if (best != null) return best;
        if (supplement != null) return supplement;
        return genius(target, names);
    }
    private static String titleBase(String title) {
        return title.replaceAll("(?i)\\s*[\\[(](?:feat\\.?|ft\\.?|prod\\.?).*$", "")
            .replaceAll("(?i)\\s+(?:feat\\.?|ft\\.?)\\s+.*$", "").trim();
    }
    private static boolean artistMatches(String candidate, List<String> artists) {
        String words = " " + candidate.toLowerCase(Locale.ROOT).replace('ё','е').replaceAll("[^\\p{L}\\p{N}]+", " ").trim() + " ";
        for (String artist : artists) {
            String key = artist.toLowerCase(Locale.ROOT).replace('ё','е').replaceAll("[^\\p{L}\\p{N}]+", " ").trim();
            if (!key.isEmpty() && words.contains(" " + key + " ")) return true;
        }
        return false;
    }
    private static Song choose(JSONArray candidates, Song target, List<String> artists) throws JSONException {
        Song best = null; double bestScore = -1;
        for (int i = 0; i < candidates.length(); i++) {
            JSONObject item = candidates.getJSONObject(i);
            if (!normalized(titleBase(target.title)).equals(normalized(titleBase(item.optString("trackName"))))) continue;
            if (!artistMatches(item.optString("artistName"), artists)) continue;
            double delta = Math.abs(item.optDouble("duration", 0) - target.duration);
            if (target.duration > 0 && delta > Math.max(8, target.duration * .04)) continue;
            String synced = nullable(item, "syncedLyrics"), plain = nullable(item, "plainLyrics");
            if (synced == null && plain == null) continue;
            double score = (synced != null ? 100 : 0) + (normalized(target.album).equals(normalized(item.optString("albumName"))) ? 10 : 0) - delta;
            if (score <= bestScore) continue;
            Song song = new Song(); song.synced = synced; song.plain = plain; song.url = "https://lrclib.net/api/get/" + item.getLong("id");
            best = song; bestScore = score;
        }
        return best;
    }
    private static Song supplement(String id) {
        try {
            String url = "https://api.music.yandex.net/tracks/" + enc(id) + "/supplement";
            JSONObject lyrics = new JSONObject(get(url)).optJSONObject("result");
            lyrics = lyrics == null ? null : lyrics.optJSONObject("lyrics");
            if (lyrics == null) return null;
            Song song = new Song(); song.url = url; song.plain = nullable(lyrics, "fullLyrics");
            JSONArray lines = lyrics.optJSONArray("syncLyrics");
            if (lines != null) {
                StringBuilder lrc = new StringBuilder();
                for (int i = 0; i < lines.length(); i++) {
                    JSONObject line = lines.getJSONObject(i); long ms = line.optLong("timestamp", line.optLong("offset", -1));
                    String text = line.optString("line", line.optString("text", ""));
                    if (ms >= 0) lrc.append(String.format(Locale.ROOT, "[%02d:%02d.%02d]", ms/60000, ms/1000%60, ms/10%100)).append(text).append('\n');
                }
                if (lrc.length() > 0) song.synced = lrc.toString();
            }
            return song.synced != null || song.plain != null ? song : null;
        } catch (Exception ignored) { return null; }
    }
    private static Song genius(Song target, List<String> artists) {
        try {
            Song result = geniusSearch(target, artists, target.artist + " " + titleBase(target.title));
            if (result == null) result = geniusSearch(target, artists, titleBase(target.title));
            return result;
        } catch (Exception ignored) { return null; }
    }
    private static Song geniusSearch(Song target, List<String> artists, String query) throws Exception {
        JSONObject response = new JSONObject(get("https://genius.com/api/search/multi?q=" + enc(query))).optJSONObject("response");
        if (response == null) return null;
        JSONArray sections = response.optJSONArray("sections"); if (sections == null) return null;
        ArrayList<JSONObject> matches = new ArrayList<>();
        for (int i = 0; i < sections.length(); i++) {
            JSONObject section = sections.getJSONObject(i); if (!section.optString("type").equals("song")) continue;
            JSONArray hits = section.optJSONArray("hits"); if (hits == null) continue;
            for (int j = 0; j < hits.length(); j++) {
                JSONObject item = hits.getJSONObject(j).optJSONObject("result"); if (item == null) continue;
                JSONObject author = item.optJSONObject("primary_artist"); String artist = author == null ? "" : author.optString("name");
                String title = item.optString("title"), url = item.optString("url");
                String lower = (title + " " + artist + " " + url).toLowerCase(Locale.ROOT);
                if (lower.contains("translation") || lower.contains("romaniz") || lower.contains("перевод")) continue;
                String candidateTitle = titleBase(title);
                if (target.title.matches(".*[А-Яа-яЁё].*") && candidateTitle.contains("(")
                    && !candidateTitle.toLowerCase(Locale.ROOT).matches(".*\\b(remix|live|cover|acoustic|sped|speed|slowed)\\b.*"))
                    candidateTitle = candidateTitle.substring(0, candidateTitle.indexOf('(')).trim();
                if (!normalized(candidateTitle).equals(normalized(titleBase(target.title)))) continue;
                if (!artistMatches(artist, artists)) continue;
                URI parsed = new URI(url);
                if (!"https".equals(parsed.getScheme()) || !"genius.com".equals(parsed.getHost())) continue;
                matches.add(item);
            }
        }
        if (matches.isEmpty()) return null;
        String url = matches.get(0).getString("url");
        String html = get(url); StringBuilder text = new StringBuilder();
        java.util.regex.Matcher start = java.util.regex.Pattern.compile("<div\\b[^>]*data-lyrics-container=[\"']true[\"'][^>]*>", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(html);
        java.util.regex.Pattern tags = java.util.regex.Pattern.compile("<\\s*(/?)\\s*div\\b[^>]*>", java.util.regex.Pattern.CASE_INSENSITIVE);
        while (start.find()) {
            int from = start.end(), depth = 1, end = -1;
            java.util.regex.Matcher tag = tags.matcher(html); tag.region(from, html.length());
            while (tag.find()) {
                depth += tag.group(1).isEmpty() ? 1 : -1;
                if (depth == 0) { end = tag.start(); break; }
            }
            if (end < 0) continue;
            String block = html.substring(from, end).replaceAll("(?is)<script\\b.*?</script>|<style\\b.*?</style>", "");
            String plain = android.text.Html.fromHtml(block, android.text.Html.FROM_HTML_MODE_LEGACY).toString();
            for (String line : plain.split("\\n")) {
                line = line.trim();
                if (line.matches("(?i)^(You might also like|\\d*\\s*Embed|\\d+\\s*Contributors.*|Translations)$")) continue;
                text.append(line).append('\n');
            }
        }
        String plain = text.toString().replaceAll("\\n{3,}", "\n\n").trim();
        if (plain.length() < 30) return null;
        Song song = new Song(); song.url = url; song.plain = plain; return song;
    }
    private static String get(String url) throws IOException {
        Long deadline = DEADLINE.get();
        long remaining = deadline == null ? 4000 : deadline - android.os.SystemClock.uptimeMillis();
        if (remaining <= 0) throw new SocketTimeoutException("Lyric lookup deadline");
        HttpURLConnection connection = (HttpURLConnection)new URL(url).openConnection();
        connection.setConnectTimeout((int)Math.min(4000, remaining)); connection.setReadTimeout((int)Math.min(4000, remaining));
        connection.setRequestProperty("User-Agent", "MusicMod/0.5 (Android lyric integration)");
        connection.setRequestProperty("X-Yandex-Music-Client", "YandexMusicDesktopAppWindows/5.124.1");
        try (InputStream in = connection.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192]; int read;
            while ((read = in.read(buffer)) != -1) {
                if (deadline != null && android.os.SystemClock.uptimeMillis() > deadline) throw new SocketTimeoutException("Lyric lookup deadline");
                if (out.size() + read > 2097152) throw new IOException("Response too large"); out.write(buffer, 0, read);
            }
            return out.toString("UTF-8");
        } finally { connection.disconnect(); }
    }
}
