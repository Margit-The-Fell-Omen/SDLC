#ifndef GLYCEMICMODEL_H
#define GLYCEMICMODEL_H

#include <QObject>
#include <QMap>
#include <QString>

class GlycemicModel : public QObject
{
    Q_OBJECT

public:
    explicit GlycemicModel(QObject *parent = nullptr);

    int getGlycemicIndex(const QString &product) const;
    bool productExists(const QString &product) const;
    void setCurrentProduct(const QString &product);

    signals:
        void productChanged(const QString &product);
    void glycemicIndexReady(int index);
    void errorOccurred(const QString &errorMessage);

private:
    QMap<QString, int> m_glycemicData;
    QString m_currentProduct;
};

#endif // GLYCEMICMODEL_H