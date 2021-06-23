import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: "30px",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

const NestedList = (props) => {
  const classes = useStyles();
  const [selectedFeatures, setSelectedFeatures] = useState(() => []);

  const handleChange = (event) => {
    props.handleDensityEstimate(event.target.value);
  };

  useEffect(() => {
    if (
      selectedFeatures.length > 0 &&
      !selectedFeatures.some((f) => f === null)
    ) {
      props.handleSelectedFeatures(selectedFeatures);
    }
  }, [selectedFeatures]);

  return (
    <Container className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        Choose Map Data
      </Typography>
      <Autocomplete
        id="continents"
        options={props.featureNames[0]}
        //   getOptionLabel={(option) => option.title}
        onChange={(event, newValue) => {
          setSelectedFeatures([newValue]);
        }}
        style={{ width: "90%", margin: "0 auto" }}
        renderInput={(params) => (
          <TextField {...params} label="Continent" variant="outlined" />
        )}
      />
      <hr></hr>
      <Autocomplete
        id="continents"
        options={props.featureNames.length > 1 ? props.featureNames[1] : []}
        //   getOptionLabel={(option) => option.title}
        onChange={(event, newValue) => {
          let selectedFeaturesCopy = [selectedFeatures[0], selectedFeatures[1]];
          selectedFeaturesCopy[1] = newValue;
          setSelectedFeatures(selectedFeaturesCopy);
        }}
        style={{ width: "90%", margin: "0 auto" }}
        renderInput={(params) => (
          <TextField {...params} label="sub continent" variant="outlined" />
        )}
      />
      <hr></hr>
      <Autocomplete
        id="continents"
        options={props.featureNames.length > 2 ? props.featureNames[2] : []}
        //   getOptionLabel={(option) => option.title}
        onChange={(event, newValue) => {
          let selectedFeaturesCopy = [
            selectedFeatures[0],
            selectedFeatures[1],
            selectedFeatures[2],
          ];
          selectedFeaturesCopy[2] = newValue;
          setSelectedFeatures(selectedFeaturesCopy);
        }}
        style={{ width: "90%", margin: "0 auto" }}
        renderInput={(params) => (
          <TextField {...params} label="country" variant="outlined" />
        )}
      />
      <hr></hr>
      <FormControl component="fieldset">
        <RadioGroup
          aria-label="gender"
          name="gender1"
          value={props.densityValue}
          onChange={handleChange}
        >
          <FormControlLabel
            value="estimate"
            control={<Radio />}
            label="Population Estimate"
          />
          <FormControlLabel
            value="density"
            control={<Radio />}
            label="Population Density"
          />
        </RadioGroup>
      </FormControl>
    </Container>
  );
};

export default NestedList;
