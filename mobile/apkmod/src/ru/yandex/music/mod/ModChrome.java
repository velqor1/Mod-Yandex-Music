package ru.yandex.music.mod;

import java.util.*;
import java.lang.reflect.*;

/** Remove nonmusic destinations from the original native tab model. */
public final class ModChrome {
    private static final Set<String> seen = new HashSet<>();
    public static String blockType(String type) {
        if (type == null) return null;
        String value = type.toLowerCase(Locale.ROOT);
        if (value.contains("concert") || value.contains("donation") || value.contains("quest")
            || value.contains("podcast") || value.contains("bookmate") || value.contains("yandex-books")
            || value.contains("non-music") || value.contains("nonmusic") || value.contains("advert")
            || value.equals("books") || value.equals("audiobooks") || value.contains("banner")
            || value.contains("promo") || value.contains("adfox") || value.contains("branding") || value.equals("ad") || value.equals("menu")
            || value.contains("dynamic-banner") || value.contains("dynamic_banner")
            || value.contains("plus-promo") || value.contains("subscription") || value.contains("offer-block")) return null;
        return type;
    }
    public static List<?> filterBlocks(List<?> source) {
        if (source == null) return null;
        ArrayList<Object> result = new ArrayList<>(source.size());
        for (Object item : source) {
            if (item != null) try {
                String label = item.getClass().getSimpleName() + "/" + item.getClass().getMethod("getType").invoke(item);
                if (seen.size() < 60 && seen.add(label)) android.util.Log.i("MusicModClean", "Block " + label);
            } catch (ReflectiveOperationException ignored) {}
            if (clean(item, 0, new IdentityHashMap<>())) result.add(item);
            else if (item != null && seen.size() < 25 && seen.add(item.getClass().getName()))
                android.util.Log.i("MusicModClean", "Hidden block " + item.getClass().getSimpleName());
        }
        return result.size() == source.size() ? source : result;
    }
    private static boolean clean(Object value, int depth, IdentityHashMap<Object, Boolean> visited) {
        if (value == null || depth > 5 || visited.size() > 400 || visited.put(value, true) != null) return true;
        Class<?> type = value.getClass(); String name = type.getSimpleName();
        if (name.endsWith("TrackDto") || name.endsWith("AlbumDto") || name.endsWith("ArtistDto") || name.endsWith("PlaylistDto")) return true;
        if (!type.getName().startsWith("com.yandex.music.") && !type.getName().startsWith("ru.yandex.music.")) return true;
        if (name.contains("Concert") || name.contains("Donation") || name.contains("Quest") || name.contains("YandexBooks")
            || name.contains("Bookmate") || name.contains("DynamicBanner") || name.contains("Subscription") || name.contains("Upsell")) return false;
        boolean removed = false;
        for (Field field : type.getDeclaredFields()) {
            if (Modifier.isStatic(field.getModifiers()) || field.getType().isPrimitive()) continue;
            try {
                field.setAccessible(true); Object item = field.get(value);
                String key = field.getName().toLowerCase(Locale.ROOT);
                if (item instanceof String) {
                    String text = ((String)item).toLowerCase(Locale.ROOT);
                    if ((key.equals("type") || key.equals("id")) && blockType(text) == null) return false;
                    if ((key.equals("title") || key.equals("text") || key.equals("name"))
                        && (text.equals("концерты") || text.equals("книги") || text.equals("подкасты") || text.equals("аудиокниги"))) return false;
                    if ((key.contains("link") || key.equals("url")) && (text.contains("afisha.yandex") || text.contains("/concert")
                        || text.contains("://concert") || text.contains("bookmate") || text.contains("/paywall") || text.contains("/subscription"))) return false;
                } else if (item instanceof List<?>) {
                    ArrayList<Object> filtered = new ArrayList<>();
                    for (Object child : (List<?>)item) if (clean(child, depth + 1, visited)) filtered.add(child);
                    if (filtered.size() != ((List<?>)item).size()) {
                        field.set(value, filtered);
                        if (filtered.isEmpty()) removed = true;
                    }
                } else if (item != null && !clean(item, depth + 1, visited)) return false;
            } catch (ReflectiveOperationException | RuntimeException ignored) { /* Preserve unsupported DTOs. */ }
        }
        return !removed;
    }
    public static void filterTabs(Set<?> tabs) {
        for (Iterator<?> i = tabs.iterator(); i.hasNext();) {
            Object tab = i.next();
            if (!(tab instanceof Enum<?>)) continue;
            String name = ((Enum<?>)tab).name();
            if (!name.equals("LANDING") && !name.equals("WAVE") && !name.equals("MY_MUSIC")) i.remove();
        }
    }
}
