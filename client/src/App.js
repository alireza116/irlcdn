import React, { useState, useEffect } from "react";
import { Container } from "@material-ui/core";
import NavBar from "./components/nav/nav";
import Map from "./components/map/map";
import moment from "moment";
import * as d3 from "d3";
import axios from "axios";
import * as turf from "@turf/turf";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import { filter } from "d3";

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
    gridColumn: "1 / 7",
    gridRow: "1 / 9",
    border: "solid",
    borderColor: borderColor,
  },
  drawMap: {
    gridColumn: "7 / 13",
    gridRow: "1 / 9",
    border: "solid",
    borderColor: borderColor,
  },
}));
const App = () => {
  const classes = useStyles();
  const [mapData, setMapData] = useState(() => null);
  useEffect(() => {
    axios.get("/api/data").then((res) => {
      let features = res.data.features;
      let geojson = features.filter((f) => {
        return !(
          (f.geometry.coordinates[0] == undefined) &
          (f.geometry.coordinates[1] == undefined)
        );
      });
      setMapData(geojson);
    });
  }, []);

  return (
    <div className="app" style={{ height: "100%" }}>
      <NavBar height={"8%"} className="navBar"></NavBar>
      <Container className={classes.root} id="root-container" maxWidth={false}>
        <div className={classes.dataMap}>
          <Map geojson={mapData} mapId="dataMap"></Map>
        </div>
        <div className={classes.drawMap}>
          <Map geojson={mapData} mapId="drawMap"></Map>
        </div>
      </Container>
    </div>
  );
};

export default App;
