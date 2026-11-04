#include <QApplication>
#include "mainwindow.h"
#include "inputdialog.h"
#include "glycemicmodel.h"
#include "controller.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    GlycemicModel model;
    MainWindow mainWindow;
    InputDialog inputDialog;
    Controller controller(&model);

    controller.setViews(&mainWindow, &inputDialog);

    mainWindow.show();

    return app.exec();
}