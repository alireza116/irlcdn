library(geojsonio)
library(broom)
library(ggplot2)
library(dplyr)
library(stringr)
library(classInt)
library(viridis)
library(BAMMtools)
library(rlang)
library(tmap)


spdf <- geojson_read("illinois_ethnicity.geojson",  what = "sp")

