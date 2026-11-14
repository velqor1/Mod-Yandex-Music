package ru.yandex.music.mod;

public final class NavRequestsTest {
    private static void require(boolean value) { if (!value) throw new AssertionError(); }
    public static void main(String[] args) {
        NavRequests queue = new NavRequests();
        // Collection -> Home before the visual motion finishes: no native reselect.
        queue.request(1); queue.request(0);
        require(queue.take(0, false) == -1 && !queue.pending());
        // Tab flag may acknowledge Collection before the Fragment has committed.
        queue.request(1); require(queue.take(0, false) == 1);
        queue.request(0);
        require(queue.take(1, false) == -1 && queue.inFlight == 1);
        // A second completion callback cannot send the same transaction twice.
        require(queue.take(0, false) == -1);
        queue.complete(); require(queue.take(1, false) == 0);
        queue.request(1); queue.request(0); queue.request(1);
        require(queue.take(0, false) == -1);
        queue.complete(); require(queue.take(0, false) == 1);
        queue.complete(); require(!queue.pending());
        // In a nested screen same-tab navigation is an intentional return action.
        queue.request(1); require(queue.take(1, true) == 1);
        queue.cancel(); require(!queue.pending());
        System.out.println("NavRequests: coalescing, early tab flag, single in-flight transaction, latest intent, nested return passed");
    }
}
