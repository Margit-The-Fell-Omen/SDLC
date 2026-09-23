package dev.ushki.controller;

import dev.ushki.model.LaterModel;
import dev.ushki.view.MainView;

/**
 * Контроллер. Обрабатывает действия пользователя, проверяет корректность
 * данных и координирует взаимодействие модели и представления.
 */
public class Controller {

    private final LaterModel model;
    private final MainView view;

    public Controller(LaterModel model, MainView view) {
        this.model = model;
        this.view = view;
        // Связываем компоненты MVC:
        this.view.setController(this);       // представление -> контроллер
        this.model.addListener(this.view);   // модель -> представление (наблюдатель)
    }

    public void onEnterData() {
        Integer age = view.askAge();
        if (age == null) {
            return; // пользователь отменил ввод
        }
        if (age < 0 || age > 120) {
            view.showError("Возраст должен быть в диапазоне от 0 до 120 лет");
            return;
        }
        model.setAge(age); // модель оповестит представление
    }
}
