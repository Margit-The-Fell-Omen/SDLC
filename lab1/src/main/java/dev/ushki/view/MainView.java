package dev.ushki.view;

import dev.ushki.controller.Controller;
import dev.ushki.model.LaterModel;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

/**
 * Представление: главное окно приложения.
 * Реализует PropertyChangeListener и обновляет элементы интерфейса
 * при получении уведомления от активной модели.
 */
public class MainView extends JFrame implements PropertyChangeListener {

    private final JLabel ageLabel = new JLabel("Возраст: не введён");
    private final JLabel resultLabel = new JLabel("Результат: –");
    private final JButton enterButton = new JButton("Ввести данные");

    private Controller controller;
    private Integer lastAge = null;

    public MainView() {
        super("Сколько раз ты сказал «потом»");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(430, 210);
        setLocationRelativeTo(null);
        setLayout(new GridBagLayout());

        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(8, 8, 8, 8);
        c.gridx = 0;
        c.gridy = 0;
        c.anchor = GridBagConstraints.WEST;
        add(ageLabel, c);

        c.gridy = 1;
        add(resultLabel, c);

        c.gridy = 2;
        c.anchor = GridBagConstraints.CENTER;
        add(enterButton, c);

        enterButton.addActionListener(e -> controller.onEnterData());
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    @Override
    public void propertyChange(PropertyChangeEvent evt) {
        LaterModel model = (LaterModel) evt.getSource();
        if (model.getAge() >= 0) {
            lastAge = model.getAge();
            ageLabel.setText("Возраст: " + model.getAge() + " лет");
            resultLabel.setText("Вы сказали «потом» примерно "
                    + String.format("%,d", model.getTimesSaidLater()) + " раз(а)");
        }
    }

    public Integer askAge() {
        InputDialog dialog = new InputDialog(this, lastAge);
        dialog.setVisible(true);
        return dialog.getAge();
    }

    public void showError(String message) {
        JOptionPane.showMessageDialog(this, message, "Ошибка",
                JOptionPane.ERROR_MESSAGE);
    }
}
