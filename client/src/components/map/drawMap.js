import React, { useEffect, useRef } from "react";
import L from "leaflet";
import MarkerCluster from "leaflet.markercluster";
import LeafletDraw from "leaflet-draw";
import LeafletHeat from "leaflet.heat";
import { ResponsivePie } from "@nivo/pie";
import { renderToString } from "react-dom/server";
import { legend } from "../../functions/d3-colorlegend";
import * as d3 from "d3";

const Map = (props) => {
  const mapRef = useRef(null);
  const geojsonLayer = React.useRef(null);
  const editableLayer = React.useRef(null);
  const layerControl = React.useRef(null);

  let getValue = (properties, keys) => {
    console.log(props.densityValue);
    let denominator =
      props.densityValue === "density" ? properties.TOTALPOP : 1;
    console.log(denominator);
    if (keys.length === 1) {
      return properties.counts[keys[0]].value / denominator;
    } else if (keys.length === 2) {
      return properties.counts[keys[0]].children[keys[1]].value / denominator;
    } else if (keys.length === 3) {
      return (
        properties.counts[keys[0]].children[keys[1]].children[keys[2]].value /
        denominator
      );
    }
  };
  useEffect(() => {
    if (props.mapId === null) return;
    console.log(props.mapId);
    let grey = L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 20,
      }
    );
    // .addTo(mapRef.current);

    var mapInk = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 20,
      }
    );

    mapRef.current = L.map(props.mapId, {
      center: [0, 0],
      zoom: 2,
      layers: [grey, mapInk],
    });

    var baseMaps = {
      Grayscale: grey,
      Streets: mapInk,
    };

    layerControl.current = L.control
      .layers(baseMaps, {}, { position: "bottomleft" })
      .addTo(mapRef.current);

    editableLayer.current = new L.FeatureGroup();
    mapRef.current.addLayer(editableLayer.current);
    layerControl.current.addOverlay(editableLayer.current, "Drawn Features");

    // + cluster.getChildCount() +

    let drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: editableLayer.current, //REQUIRED!!
        remove: true,
      },
    });
    mapRef.current.addControl(drawControl);

    mapRef.current.on(L.Draw.Event.CREATED, function (e) {
      var type = e.layerType,
        layer = e.layer;

      layer.feature = layer.feature || { type: "Feature", properties: {} };

      layer.on("click", (e) => {
        console.log(e);
        // let target = e.target;
        if (!("SNCO" in layer.feature.properties)) {
          props.handleOpenDialog(layer);
        }

        // console.log(layerGeojson);
        // props.handleFeatureSearch(layer, type);
      });

      editableLayer.current.addLayer(layer);
    });

    geojsonLayer.current = L.geoJSON();
    mapRef.current.addLayer(geojsonLayer.current);

    mapRef.current.addControl(drawControl);
  }, [props.mapId]);

  //   add marker

  useEffect(() => {
    if (props.geojson === null || props.mapId === null) return;
    geojsonLayer.current.clearLayers();

    geojsonLayer.current.addData(props.geojson);

    mapRef.current.on("move", () => {
      props.handleMapExtent(mapRef.current.getBounds(), "data");
    });

    // geojsonLayer.current.eachLayer((layer) => {
    //   if (layer.feature) {
    //     // console.log(layer);
    //     // layer.bindPopup(`${layer.feature.properties.COUNTY_NAM}`);
    //     // let tooltip = L.Tooltip()
    //     layer.bindTooltip(`${layer.feature.properties.COUNTY_NAM}`, {
    //       permanent: true,
    //       direction: "center",
    //       opacity: 1,
    //       className: "leafletLabel",
    //     });
    //     //   .openTooltip();
    //   }
    //   // console.log(layer);
    // });

    let style = (feature) => {
      return {
        fillColor: "lightgrey",
        weight: 0.5,
        opacity: 1,
        color: "white",
        fillOpacity: 0.9,
      };
    };

    geojsonLayer.current.setStyle(style);

    mapRef.current.on("move", () => {
      props.handleMapExtent(mapRef.current.getBounds(), "data");
    });

    geojsonLayer.current.eachLayer((layer) => {
      if (layer.feature) {
        // console.log(layer);
        layer.bindPopup(
          `${layer.feature.properties.COUNTY_NAM}:<br>${getValue(
            layer.feature.properties,
            props.selectedFeature
          )}`
        );
      }
      // console.log(layer);
    });
  }, [props.geojson, props.mapId]);

  useEffect(() => {
    if (props.extent == null) return;
    mapRef.current.fitBounds(props.extent);
  }, [props.extent]);

  return <div id={props.mapId} style={{ width: "100%", height: "100%" }}></div>;
};

export default Map;
