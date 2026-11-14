package ru.yandex.music.mod;

/** Monotonic listening time; seeks and wall-clock changes cannot create listening time. */
final class ListeningClock {
    private long previous = -1;
    private boolean running;

    long sample(long now, boolean playing) {
        long delta = previous < 0 || !running ? 0 : Math.max(0, Math.min(30_000, now - previous));
        previous = now;
        running = playing;
        return delta;
    }
}
