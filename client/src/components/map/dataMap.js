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
  // console.log(props.geojson);

  let getValue = (properties, keys) => {
    // console.log(props.densityValue);
    let denominator =
      props.densityValue === "density" ? properties.TOTALPOP : 1;

    let value;
    // console.log(denominator);
    if (keys.length === 1) {
      value = properties.counts[keys[0]].value / denominator;
    } else if (keys.length === 2) {
      value = properties.counts[keys[0]].children[keys[1]].value / denominator;
    } else if (keys.length === 3) {
      value =
        properties.counts[keys[0]].children[keys[1]].children[keys[2]].value /
        denominator;
    }

    return props.densityValue === "density" ? (value * 100).toFixed(4) : value;
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

    geojsonLayer.current = L.geoJSON();
    mapRef.current.addLayer(geojsonLayer.current);

    //  mapRef.current.addControl(drawControl);
  }, [props.mapId]);

  //   add marker

  useEffect(() => {
    if (props.geojson === null || props.mapId === null || props.cbos === null)
      return;
    geojsonLayer.current.clearLayers();

    geojsonLayer.current.addData(props.geojson);

    geojsonLayer.current.eachLayer((layer) => {
      if (layer.feature) {
        // console.log(layer);
        layer.bindPopup(`${layer.feature.properties.COUNTY_NAM}`);
      }
      // console.log(layer);
    });

    mapRef.current.fitBounds(geojsonLayer.current.getBounds());
    props.handleMapExtent(mapRef.current.getBounds(), "draw");

    mapRef.current.on("moveend", () => {
      props.handleMapExtent(mapRef.current.getBounds(), "draw");
    });

    if (props.selectedFeature !== null) {
      let getColor = d3.scaleSequentialQuantile(
        props.geojson.map((f) => {
          return getValue(f.properties, props.selectedFeature);
        }),
        d3.interpolateBlues
      );

      let style = (feature) => {
        let fValue = getValue(feature.properties, props.selectedFeature);
        return {
          fillColor: fValue > 0 ? getColor(fValue) : "lightgrey",
          weight: 0.5,
          opacity: 1,
          color: "white",
          fillOpacity: 0.9,
        };
      };

      geojsonLayer.current.setStyle(style);

      geojsonLayer.current.eachLayer((layer) => {
        if (layer.feature) {
          // console.log(layer);
          layer.bindPopup(
            `${layer.feature.properties.COUNTY_NAM}:<br>
            ${getValue(layer.feature.properties, props.selectedFeature)} ${
              props.densityValue === "density" ? "%" : ""
            }`
          );
        }
        // console.log(layer);
      });
      var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      };

      function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties) {
          layer.bindPopup(`<div>
            <p>${feature.properties["Agency Name"]}:</p>
            <p>${feature.properties["Address"]}</p>
            <p>Serves ${feature.properties["Geographic Service Area"]} communities</p>
            <p>Phone: ${feature.properties["Telephone Number"]}</p>
            <p>Offers ${feature.properties["Coded Languages other than English"]} languages</p>
            </div>`);
        } else {
          layer.bindPopup("information not available yet.");
        }
      }

      L.geoJSON(props.cbos, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
      }).addTo(mapRef.current);
    }
  }, [
    props.geojson,
    props.cbos,
    props.mapId,
    props.selectedFeature,
    props.densityValue,
  ]);

  // useEffect(() => {
  //   if (props.extent == null) return;
  //   mapRef.current.fitBounds(props.extent);
  // }, [props.extent]);

  return <div id={props.mapId} style={{ width: "100%", height: "100%" }}></div>;
};

export default Map;
