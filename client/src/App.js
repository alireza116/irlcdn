import React, { Component } from "react";
import { Container } from "@material-ui/core";
import NavBar from "./components/nav/nav";
import Map from "./components/map/map";
import MessageList from "./components/messagelist/messagelist";
import moment from "moment";
import * as d3 from "d3";
import axios from "axios";
import * as turf from "@turf/turf";
import "./App.css";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import LineChart from "./components/timeline/timeline";
import StackedLine from "./components/timeline/stackedLine";
import PieChart from "./components/pieChart/pieChart";
import TopicTreeMap from "./components/topicTreeMap/topicTreeMap";
import AppBar from "@material-ui/core/AppBar";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import { filter } from "d3";

let borderColor = "grey";

const styles = (theme) => ({
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
    gridColumn: "1 / 10",
    gridRow: "1 / 8",
    border: "solid",
    borderColor: borderColor,
  },
  drawMap: {
    gridColumn: "6 / 12",
    gridRow: "1 / 8",
    border: "solid",
    borderColor: borderColor,
  },
});
class App extends Component {
  state = {};

  componentDidMount() {
    axios.get("/api/data").then((res) => {
      let geojson = res.data.filter((f) => {
        return !(
          (f.geometry.coordinates[0] == undefined) &
          (f.geometry.coordinates[1] == undefined)
        );
      });
      geojson.forEach((f) => {
        f["properties"]["point"] = turf.point(f["geometry"]["coordinates"]);
      });
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className="app" style={{ height: "100%" }}>
        <NavBar height={"8%"} className="navBar"></NavBar>
        <Container
          className={classes.root}
          id="root-container"
          maxWidth={false}
        >
          <div className={classes.dataMap}>
            <Map geojson={this.state.mapFeatures}></Map>
          </div>
          <div className={classes.drawMap}>
            <Map geojson={this.state.mapFeatures}></Map>
          </div>
        </Container>
      </div>
    );
  }
}

export default withStyles(styles)(App);
