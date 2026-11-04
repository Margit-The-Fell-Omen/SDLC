#ifndef INPUTDIALOG_H
#define INPUTDIALOG_H

#include <QDialog>
#include <QLineEdit>
#include <QPushButton>

class InputDialog : public QDialog
{
    Q_OBJECT

public:
    explicit InputDialog(QWidget *parent = nullptr);
    QString getLastProduct() const;

    signals:
        void productEntered(const QString &product);

private slots:
    void onOkClicked();

private:
    QLineEdit *m_productEdit;
    QPushButton *m_okButton;
    QString m_lastProduct;
};

#endif // INPUTDIALOG_H