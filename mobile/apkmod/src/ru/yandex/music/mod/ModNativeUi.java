package ru.yandex.music.mod;

import android.os.SystemClock;
import android.view.View;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayDeque;
import java.util.List;
import java.util.Map;
import java.util.WeakHashMap;

/** Read-only access to this pinned build's own Compose semantics; no Accessibility service. */
final class ModNativeUi {
    private static final WeakHashMap<View, Result> cache = new WeakHashMap<>();
    private static Method children;
    private static Field configuration;
    private static final class Result { long time; boolean back, search, player; }
    static boolean hasPlayer(View view) {
        if (!view.isShown() || "music.mod.navigation".equals(view.getTag())) return false;
        if ("androidx.compose.ui.platform.AndroidComposeView".equals(view.getClass().getName())) {
            hasBackAction(view); Result value = cache.get(view); return value != null && value.player;
        }
        if (view instanceof android.view.ViewGroup) {
            android.view.ViewGroup group = (android.view.ViewGroup)view;
            for (int i = 0; i < group.getChildCount(); i++) if (hasPlayer(group.getChildAt(i))) return true;
        }
        return false;
    }
    static boolean hasHeaderSearch(View view) {
        if (!view.isShown()) return false;
        if ("androidx.compose.ui.platform.AndroidComposeView".equals(view.getClass().getName())) {
            hasBackAction(view); Result result = cache.get(view); return result != null && result.search && !result.back;
        }
        if ("Поиск".contentEquals(view.getContentDescription() == null ? "" : view.getContentDescription())) return true;
        if (view instanceof android.view.ViewGroup) {
            android.view.ViewGroup group = (android.view.ViewGroup)view;
            for (int i = 0; i < group.getChildCount(); i++) if (hasHeaderSearch(group.getChildAt(i))) return true;
        }
        return false;
    }
    static boolean hasBackAction(View compose) {
        long now = SystemClock.uptimeMillis(); Result old = cache.get(compose);
        if (old != null && now - old.time < 160) return old.back;
        boolean back = false, search = false, otherTab = false, player = false;
        try {
            Object owner = compose.getClass().getMethod("getSemanticsOwner").invoke(compose);
            Object root = owner.getClass().getMethod("a").invoke(owner);
            if (children == null) {
                children = root.getClass().getMethod("i", boolean.class, boolean.class);
                configuration = root.getClass().getField("d");
            }
            ArrayDeque<Object> pending = new ArrayDeque<>(); pending.add(root); int count = 0;
            while (!pending.isEmpty() && count++ < 800) {
                Object node = pending.removeFirst(); Object config = configuration.get(node);
                boolean selected = false; java.util.List<?> labels = null;
                if (config instanceof Iterable<?>) for (Object item : (Iterable<?>)config) {
                    if (!(item instanceof Map.Entry<?, ?>)) continue;
                    Map.Entry<?, ?> entry = (Map.Entry<?, ?>)item;
                    if (entry.getKey().toString().contains("Selected") && Boolean.TRUE.equals(entry.getValue())) selected = true;
                    if (!entry.getKey().toString().contains("ContentDescription")) continue;
                    Object value = entry.getValue(); if (value instanceof List<?>) labels = (List<?>)value;
                    if (value instanceof List<?>) for (Object label : (List<?>)value) {
                        if ("Поиск".equals(label)) search = true;
                        if ("Свернуть".equals(label) || "Закрыть плеер".equals(label) || "Collapse player".equals(label)) player = true;
                        if (player || "Назад".equals(label)) { back = true; break; }
                    }
                }
                if (selected && labels != null) for (Object label : labels) {
                    String title = String.valueOf(label);
                    if (title.equals("Коллекция") || title.equals("Книги") || title.equals("Подкасты")) otherTab = true;
                }
                // Back can occur before Collapse in the tree. Continue so a full player
                // never leaves the bottom navigation floating over its controls.
                Object nodes = children.invoke(node, false, false);
                if (nodes instanceof List<?>) for (Object child : (List<?>)nodes) if (child != null) pending.add(child);
            }
        } catch (ReflectiveOperationException | RuntimeException ignored) { /* Original navigation remains available. */ }
        back = back || otherTab;
        if (old == null || old.back != back || old.search != search) android.util.Log.i("MusicModGlass", "Header search=" + search + " back=" + back);
        Result result = new Result(); result.time = now; result.back = back; result.search = search; result.player = player; cache.put(compose, result); return back;
    }
}
