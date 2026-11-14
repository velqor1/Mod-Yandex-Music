package ru.yandex.music.mod;

public final class TrackIdentityTest {
    private static void check(boolean ok, String label) { if (!ok) throw new AssertionError(label); }
    public static void main(String[] args) {
        check(!TrackIdentity.matches("Песня", "Артист", "Другая песня", "Артист"), "Reject wrong song behind a numeric queue ID");
        check(!TrackIdentity.matches("Песня", "Артист", "Песня", "Другой артист"), "Reject wrong artist");
        check(!TrackIdentity.matches("Песня", "Артист", "Песня (Live)", "Артист"), "Keep distinct versions separate");
        check(TrackIdentity.matches("Ещё!", "ТЕСТ", "ЕЩЕ", "Тест"), "Normalize Cyrillic case and punctuation");
        check(!TrackIdentity.matches("Песня", "", "Песня", "Артист"), "Do not guess an unknown artist");
        check(!TrackIdentity.key("Песня", "Артист", "Альбом").equals(TrackIdentity.key("Другая", "Артист", "Альбом")), "Queue ID reuse cannot merge distinct songs");
        System.out.println("PASS: identity rejects wrong song, wrong artist and alternate versions");
    }
}
