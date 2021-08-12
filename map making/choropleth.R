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
spdf$STATE_CODE <- as.character(spdf$STATE_CODE)

map <- tm_shape(spdf) + tm_polygons("TOTALPOP",style = "quantile",palette = "BuPu",classes=7) + tm_layout(inner.margins = c(0.06, 0.10, 0.10, 0.08)) + tm_text("COUNTY_NAM",size=0.3) + tmap_save(filename="sag.jpg",dpi=300)

spdf_fortified <- tidy(spdf, region = "STATE_CODE")


spdf_fortified = spdf_fortified %>%
  left_join(. , spdf, by=c("id"="STATE_CODE"),`copy` = TRUE)



oldcolnames <- names(spdf_fortified)

# newcolnames <- oldcolnames %>% str_replace("Estimate..Total...","")   %>% str_replace_all("\\.\\.\\.",", ")  %>% str_replace_all("\\."," ") 

# spdf_fortified <- spdf_fortified %>% rename_at(vars(oldcolnames), ~ newcolnames)


spdf_fortified[density_columns] <- spdf_fortified[oldcolnames] / spdf_fortified$TOTALPOP.x

# spdf_fortified %>% select(contains("Estimate")| contains("TOTALPOP")) %>% mutate_at(vars(-TOTALPOP), funs(. / TOTALPOP * 100))

spdf_fortified_density <- spdf_fortified %>% select(contains("Estimate") | contains("TOTALPOP")) %>% mutate_at(vars(-TOTALPOP), funs(. / TOTALPOP * 100))
density_columns <- paste(oldcolnames,"...density")
spdf_fortified %>% mutate()

spdf_fortified_density <- spdf_fortified_density %>% rename_at(spdf_fortified_density, vars(oldcolnames), ~ density_columns)


first <- 21
# second <- length(colnames)
second <- first + 2

oldcolnames

save <- FALSE

for (col in oldcolnames[first:second]) {
  cat(col)
  col_rename <- str_replace(col,"Estimate..Total...","")   %>% str_replace_all("\\.\\.\\.",", ")  
  #%>% str_replace_all("\\."," ")
  cat(col_rename)
  # breaks <- getJenksBreaks(spdf[[col]],k=7)
  breaks <- classIntervals(spdf[[col]], n = 5, style = "kmeans")$brks
  spdf_fortified <- spdf_fortified %>% mutate(county_class = cut(!!parse_quo(col,env = caller_env()),breaks,include.lowest = T))
  cat(spdf_fortified$county_class)
  cat(breaks)
  cat("\n")
    p <- ggplot() +
    geom_polygon(data = spdf_fortified, aes_string(fill = county_class, x = "long", y = "lat", group = "group") , size=0, alpha=0.9) +
    theme_void() +
    # scale_fill_viridis( breaks=breaks,
    #                    guide = guide_legend( keyheight = unit(2, units = "mm"),
    #                     keywidth=unit(6, units = "mm"), label.position = "bottom",
    #                     title.position = 'top', nrow=7), name=col_rename,trans="log" ) +
    scale_fill_brewer(palette="Greens") +
      # scale_fill_gradientn(
      #   colours = terrain.colors(15), 
      #   breaks = seq(from = 0, to = 0.7, by = 0.05)
      # )
    labs(
      title = col_rename,
      subtitle = "Data: ACS 2019",
      caption = "IRCDLN"
    ) +
    theme(
      text = element_text(color = "#22211d"),
      plot.background = element_rect(fill = "#f5f5f2", color = NA),
      # legend.title=element_text(col_rename)
      # panel.background = element_rect(fill = "#f5f5f2", color = NA),
      # legend.background = element_rect(fill = "#f5f5f2", color = NA),

      # plot.title = element_text(size= 10, hjust=-0.8, color = "#4e4d47", margin = margin(b = 0, t = 0.2, l = 1, unit = "cm")),
      # plot.subtitle = element_text(size= 10, hjust=-0.55, color = "#4e4d47", margin = margin(b = 0, t = 0.2, l = 1, unit = "cm")),
# 
#       legend.position = c(00.05, 0.03),
    ) +
    theme(plot.margin = unit(c(0,1,0.5,1), "cm")) +
    coord_map()
    if (save) {
      ggsave(
        paste(col_rename,".jpg"),
        plot = p,
        dpi = 300,
        limitsize = TRUE,
      )
    } else {
      print(p)
      Sys.sleep(2)
    }
}


 
