import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@material-ui/core";
// import BinaryChoice from "../choice/binaryChoice";
// import axios from "axios";
import * as Survey from "survey-react";
import "survey-react/survey.css";

Survey.StylesManager.applyTheme("orange");

const PeresonDialog = (props) => {
  let results;

  const onComplete = (survey, options) => {
    //Write survey results into database
    results = { ...survey.data };
    props.setResponse(results);
    props.onClose();
  };

  const json = {
    elements: [
      {
        type: "radioGroup",
        name: "SNCO",
        title: `Which of the following options is your comment about?`,
        isRequired: true,
        colCount: 0,
        choices: ["Strengths", "Needs/Gaps", "Challenges", "Opportunities"],
      },
      {
        type: "comment",
        name: "SNCO_Body",
        title: "Here input your comment about the drawn shape on the map",
        isRequired: true,
      },
    ],
  };

  const model = new Survey.Model(json);

  let survey = <Survey.Survey model={model} onComplete={onComplete} />;
  //   model.showCompletedPage = false;
  model.completedHtml = "<p>Thanks for completing this task</p>";
  return (
    <Dialog
      // onClose={handleClose}
      maxWidth="lg"
      aria-labelledby="simple-dialog-title"
      open={props.open}
      scroll="paper"
    >
      <DialogTitle id="simple-dialog-title">
        Please input the following information about your drawn place.
      </DialogTitle>
      <DialogContent>{survey}</DialogContent>
    </Dialog>
  );
};

export default PeresonDialog;
