package ru.yandex.music.mod;

public final class ListeningClockTest {
    private static void equal(long actual, long expected, String label) {
        if (actual != expected) throw new AssertionError(label + ": " + actual + " != " + expected);
    }
    public static void main(String[] args) {
        ListeningClock clock = new ListeningClock();
        equal(clock.sample(1000, true), 0, "initial playing state");
        equal(clock.sample(11000, true), 10000, "ten seconds of playback");
        equal(clock.sample(12000, false), 1000, "tail before pause");
        equal(clock.sample(72000, false), 0, "pause contributes no time");
        equal(clock.sample(73000, true), 0, "resume contributes no paused time");
        equal(clock.sample(74000, true), 1000, "seek is independent of elapsed time");
        equal(clock.sample(174000, true), 30000, "unobserved gap is bounded");
        equal(clock.sample(173000, false), 0, "clock cannot subtract time");
        System.out.println("PASS: listening, pause, resume, seek and observation gaps");
    }
}
