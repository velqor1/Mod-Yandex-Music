package ru.yandex.music.mod;

import android.content.SharedPreferences;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** A deliberately small allowlist: exported appearance never contains account or playback data. */
final class ModProfiles {
    static final String[] KEYS = {"accent", "appearance", "deep_dark", "manrope", "text_scale", "glass_ui", "amoled"};
    static final String[] THEMES = {"ПК-мод", "AMOLED", "Оригинал"};
    static JSONObject snapshot() throws Exception {
        SharedPreferences p = ModRuntime.preferences(); JSONObject result = new JSONObject();
        result.put("accent", ModRuntime.accent()); result.put("text_scale", p.getInt("text_scale", 100));
        for (String key : KEYS) if (!key.equals("accent") && !key.equals("text_scale"))
            result.put(key, p.getBoolean(key, !key.equals("amoled")));
        return result;
    }
    static void apply(JSONObject object) throws Exception {
        // Validate the entire document before changing any preference.
        if (object.length() != KEYS.length) throw new IllegalArgumentException("Неверный набор настроек");
        for (String key : KEYS) {
            Object value = object.get(key);
            if (key.equals("accent")) {
                if (!(value instanceof Number) || ((Number)value).doubleValue() != ((Number)value).intValue() || ((((Number)value).intValue() >>> 24) != 255)) throw new IllegalArgumentException("Неверный цвет");
            } else if (key.equals("text_scale")) {
                if (!(value instanceof Number) || ((Number)value).doubleValue() != ((Number)value).intValue() || ((Number)value).intValue() < 85 || ((Number)value).intValue() > 120) throw new IllegalArgumentException("Неверный размер текста");
            } else if (!(value instanceof Boolean)) throw new IllegalArgumentException("Неверный переключатель");
        }
        SharedPreferences.Editor e = ModRuntime.preferences().edit();
        for (String key : KEYS) if (key.equals("accent") || key.equals("text_scale")) e.putInt(key, object.getInt(key)); else e.putBoolean(key, object.getBoolean(key));
        e.remove("theme_name").commit();
    }
    static void theme(String name) {
        SharedPreferences.Editor e = ModRuntime.preferences().edit();
        e.putString("theme_name", name).putBoolean("appearance", !name.equals("Оригинал"))
            .putBoolean("deep_dark", !name.equals("Оригинал")).putBoolean("amoled", name.equals("AMOLED"))
            .putBoolean("manrope", !name.equals("Оригинал"));
        if (name.equals("ПК-мод")) e.putInt("accent", ModUi.RED);
        e.commit();
    }
    static String name() {
        String name = ModRuntime.preferences().getString("theme_name", "Своя тема");
        for (String theme : THEMES) if (theme.equals(name)) return name;
        JSONArray profiles = saved();
        for (int i = 0; i < profiles.length(); i++) if (profiles.optJSONObject(i) != null && name.equals(profiles.optJSONObject(i).optString("name"))) return name;
        return "Своя тема";
    }
    static void custom() { ModRuntime.preferences().edit().remove("theme_name").apply(); }
    static JSONArray saved() {
        try { return new JSONArray(ModRuntime.preferences().getString("appearance_presets", "[]")); }
        catch (Exception ignored) { return new JSONArray(); }
    }
    static void save(String name) throws Exception {
        name = name.trim(); if (name.isEmpty() || name.length() > 32) throw new IllegalArgumentException("От 1 до 32 символов");
        JSONArray old = saved(), result = new JSONArray();
        for (int i = 0; i < old.length(); i++) if (!name.equals(old.getJSONObject(i).getString("name"))) result.put(old.getJSONObject(i));
        if (result.length() >= 12) throw new IllegalArgumentException("Можно сохранить до 12 пресетов");
        result.put(new JSONObject().put("name", name).put("settings", snapshot()));
        ModRuntime.preferences().edit().putString("appearance_presets", result.toString()).commit();
    }
    static void remove(int index) throws Exception {
        JSONArray old = saved(), result = new JSONArray();
        for (int i = 0; i < old.length(); i++) if (i != index) result.put(old.get(i));
        ModRuntime.preferences().edit().putString("appearance_presets", result.toString()).commit();
    }
    static String exportText() throws Exception { return new JSONObject().put("format", "music-mod-appearance").put("version", 1).put("settings", snapshot()).toString(2); }
    static void importText(String text) throws Exception {
        JSONObject root = new JSONObject(text);
        if (!"music-mod-appearance".equals(root.getString("format")) || root.getInt("version") != 1) throw new IllegalArgumentException("Неизвестный формат");
        apply(root.getJSONObject("settings"));
    }
    static Set<String> favorites() {
        return new HashSet<>(ModRuntime.preferences().getStringSet("favorites", new HashSet<>(Arrays.asList("keep_screen", "economy"))));
    }
}
