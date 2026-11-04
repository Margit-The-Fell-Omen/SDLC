cmake_minimum_required(VERSION 3.16)
project(LAB_1 LANGUAGES CXX)

set(CMAKE_PREFIX_PATH "C:/Qt/6.11.2/mingw_64")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets)

add_executable(LAB_1 WIN32
        main.cpp
        mainwindow.cpp
        mainwindow.h
        inputdialog.cpp
        inputdialog.h
        glycemicmodel.cpp
        glycemicmodel.h
        controller.cpp
        controller.h
)

target_link_libraries(LAB_1 PRIVATE Qt6::Widgets)