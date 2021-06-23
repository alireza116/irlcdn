import React, { useState, useEffect } from "react";
import { Container } from "@material-ui/core";
import NavBar from "./components/nav/nav";
import DataMap from "./components/map/dataMap";
import DrawMap from "./components/map/drawMap";
import axios from "axios";
import "./App.css";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import NestedList from "./components/nestedList/nestedList";

let borderColor = "grey";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    gridTemplateColumns: "repeat(12,1fr)",
    gridTemplateRows: "repeat(12,1fr)",
    height: "92%",
    margin: "0 auto",
    width: "100%",
    padding: 0,
    margin: 0,
  },
  dataMap: {
    gridColumn: "3 / 8",
    gridRow: "1 / 13",
    border: "solid",
    borderColor: borderColor,
  },
  drawMap: {
    gridColumn: "8 / 13",
    gridRow: "1 / 13",
    border: "solid",
    borderColor: borderColor,
  },
  config: {
    gridColumn: "1 / 3",
    gridRow: "1 / 13",
    border: "solid",
    borderColor: borderColor,
    overflow: "auto",
  },
}));
const App = () => {
  const classes = useStyles();
  const [mapData, setMapData] = useState(() => null);
  const [selectedFeature, setSelectedFeature] = useState(() => [
    "Asia",
    "South Central Asia",
  ]);
  const [featureNames, setFeatureNames] = useState(() => []);
  const [densityValue, setDensityValue] = useState("estimate");
  const [drawMapExtent, setDrawMapExtent] = useState(() => null);
  const [dataMapExtent, setDataMapExtent] = useState(() => null);
  const [sync, setSync] = useState(() => true);

  const handleDensityEstimate = (newValue) => {
    console.log(newValue);
    setDensityValue(newValue);
  };

  const handleMapExtent = (extent, type) => {
    if (!sync) return;
    console.log(extent);
    if (type === "draw") {
      console.log(extent);
      setDrawMapExtent(extent);
    } else if (type === "data") {
      setDataMapExtent(extent);
    }
  };

  const handleSelectedFeatures = (featureNames) => {
    if (featureNames.length === 1) {
      setSelectedFeature([...featureNames]);
      let fnContinent = Object.keys(mapData[0].properties.counts);
      let fnSubContinent = Object.keys(
        mapData[0].properties.counts[featureNames[0]].children
      );
      setFeatureNames([fnContinent, fnSubContinent]);
    }
    if (featureNames.length === 2) {
      setSelectedFeature([...featureNames]);
      let fnContinent = Object.keys(mapData[0].properties.counts);
      let fnSubContinent = Object.keys(
        mapData[0].properties.counts[featureNames[0]].children
      );
      let fnCountry = Object.keys(
        mapData[0].properties.counts[featureNames[0]].children[featureNames[1]]
          .children
      );
      setFeatureNames([fnContinent, fnSubContinent, fnCountry]);
    }
    if (featureNames.length === 3) {
      setSelectedFeature([...featureNames]);
      // let fnContinent = Object.keys(geojson[0].properties.counts);
      // let fnSubContinent = Object.keys(geojson[0].properties.counts[featureNames[0]].children)
      // let fnCountry = Object.keys(geojson[0].properties.counts[featureNames[0]].children[featureNames[1]])
      // setFeatureNames([fnContinent,fnSubContinent,fnCountry]);
    }
  };
  useEffect(() => {
    axios.get("/api/data").then((res) => {
      let features = res.data.features;
      let geojson = features.filter((f) => {
        f.properties.counts = {};
        f.properties.counts = Object.entries(f.properties)
          .filter(([key, value]) => {
            return key.startsWith("Estimate!!Total:!!");
          })
          .map((entry) => {
            return [
              entry[0]
                .replace("Estimate!!Total:!!", "")
                .replaceAll(":!!", ", ")
                .replace(":", ""),
              entry[1],
            ];
          })
          .reduce((acc, [key, value]) => {
            let keySplit = key.split(", ");

            if (keySplit.length === 1) {
              acc[keySplit[0]] = { value: value, children: {} };
            } else if (keySplit.length === 2) {
              if (!acc[keySplit[0]]) {
                acc[keySplit[0]] = {};
              }

              acc[keySplit[0]].children[keySplit[1]] = {
                value: value,
                children: {},
              };
            } else if (keySplit.length === 3) {
              if (!acc[keySplit[0]]) {
                acc[keySplit[0]] = {};
              }
              if (!acc[keySplit[0]].children[keySplit[1]]) {
                acc[keySplit[0]].children[keySplit[1]] = { children: {} };
              }
              acc[keySplit[0]].children[keySplit[1]].children[keySplit[2]] = {
                value: value,
              };
            }

            return acc;
          }, {});

        return !(
          (f.geometry.coordinates[0] == undefined) &
          (f.geometry.coordinates[1] == undefined)
        );
      });

      let fnContinent = Object.keys(geojson[0].properties.counts);
      setFeatureNames([fnContinent]);
      setMapData(geojson);
    });
  }, []);

  return (
    <div className="app" style={{ height: "100%" }}>
      <NavBar height={"8%"} className="navBar"></NavBar>
      <Container className={classes.root} id="root-container" maxWidth={false}>
        <div className={classes.config}>
          <NestedList
            handleSelectedFeatures={handleSelectedFeatures}
            handleDensityEstimate={handleDensityEstimate}
            featureNames={featureNames}
            densityValue={densityValue}
          ></NestedList>
        </div>
        <div className={classes.dataMap}>
          <DataMap
            handleMapExtent={handleMapExtent}
            extent={dataMapExtent}
            geojson={mapData}
            selectedFeature={selectedFeature}
            densityValue={densityValue}
            mapId="dataMap"
          ></DataMap>
        </div>
        <div className={classes.drawMap}>
          <DrawMap
            handleMapExtent={handleMapExtent}
            extent={drawMapExtent}
            geojson={mapData}
            selectedFeature={selectedFeature}
            densityValue={densityValue}
            mapId="drawMap"
          ></DrawMap>
        </div>
      </Container>
    </div>
  );
};

export default App;
