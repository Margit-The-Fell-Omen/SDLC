package dev.ushki;

import dev.ushki.controller.Controller;
import dev.ushki.model.LaterModel;
import dev.ushki.view.MainView;

import javax.swing.SwingUtilities;

/**
 * Точка входа. Создаёт модель, представление и контроллер,
 * связывает их между собой и отображает главное окно.
 */
public class Main {

    public static void main(String[] args) {
        LaterModel model = new LaterModel();
        MainView view = new MainView();
        new Controller(model, view);

        SwingUtilities.invokeLater(() -> view.setVisible(true));
    }
}
