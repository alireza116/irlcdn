library(cartography)
library(geojsonio)
library(sf)
library(dplyr)
library(stringr)

# spdf <- geojson_read("illinois_ethnicity.geojson",  what = "sp")
# spdf <- geojson_read("illinois_language.geojson",  what = "sp")

# mtq <- st_read("illinois_ethnicity.geojson")
mtq <- st_read("illinois_lang_2015_Jul_2021.geojson")


names <- names(mtq)
names
first <- 4
# second <- length(colnames)
second <- 120

rootPath <- "./language/"
for (col in names[first:second]) {
  tryCatch({
    # clean out column name.
      col_rename <- str_replace(col,"Estimate..Total...","")   %>% 
        str_replace_all("\\.\\.\\.","\n") %>%
        str_replace_all("\\."," ") %>%
        str_replace_all("\\.\\."," ")
      cat(col)
      cat("\n")
      
      sizes <- getFigDim(x = mtq, width = 800, mar = c(2,2,2,2))
      # export the map
      title <- paste(rootPath,col,".pdf")
      pdf(file = title, width = sizes[1]/72, height = sizes[2]/72)
      par(mar = c(2,2,2,2))
      a<- plot(st_geometry(mtq), col = "#D1914D", border = "white", bg = "white")
      a<-choroLayer(
        x = mtq, 
        var = col,
        method = "kmeans",
        nclass=5,
        col = carto.pal(pal1 = "green.pal", n1 = 5),
        border = "white", 
        lwd = 0.5,
        legend.pos = "bottomleft", 
        legend.values.rnd=5,
        legend.title.txt = paste(col_rename,"\n total estimate"),
        add = TRUE
      ) 
      
      labelLayer(
        x = mtq, 
        txt = "COUNTY_NAM", 
        col= "black", 
        cex = 0.7, 
        font = 4,
        halo = TRUE, 
        bg = "white", 
        r = 0.1, 
        overlap = FALSE, 
        show.lines = FALSE
      )
    
      # layout
      layoutLayer(title = "Language",
                  frame = FALSE, north = FALSE, tabtitle = FALSE)
      dev.off()
      Sys.sleep(1)
      # DENSITY MAP
      cat("density")
      cat("\n")
      mtq$col_density <- mtq[[col]] / mtq$Total. * 100
      title <- paste(rootPath,col,"_density",".pdf")
      pdf(file = title, width = sizes[1]/72, height = sizes[2]/72)
      par(mar = c(2,2,2,2))
      a<- plot(st_geometry(mtq), col = "#D1914D", border = "white", bg = "white")
      a<-choroLayer(
        x = mtq, 
        var = "col_density",
        method = "kmeans",
        nclass=5,
        col = carto.pal(pal1 = "green.pal", n1 = 5),
        border = "white", 
        lwd = 0.5,
        legend.pos = "bottomleft", 
        legend.values.rnd=5,
        legend.title.txt = paste(col_rename,"\n density"),
        add = TRUE
      ) 
      
      labelLayer(
        x = mtq, 
        txt = "COUNTY_NAM", 
        col= "black", 
        cex = 0.7, 
        font = 4,
        halo = TRUE, 
        bg = "white", 
        r = 0.1, 
        overlap = FALSE, 
        show.lines = FALSE
      )
      
      # layout
      layoutLayer(title = "Language",
                  frame = FALSE, north = FALSE, tabtitle = FALSE)
      dev.off()
  }, error=function(e){cat("ERROR :",conditionMessage(e), "\n")})
}

dev.off()
