#ifndef CONTROLLER_H
#define CONTROLLER_H

#include <QObject>
#include "glycemicmodel.h"

class MainWindow;
class InputDialog;

class Controller : public QObject
{
    Q_OBJECT

public:
    explicit Controller(GlycemicModel *model, QObject *parent = nullptr);

    void setViews(MainWindow *mainWindow, InputDialog *inputDialog);

public slots:
    void onInputRequested();
    void onProductEntered(const QString &product);

private:
    GlycemicModel *m_model;
    MainWindow *m_mainWindow;
    InputDialog *m_inputDialog;
};

#endif // CONTROLLER_H