#include "glycemicmodel.h"
#include <QDebug>

GlycemicModel::GlycemicModel(QObject *parent)
    : QObject(parent)
{
    m_glycemicData["гречка"] = 50;
    m_glycemicData["гречневая каша"] = 50;
    m_glycemicData["рис"] = 70;
    m_glycemicData["рис белый"] = 70;
    m_glycemicData["овсянка"] = 55;
    m_glycemicData["овсяная каша"] = 55;
    m_glycemicData["картофель"] = 85;
    m_glycemicData["картофельное пюре"] = 90;
    m_glycemicData["яблоко"] = 35;
    m_glycemicData["банан"] = 60;
    m_glycemicData["хлеб белый"] = 75;
    m_glycemicData["хлеб ржаной"] = 50;
    m_glycemicData["макароны"] = 55;
    m_glycemicData["сахар"] = 100;
    m_glycemicData["мед"] = 90;
    m_glycemicData["апельсин"] = 40;
    m_glycemicData["виноград"] = 45;
    m_glycemicData["арбуз"] = 75;
    m_glycemicData["морковь"] = 35;
    m_glycemicData["свекла"] = 65;
}

bool GlycemicModel::productExists(const QString &product) const
{
    QString lowerProduct = product.toLower().trimmed();
    for (auto it = m_glycemicData.begin(); it != m_glycemicData.end(); ++it) {
        if (it.key().toLower() == lowerProduct) {
            return true;
        }
    }
    return false;
}

int GlycemicModel::getGlycemicIndex(const QString &product) const
{
    QString lowerProduct = product.toLower().trimmed();
    for (auto it = m_glycemicData.begin(); it != m_glycemicData.end(); ++it) {
        if (it.key().toLower() == lowerProduct) {
            return it.value();
        }
    }
    return -1;
}

void GlycemicModel::setCurrentProduct(const QString &product)
{
    QString trimmedProduct = product.trimmed();

    if (trimmedProduct.isEmpty()) {
        emit errorOccurred("Название продукта не может быть пустым!");
        return;
    }

    if (!productExists(trimmedProduct)) {
        emit errorOccurred(QString("Продукт '%1' не найден в базе данных.\n"
                                   "Доступные продукты: гречка, рис, овсянка, "
                                   "картофель, яблоко, банан, хлеб белый").arg(trimmedProduct));
        return;
    }

    m_currentProduct = trimmedProduct;
    int gi = getGlycemicIndex(trimmedProduct);

    emit productChanged(trimmedProduct);
    emit glycemicIndexReady(gi);

    qDebug() << "Продукт:" << trimmedProduct << "ГИ:" << gi;
}