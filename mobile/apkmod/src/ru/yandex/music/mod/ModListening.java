package ru.yandex.music.mod;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.PlaybackState;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Private on-device journal. Never reads another application's sessions or sends data. */
final class ModListening {
    interface Result<T> { void done(T value, boolean failed); }
    static final class Entry {
        long id, started, listened;
        String mediaId, title, artist, album, outcome;
    }
    static final class Rank {
        String name, subtitle, mediaId, title, artist, album;
        long millis, plays;
    }
    static final class Summary {
        long millis, previousMillis, plays, artists, discoveries, first;
        final List<Rank> topArtists = new ArrayList<>(), topTracks = new ArrayList<>();
        final long[] days = new long[7];
    }
    private static final Handler main = new Handler(Looper.getMainLooper());
    private static final ExecutorService worker = Executors.newSingleThreadExecutor();
    private static Database database;
    private static Context app;
    private static MediaController observed;
    private static ListeningClock clock = new ListeningClock();
    private static long row, lastPosition, duration;
    private static String key = "";
    private static String title = "", artist = "", album = "", mediaId = "";
    private static String failure;

    private ModListening() {}
    private static synchronized Database db(Context context) {
        if (database == null) { app = context.getApplicationContext(); database = new Database(app); }
        return database;
    }
    static void observe(Context context, MediaController controller) {
        db(context);
        main.post(() -> {
            if (observed != null && observed.getSessionToken().equals(controller.getSessionToken())) return;
            if (observed != null) observed.unregisterCallback(callback);
            observed = controller;
            controller.registerCallback(callback, main);
            sample();
        });
    }
    private static final MediaController.Callback callback = new MediaController.Callback() {
        @Override public void onMetadataChanged(MediaMetadata metadata) { sample(); }
        @Override public void onPlaybackStateChanged(PlaybackState state) { sample(); }
        @Override public void onSessionDestroyed() {
            sample(); observed = null; main.removeCallbacks(tick);
            clock = new ListeningClock(); row = 0; key = "";
        }
    };
    private static final Runnable tick = () -> sample();
    static String failure() { return failure; }
    private static String value(MediaMetadata data, String name) {
        String value = data.getString(name); return value == null ? "" : value;
    }
    private static void sample() {
        main.removeCallbacks(tick);
        if (observed == null) return;
        PlaybackState state = observed.getPlaybackState();
        MediaMetadata data = observed.getMetadata();
        boolean enabled = ModRuntime.enabled("listening_history", true);
        boolean playing = enabled && state != null && state.getState() == PlaybackState.STATE_PLAYING;
        long now = SystemClock.elapsedRealtime();
        long delta = clock.sample(now, playing);
        long wall = System.currentTimeMillis();
        String nextTitle = data == null ? "" : value(data, MediaMetadata.METADATA_KEY_TITLE);
        if (data != null && nextTitle.isEmpty()) nextTitle = value(data, MediaMetadata.METADATA_KEY_DISPLAY_TITLE);
        String nextArtist = data == null ? "" : value(data, MediaMetadata.METADATA_KEY_ARTIST);
        String nextAlbum = data == null ? "" : value(data, MediaMetadata.METADATA_KEY_ALBUM);
        String nextId = data == null ? "" : value(data, MediaMetadata.METADATA_KEY_MEDIA_ID);
        boolean advertisement = data != null && data.getLong("android.media.metadata.ADVERTISEMENT") == 1;
        String nextKey = nextTitle.isEmpty() || advertisement ? "" : TrackIdentity.key(nextTitle, nextArtist, nextAlbum);
        if (row != 0 && delta > 0 && enabled) {
            final long id = row, amount = delta, end = wall;
            work(() -> credit(id, amount, end));
        }
        boolean repeat = playing && key.equals(nextKey) && duration > 0
            && lastPosition >= duration - 2000 && state.getPosition() < 1500;
        if (!key.equals(nextKey) || repeat || !enabled) {
            if (row != 0) {
                final long id = row;
                final String status = duration > 0 && lastPosition >= duration - 2000 ? "completed" : "interrupted";
                work(() -> { ContentValues v = new ContentValues(); v.put("outcome", status);
                    database.getWritableDatabase().update("plays", v, "id=?", new String[]{Long.toString(id)}); });
            }
            row = 0; key = nextKey; lastPosition = 0;
        }
        title = nextTitle; artist = nextArtist; album = nextAlbum; mediaId = nextId;
        if (enabled && !nextKey.isEmpty()) ModTrackAssets.capture(app, data, title, artist, album);
        duration = data == null ? 0 : data.getLong(MediaMetadata.METADATA_KEY_DURATION);
        if (enabled && playing && !key.isEmpty() && row == 0) {
            // UUID-like monotonic key, not an account identifier. SQLite IO stays on one worker.
            row = nextRow();
            final long id = row, started = wall;
            final String t = title, a = artist, al = album, m = mediaId, k = key;
            work(() -> {
                ContentValues v = new ContentValues(); v.put("id", id); v.put("started", started);
                v.put("track_key", k); v.put("media_id", m); v.put("title", t); v.put("artist", a);
                v.put("album", al); v.put("search", (t + "\n" + a + "\n" + al).toLowerCase(java.util.Locale.ROOT));
                v.put("listened", 0); v.put("outcome", "open");
                database.getWritableDatabase().insertOrThrow("plays", null, v);
            });
        }
        if (state != null && key.equals(nextKey)) {
            long p = state.getPosition();
            if (playing && state.getLastPositionUpdateTime() > 0)
                p += Math.max(0, now - state.getLastPositionUpdateTime()) * state.getPlaybackSpeed();
            lastPosition = Math.max(0, p);
        }
        if (playing) main.postDelayed(tick, 10_000);
    }
    private static long sequence;
    private static long nextRow() { sequence = Math.max(sequence + 1, System.currentTimeMillis() * 1000); return sequence; }
    private interface Task { void run(); }
    private static void work(Task task) {
        worker.execute(() -> { try { task.run(); failure = null; }
            catch (RuntimeException error) { failure = "Не удалось открыть локальную историю"; android.util.Log.w("MusicModHistory", "Local journal unavailable", error); } });
    }
    private static void credit(long id, long amount, long end) {
        SQLiteDatabase db = database.getWritableDatabase(); db.beginTransaction();
        try {
            db.execSQL("UPDATE plays SET listened=listened+? WHERE id=?", new Object[]{amount, id});
            long cursor = end - amount;
            while (cursor < end) {
                long minute = Math.floorDiv(cursor, 60_000) * 60_000;
                long part = Math.min(end, minute + 60_000) - cursor;
                db.execSQL("INSERT OR IGNORE INTO minutes(play_id,minute,millis) VALUES(?,?,0)", new Object[]{id, minute});
                db.execSQL("UPDATE minutes SET millis=millis+? WHERE play_id=? AND minute=?", new Object[]{part, id, minute});
                cursor += part;
            }
            db.setTransactionSuccessful();
        } finally { db.endTransaction(); }
    }
    static void recordingChanged() {
        // Turning recording off discards the uncommitted tail as the user requested.
        clock = new ListeningClock(); sample();
    }
    static void clear(Context context, Result<Boolean> result) {
        db(context); clock = new ListeningClock(); row = 0; key = "";
        worker.execute(() -> {
            boolean failed = false;
            try { SQLiteDatabase d = database.getWritableDatabase(); d.beginTransaction();
                try { d.delete("minutes", null, null); d.delete("plays", null, null); d.setTransactionSuccessful(); }
                finally { d.endTransaction(); }
            } catch (RuntimeException error) { failed = true; }
            final boolean error = failed;
            main.post(() -> { sample(); result.done(!error, error); });
        });
    }
    static void history(Context context, String query, long from, long to, boolean interrupted, long before, Result<List<Entry>> result) {
        db(context); final String pattern = "%" + query.toLowerCase(java.util.Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
        worker.execute(() -> {
            List<Entry> entries = new ArrayList<>(); boolean failed = false;
            try (Cursor c = database.getReadableDatabase().rawQuery(
                "SELECT id,started,media_id,title,artist,album,listened,outcome FROM plays WHERE started>=? AND started<? AND id<? "
                + "AND search LIKE ? ESCAPE '\\' "
                + (interrupted ? "AND outcome='interrupted' " : "") + "ORDER BY id DESC LIMIT 100",
                new String[]{"" + from, "" + to, "" + before, pattern})) {
                while (c.moveToNext()) { Entry e = new Entry(); e.id = c.getLong(0); e.started = c.getLong(1); e.mediaId = c.getString(2);
                    e.title = c.getString(3); e.artist = c.getString(4); e.album = c.getString(5); e.listened = c.getLong(6); e.outcome = c.getString(7); entries.add(e); }
            } catch (RuntimeException error) { failed = true; }
            final boolean error = failed; main.post(() -> result.done(entries, error));
        });
    }
    static void summary(Context context, long from, long to, long[] dayStarts, Result<Summary> result) {
        db(context);
        worker.execute(() -> {
            Summary s = new Summary(); boolean failed = false;
            try {
                SQLiteDatabase d = database.getReadableDatabase();
                s.millis = scalar(d, "SELECT coalesce(sum(millis),0) FROM minutes WHERE minute>=? AND minute<?", from, to);
                s.previousMillis = scalar(d, "SELECT coalesce(sum(millis),0) FROM minutes WHERE minute>=? AND minute<?", from - (to - from), from);
                s.plays = scalar(d, "SELECT count(DISTINCT p.id) FROM plays p JOIN minutes m ON m.play_id=p.id WHERE m.minute>=? AND m.minute<? AND p.listened>=30000", from, to);
                s.artists = scalar(d, "SELECT count(DISTINCT p.artist) FROM plays p JOIN minutes m ON m.play_id=p.id WHERE m.minute>=? AND m.minute<? AND p.listened>=30000 AND p.artist<>''", from, to);
                s.discoveries = scalar(d, "SELECT count(*) FROM (SELECT artist,min(started) first FROM plays WHERE listened>=30000 AND artist<>'' GROUP BY artist) WHERE first>=? AND first<?", from, to);
                s.first = scalar(d, "SELECT coalesce(min(started),0) FROM plays WHERE started>=? AND started<?", 0, Long.MAX_VALUE);
                for (int i = 0; i < 7; i++) s.days[i] = scalar(d, "SELECT coalesce(sum(millis),0) FROM minutes WHERE minute>=? AND minute<?", dayStarts[i], dayStarts[i + 1]);
                rank(d, s.topArtists, from, to, false); rank(d, s.topTracks, from, to, true);
            } catch (RuntimeException error) { failed = true; }
            final boolean error = failed; main.post(() -> result.done(s, error));
        });
    }
    private static long scalar(SQLiteDatabase d, String sql, long from, long to) {
        try (Cursor c = d.rawQuery(sql, new String[]{"" + from, "" + to})) { return c.moveToFirst() ? c.getLong(0) : 0; }
    }
    private static void rank(SQLiteDatabase d, List<Rank> out, long from, long to, boolean tracks) {
        String group = tracks ? "p.title,p.artist,p.album" : "p.artist";
        try (Cursor c = d.rawQuery("SELECT " + (tracks ? "p.title,p.artist" : "p.artist,''")
            + ",sum(m.millis),count(DISTINCT p.id),p.media_id,p.title,p.artist,p.album FROM minutes m JOIN plays p ON p.id=m.play_id WHERE m.minute>=? AND m.minute<? "
            + (tracks ? "" : "AND p.artist<>'' ") + "GROUP BY " + group + " ORDER BY sum(m.millis) DESC LIMIT 5", new String[]{"" + from, "" + to})) {
            while (c.moveToNext()) { Rank r = new Rank(); r.name = c.getString(0); r.subtitle = c.getString(1); r.millis = c.getLong(2); r.plays = c.getLong(3);
                r.mediaId = c.getString(4); r.title = c.getString(5); r.artist = c.getString(6); r.album = c.getString(7); out.add(r); }
        }
    }
    static ModTrackAssets.Asset asset(Context context, String key) {
        try (Cursor c = db(context).getReadableDatabase().rawQuery("SELECT catalog_id,cover,portrait FROM track_assets WHERE identity=?", new String[]{key})) {
            if (!c.moveToFirst()) return null;
            ModTrackAssets.Asset a = new ModTrackAssets.Asset(); a.id = c.getString(0); a.cover = c.getString(1); a.portrait = c.getString(2); return a;
        } catch (RuntimeException ignored) { return null; }
    }
    static void saveAsset(Context context, String key, ModTrackAssets.Asset a) {
        try {
            SQLiteDatabase d = db(context).getWritableDatabase(); d.beginTransaction();
            try {
                d.execSQL("INSERT OR IGNORE INTO track_assets(identity,catalog_id,cover,portrait) VALUES(?,'','','')", new Object[]{key});
                d.execSQL("UPDATE track_assets SET catalog_id=CASE WHEN ?<>'' THEN ? ELSE catalog_id END,cover=CASE WHEN ?<>'' THEN ? ELSE cover END,portrait=CASE WHEN ?<>'' THEN ? ELSE portrait END WHERE identity=?",
                    new Object[]{a.id, a.id, a.cover, a.cover, a.portrait, a.portrait, key});
                d.setTransactionSuccessful();
            } finally { d.endTransaction(); }
        } catch (RuntimeException ignored) { /* Journal remains usable without artwork. */ }
    }
    private static final class Database extends SQLiteOpenHelper {
        Database(Context c) { super(c, "music_mod_listening.db", null, 2); setWriteAheadLoggingEnabled(true); }
        @Override public void onCreate(SQLiteDatabase d) {
            d.execSQL("CREATE TABLE plays(id INTEGER PRIMARY KEY,started INTEGER NOT NULL,track_key TEXT NOT NULL,media_id TEXT NOT NULL,title TEXT NOT NULL,artist TEXT NOT NULL,album TEXT NOT NULL,search TEXT NOT NULL,listened INTEGER NOT NULL DEFAULT 0,outcome TEXT NOT NULL)");
            d.execSQL("CREATE INDEX plays_started ON plays(started)");
            d.execSQL("CREATE INDEX plays_artist ON plays(artist,started)");
            d.execSQL("CREATE TABLE minutes(play_id INTEGER NOT NULL,minute INTEGER NOT NULL,millis INTEGER NOT NULL,PRIMARY KEY(play_id,minute))");
            d.execSQL("CREATE INDEX minutes_time ON minutes(minute)");
            assets(d);
        }
        private void assets(SQLiteDatabase d) {
            d.execSQL("CREATE TABLE IF NOT EXISTS track_assets(identity TEXT PRIMARY KEY,catalog_id TEXT NOT NULL,cover TEXT NOT NULL,portrait TEXT NOT NULL)");
        }
        @Override public void onUpgrade(SQLiteDatabase d, int old, int next) { if (old < 2) assets(d); }
    }
}
