#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QLabel>
#include <QPushButton>

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);

    signals:
        void inputRequested();

public slots:
    void displayGlycemicIndex(int index);
    void showError(const QString &errorMessage);

private:
    QLabel *m_definitionLabel;
    QLabel *m_resultLabel;
    QPushButton *m_inputButton;
};

#endif // MAINWINDOW_H