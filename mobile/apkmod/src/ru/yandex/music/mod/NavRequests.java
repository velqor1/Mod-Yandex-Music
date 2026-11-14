package ru.yandex.music.mod;

/** Latest requested tab, with at most one native transaction in flight. */
final class NavRequests {
    int desired = -1, inFlight = -1;
    void request(int tab) { desired = tab; }
    int take(int actual, boolean sameTabAction) {
        if (inFlight >= 0 || desired < 0) return -1;
        if (!sameTabAction && desired == actual) { desired = -1; return -1; }
        return inFlight = desired;
    }
    void complete() {
        if (desired == inFlight) desired = -1;
        inFlight = -1;
    }
    void cancel() { desired = -1; inFlight = -1; }
    boolean pending() { return desired >= 0 || inFlight >= 0; }
}
