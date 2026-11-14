package ru.yandex.music.mod;

public final class NavMotionTest {
    private static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
    private static NavMotion travel(int hz) {
        NavMotion motion = new NavMotion(); motion.snap(0); motion.target(1);
        double previous = 0;
        for (int i = 0; i < hz; i++) {
            motion.step(1.0 / hz);
            require(motion.position >= previous && motion.position <= 1, "No overshoot or backward jump");
            previous = motion.position;
        }
        require(motion.position == 1 && motion.velocity == 0, "Must settle exactly");
        return motion;
    }
    public static void main(String[] args) {
        travel(60); travel(90); travel(120);
        NavMotion low = new NavMotion(), high = new NavMotion();
        low.snap(0); high.snap(0); low.target(1); high.target(1);
        for (int i = 0; i < 6; i++) low.step(1.0 / 60);
        for (int i = 0; i < 12; i++) high.step(1.0 / 120);
        require(Math.abs(low.position - high.position) < 1e-10, "Refresh-rate independent position");
        double p = low.position, v = low.velocity;
        low.target(0);
        require(low.position == p && low.velocity == v, "Retarget must preserve momentum");
        for (int i = 0; i < 120; i++) {
            if (i % 7 == 0) low.target(1 - low.target);
            low.step(1.0 / 120);
            require(Double.isFinite(low.position) && Double.isFinite(low.velocity), "Rapid retarget remains finite");
        }
        low.target(0); low.step(3);
        require(low.position == 0 && low.velocity == 0, "Resume after delayed frame settles");
        System.out.println("NavMotion: 60/90/120Hz, monotonic travel, continuous reversal, rapid taps, delayed frame passed");
    }
}
