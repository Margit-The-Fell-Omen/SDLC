#include "inputdialog.h"
#include <QVBoxLayout>
#include <QLabel>
#include <QMessageBox>

InputDialog::InputDialog(QWidget *parent)
    : QDialog(parent)
{
    setWindowTitle("Ввод продукта");
    resize(400, 180);

    QVBoxLayout *layout = new QVBoxLayout(this);

    QLabel *label = new QLabel("Введите название продукта:", this);
    label->setStyleSheet("font-size: 14px;");

    m_productEdit = new QLineEdit(this);
    m_productEdit->setPlaceholderText("Например: гречка, рис, яблоко, банан");
    m_productEdit->setStyleSheet("font-size: 14px; padding: 8px;");

    // Восстанавливаем последний ввод
    if (!m_lastProduct.isEmpty()) {
        m_productEdit->setText(m_lastProduct);
    }

    m_okButton = new QPushButton("OK", this);
    m_okButton->setFixedSize(120, 35);
    m_okButton->setStyleSheet("font-size: 13px; font-weight: bold; "
                              "background-color: #4CAF50; color: white; "
                              "border-radius: 5px;");

    layout->addWidget(label);
    layout->addWidget(m_productEdit);
    layout->addSpacing(10);
    layout->addWidget(m_okButton, 0, Qt::AlignCenter);

    connect(m_okButton, &QPushButton::clicked,
            this, &InputDialog::onOkClicked);
    connect(m_productEdit, &QLineEdit::returnPressed,
            this, &InputDialog::onOkClicked);
}

QString InputDialog::getLastProduct() const
{
    return m_lastProduct;
}

void InputDialog::onOkClicked()
{
    QString product = m_productEdit->text().trimmed();

    if (product.isEmpty()) {
        QMessageBox::warning(this, "Ошибка",
                             "Название продукта не может быть пустым!");
        return;
    }

    bool hasDigit = false;
    for (QChar ch : product) {
        if (ch.isDigit()) {
            hasDigit = true;
            break;
        }
    }
    if (hasDigit) {
        QMessageBox::warning(this, "Ошибка",
                             "Название продукта не должно содержать цифры!");
        return;
    }

    if (product.length() < 3) {
        QMessageBox::warning(this, "Ошибка",
                             "Название продукта слишком короткое!");
        return;
    }

    m_lastProduct = product;

    emit productEntered(product);

    accept();
}