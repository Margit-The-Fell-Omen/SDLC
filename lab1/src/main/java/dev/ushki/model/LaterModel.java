package dev.ushki.model;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

/**
 * Активная модель приложения.
 * Хранит данные и бизнес-логику, самостоятельно уведомляет
 * зарегистрированных наблюдателей об изменении состояния.
 */
public class LaterModel {

    // Усреднённая статистика: человек начинает осознанно откладывать дела
    // примерно с 5 лет и в среднем говорит «потом» около 5 раз в день.
    private static final int START_AGE = 5;
    private static final int TIMES_PER_DAY = 5;
    private static final int DAYS_PER_YEAR = 365;

    private int age = -1;
    private long timesSaidLater;

    private final PropertyChangeSupport support = new PropertyChangeSupport(this);

    public void addListener(PropertyChangeListener listener) {
        support.addPropertyChangeListener(listener);
    }

    public void removeListener(PropertyChangeListener listener) {
        support.removePropertyChangeListener(listener);
    }

    public int getAge() {
        return age;
    }

    public long getTimesSaidLater() {
        return timesSaidLater;
    }

    public void setAge(int newAge) {
        int oldAge = this.age;
        this.age = newAge;
        this.timesSaidLater = calculate(newAge);
        // Активная модель: оповещаем представление об изменении состояния.
        support.firePropertyChange("result", oldAge, newAge);
    }

    private long calculate(int age) {
        if (age <= START_AGE) {
            return 0;
        }
        return (long) (age - START_AGE) * DAYS_PER_YEAR * TIMES_PER_DAY;
    }
}
