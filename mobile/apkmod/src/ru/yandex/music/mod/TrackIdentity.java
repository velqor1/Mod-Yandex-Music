package ru.yandex.music.mod;

import java.text.Normalizer;
import java.util.Locale;

/** MediaSession IDs may be queue IDs. A catalog ID alone never proves track identity. */
final class TrackIdentity {
    static String normalize(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFKC)
            .toLowerCase(Locale.ROOT).replace('ё', 'е').replaceAll("[^\\p{L}\\p{N}]+", " ").trim();
    }
    static String key(String title, String artist, String album) {
        return normalize(title) + "\n" + normalize(artist) + "\n" + normalize(album);
    }
    static boolean matches(String title, String artist, String candidateTitle, String candidateArtist) {
        String a = normalize(artist), b = normalize(candidateArtist);
        return !a.isEmpty() && a.equals(b) && !normalize(title).isEmpty() && normalize(title).equals(normalize(candidateTitle));
    }
}
