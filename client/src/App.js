import React, { useState, useEffect } from "react";
import { Container } from "@material-ui/core";
import NavBar from "./components/nav/nav";
import DataMap from "./components/map/dataMap";
import DrawMap from "./components/map/drawMap";
import axios from "axios";
import "./App.css";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import NestedList from "./components/nestedList/nestedList";
import Dialog from "./components/dialog/dialog";

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
  mapLabel: {
    height: "5%",
    textAlign: "center",
    fontFamily: "sans-serif",
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mapMain: {
    height: "95%",
    margin: 0,
  },
  mapText: {
    flex: 1,
    margin: 0,
    justifyContent: "center",
  },
}));

const App = () => {
  const classes = useStyles();
  const [mapData, setMapData] = useState(() => null);
  const [selectedFeature, setSelectedFeature] = useState(() => []);
  const [featureNames, setFeatureNames] = useState(() => []);
  const [densityValue, setDensityValue] = useState("estimate");
  const [drawMapExtent, setDrawMapExtent] = useState(() => null);
  const [dataMapExtent, setDataMapExtent] = useState(() => null);
  const [sync, setSync] = useState(() => true);
  const [openDialog, setOpenDialog] = useState(false);
  const [clickTarget, setClickTarget] = useState(() => null);

  const SNCOColorMap = {
    Strengths: "blue",
    "Needs/Gaps": "orange",
    Challenges: "red",
    Opportunities: "green",
  };

  const handleOpenDialog = (target) => {
    setClickTarget(target);
    setOpenDialog(true);
  };

  const handleCloseDialog = (value) => {
    setOpenDialog(false);
  };

  const setDialogResponse = (resp) => {
    console.log(clickTarget);
    Object.entries(resp).forEach(([key, value]) => {
      console.log(key, value);
      clickTarget.feature.properties[key] = value;
    });
    // console.log(clickTarget.properties);
    clickTarget.setStyle({
      fillColor: SNCOColorMap[resp.SNCO],
      weight: 0.1,
      stroke: "black",
      fillOpacity: 0.5,
    });
    clickTarget.bindPopup(
      `${clickTarget.feature.properties.SNCO}:<br>${clickTarget.feature.properties.SNCO_Body}`
    );
    console.log(resp);
  };

  const handleDensityEstimate = (newValue) => {
    console.log(newValue);
    setDensityValue(newValue);
  };

  const handleMapExtent = (extent, type) => {
    if (!sync) return;

    if (type === "draw") {
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
      console.log(res.data);
      let features = res.data.ethnicity.features;
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
          <div className={classes.mapLabel}>
            <span className={classes.mapText}>Data Map</span>
          </div>
          <div className={classes.mapMain}>
            <DataMap
              handleMapExtent={handleMapExtent}
              extent={dataMapExtent}
              geojson={mapData}
              selectedFeature={selectedFeature}
              densityValue={densityValue}
              mapId="dataMap"
            ></DataMap>
          </div>
        </div>
        <div className={classes.drawMap}>
          <div className={classes.mapLabel}>
            <p className={classes.mapText}>Annotate Map</p>
          </div>
          <div className={classes.mapMain}>
            <DrawMap
              handleMapExtent={handleMapExtent}
              extent={drawMapExtent}
              geojson={mapData}
              handleOpenDialog={handleOpenDialog}
              selectedFeature={selectedFeature}
              mapId="drawMap"
            ></DrawMap>
          </div>
        </div>
      </Container>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        setResponse={setDialogResponse}
      ></Dialog>
    </div>
  );
};

export default App;
