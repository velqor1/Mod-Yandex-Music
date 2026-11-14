package ru.yandex.music.mod;

/** Critically damped motion in tab units. Retargeting preserves both position and velocity. */
final class NavMotion {
    private static final double FREQUENCY = 25;
    double position, velocity;
    int target;
    void snap(int value) { target = value; position = value; velocity = 0; }
    void target(int value) { target = value; }
    boolean step(double seconds) {
        double t = Math.max(0, seconds);
        double offset = position - target;
        double coefficient = velocity + FREQUENCY * offset;
        double decay = Math.exp(-FREQUENCY * t);
        position = target + (offset + coefficient * t) * decay;
        velocity = (velocity - FREQUENCY * coefficient * t) * decay;
        if (Math.abs(position - target) < .003 && Math.abs(velocity) < .05) {
            snap(target); return false;
        }
        return true;
    }
}
