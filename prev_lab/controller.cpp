#include "controller.h"
#include "mainwindow.h"
#include "inputdialog.h"
#include <QDebug>

Controller::Controller(GlycemicModel *model, QObject *parent)
    : QObject(parent), m_model(model), m_mainWindow(nullptr), m_inputDialog(nullptr)
{
}

void Controller::setViews(MainWindow *mainWindow, InputDialog *inputDialog)
{
    m_mainWindow = mainWindow;
    m_inputDialog = inputDialog;

    connect(m_mainWindow, &MainWindow::inputRequested,
            this, &Controller::onInputRequested);

    connect(m_inputDialog, &InputDialog::productEntered,
            this, &Controller::onProductEntered);

    connect(m_model, &GlycemicModel::glycemicIndexReady,
            m_mainWindow, &MainWindow::displayGlycemicIndex);

    connect(m_model, &GlycemicModel::errorOccurred,
            m_mainWindow, &MainWindow::showError);

    qDebug() << "MVC Controller: все соединения установлены";
}

void Controller::onInputRequested()
{
    qDebug() << "Пользователь нажал кнопку 'Ввести продукт'";
    m_inputDialog->show();
    m_inputDialog->raise();
    m_inputDialog->activateWindow();
}

void Controller::onProductEntered(const QString &product)
{
    qDebug() << "Получен продукт от View:" << product;
    m_model->setCurrentProduct(product);
}