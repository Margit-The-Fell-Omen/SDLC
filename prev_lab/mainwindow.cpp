#include "mainwindow.h"
#include <QVBoxLayout>
#include <QMessageBox>
#include <QFrame>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    setWindowTitle("Гликемический индекс продуктов");
    resize(600, 400);

    QWidget *centralWidget = new QWidget(this);
    QVBoxLayout *layout = new QVBoxLayout(centralWidget);

    // Заголовок
    QLabel *titleLabel = new QLabel("ГЛИКЕМИЧЕСКИЙ ИНДЕКС", this);
    titleLabel->setAlignment(Qt::AlignCenter);
    titleLabel->setStyleSheet("font-size: 20px; font-weight: bold; "
                              "color: #333; padding: 10px;");

    // Определение ГИ
    m_definitionLabel = new QLabel(
        "Гликемический индекс (ГИ) - это показатель, который отражает "
        "скорость повышения уровня глюкозы в крови после употребления "
        "продукта. Чем выше ГИ, тем быстрее повышается сахар в крови. "
        "Продукты с низким ГИ (до 55) усваиваются медленно, со средним (56-69) - "
        "умеренно, с высоким (70 и выше) - быстро.",
        this);
    m_definitionLabel->setWordWrap(true);
    m_definitionLabel->setStyleSheet("font-size: 14px; padding: 15px; "
                                     "background-color: #f0f0f0; "
                                     "border-radius: 5px;");

    // Кнопка ввода
    m_inputButton = new QPushButton("Ввести продукт", this);
    m_inputButton->setFixedSize(180, 45);
    m_inputButton->setStyleSheet("font-size: 14px; font-weight: bold; "
                                 "background-color: #4CAF50; color: white; "
                                 "border-radius: 5px; padding: 10px;");

    // Метка для результата
    m_resultLabel = new QLabel("Гликемический индекс: ---", this);
    m_resultLabel->setAlignment(Qt::AlignCenter);
    m_resultLabel->setStyleSheet("font-size: 18px; font-weight: bold; "
                                 "padding: 15px; color: #666;");
    m_resultLabel->setFrameStyle(QFrame::Box | QFrame::Raised);
    m_resultLabel->setLineWidth(2);

    layout->addWidget(titleLabel);
    layout->addWidget(m_definitionLabel);
    layout->addSpacing(20);
    layout->addWidget(m_inputButton, 0, Qt::AlignCenter);
    layout->addSpacing(20);
    layout->addWidget(m_resultLabel);

    setCentralWidget(centralWidget);

    connect(m_inputButton, &QPushButton::clicked,
            this, &MainWindow::inputRequested);
}

void MainWindow::displayGlycemicIndex(int index)
{
    QString category;
    QString color;

    if (index <= 55) {
        category = "низкий";
        color = "green";
    } else if (index <= 69) {
        category = "средний";
        color = "orange";
    } else {
        category = "высокий";
        color = "red";
    }

    m_resultLabel->setText(QString("Гликемический индекс: %1 (%2)")
                               .arg(index)
                               .arg(category));
    m_resultLabel->setStyleSheet(QString("font-size: 18px; font-weight: bold; "
                                         "padding: 15px; color: %1;").arg(color));
}

void MainWindow::showError(const QString &errorMessage)
{
    QMessageBox::warning(this, "Ошибка", errorMessage);
}