@startuml
package "GlycemicIndexCalculator" {
    class GlycemicModel
    class MainWindow
    class InputDialog
    class Controller
}

MainWindow --> Controller : inputRequested
InputDialog --> Controller : productEntered
Controller --> GlycemicModel : setCurrentProduct()
GlycemicModel --> MainWindow : glycemicIndexReady
GlycemicModel --> MainWindow : errorOccurred
@enduml