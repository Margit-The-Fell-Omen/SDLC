package dev.ushki.view;

import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import java.awt.FlowLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;

/**
 * Дополнительное окно для ввода возраста.
 * При повторном открытии восстанавливает последнее введённое значение.
 */
public class InputDialog extends JDialog {

    private final JTextField ageField = new JTextField(10);
    private Integer age = null;

    public InputDialog(JFrame owner, Integer lastAge) {
        super(owner, "Ввод данных", true);
        setLayout(new GridBagLayout());

        // Восстановление последнего введённого значения
        if (lastAge != null && lastAge >= 0) {
            ageField.setText(String.valueOf(lastAge));
            ageField.selectAll();
        }

        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(6, 6, 6, 6);
        c.gridx = 0;
        c.gridy = 0;
        add(new JLabel("Введите возраст (лет):"), c);

        c.gridx = 1;
        add(ageField, c);

        JPanel buttons = new JPanel(new FlowLayout());
        JButton ok = new JButton("OK");
        JButton cancel = new JButton("Отмена");
        buttons.add(ok);
        buttons.add(cancel);

        c.gridx = 0;
        c.gridy = 1;
        c.gridwidth = 2;
        add(buttons, c);

        ok.addActionListener(e -> {
            try {
                age = Integer.parseInt(ageField.getText().trim());
                dispose();
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Введите целое число",
                        "Ошибка", JOptionPane.ERROR_MESSAGE);
            }
        });

        cancel.addActionListener(e -> {
            age = null;
            dispose();
        });

        pack();
        setLocationRelativeTo(owner);
    }

    public Integer getAge() {
        return age;
    }
}
