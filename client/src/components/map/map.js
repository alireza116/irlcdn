import React, { useEffect, useRef } from "react";
import L from "leaflet";
import MarkerCluster from "leaflet.markercluster";
import LeafletDraw from "leaflet-draw";
import LeafletHeat from "leaflet.heat";
import { ResponsivePie } from "@nivo/pie";
import { renderToString } from "react-dom/server";
import * as d3 from "d3";

let colorMap = {
  Anger: "red",
  Disgust: "purple",
  Fear: "green",
  Joy: "orange",
  Sadness: "blue",
  Surprise: "teal",
};

const Map = (props) => {
  const mapRef = useRef(null);
  const geojsonLayer = React.useRef(null);
  const editableLayer = React.useRef(null);
  const layerControl = React.useRef(null);

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

      layer.on("click", (f) => {
        // console.log(layerGeojson);
        props.handleFeatureSearch(layer, type);
      });

      editableLayer.current.addLayer(layer);
    });

    //  mapRef.current.addControl(drawControl);
  }, [props.mapId]);

  //   add marker

  useEffect(() => {
    if (props.geojson === null || props.mapId === null) return;
    console.log(props.geojson);
    // mapRef.current.setMaxBounds(mapRef.current.getBounds());
    // mapRef.current.on("moveend", function () {
    //   if (props.mapFilter) {
    //     let bounds = mapRef.current.getBounds();
    //     let fInExtent = props.geojson.filter((f) => {
    //       return bounds.contains([
    //         f["geometry"]["coordinates"][1],
    //         f["geometry"]["coordinates"][0],
    //       ]);
    //     });
    //     props.handleExtentFeatures(fInExtent);
    //   }
    // });
    function onEachFeature(feature, layer) {
      // does this feature have a property named popupContent?
      if (feature.properties) {
        layer.bindPopup(feature.properties.COUNTY_NAM);
      }
    }
    let geojsonMarkerOptions = {
      radius: 5,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };

    geojsonLayer.current = L.geoJSON(props.geojson, {
      onEachFeature: onEachFeature,
    });
    mapRef.current.flyToBounds(geojsonLayer.current.getBounds());
    mapRef.current.addLayer(geojsonLayer.current);
  }, [props.geojson, props.mapId]);

  return <div id={props.mapId} style={{ width: "100%", height: "100%" }}></div>;
};

export default Map;
