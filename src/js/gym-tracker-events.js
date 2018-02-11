import {GymTrackerAPI} from "./gym-tracker-api";
import {GymTrackerClient, State} from "./gym-tracker";
const $ = require("jquery");

const EventHandler = {
  onLoginFormSubmit: function (event) {
    event.preventDefault();
    const emailAddress = $(event.currentTarget).find('input[name=emailAddress]').val();
    GymTrackerAPI.authenticate(emailAddress)
      .then(result => {
        // show select training session page
        GymTrackerClient.showSelectTrainingSessionPage();
      })
      .catch(err => {
        console.error('error:', err);
      });
  },
  onSelectTrainingSessionFormSubmit: function (event) {
    event.preventDefault();
    // get exercises from server here, if empty, display the empty training session page, else
    // display the training session page with the previous exercises on it
    const selectedTrainingSession = $(event.currentTarget).data('session');
    GymTrackerAPI
      .initGymGoerTrainingSession(selectedTrainingSession)
      .then(result => {
        State.trainingSessionType = result.sessionType;
        if (result.exercises.length !== 0) {  // if there are previous exercises from the last session
          State.trainingSessionExercises = result.exercises;
          GymTrackerClient.showTrainingSessionPage();
        } else { // if there are no previous exercises, show empty training session page
          GymTrackerClient.showEmptyTrainingSessionPage();
        }
      })
      .catch(err => {
        console.error('(1) There has been a problem. Please try again later (' + JSON.stringify(err, null, 2) + ')');
      });
  },
  onChangeSessionFormSubmit: function (event) {
    event.preventDefault();
    GymTrackerClient.showSelectTrainingSessionPage();
  },
  onAddExerciseBigButtonFormSubmit: function (event) {
    event.preventDefault();
    State.displayAddExerciseInputForm = true;
    GymTrackerClient.showEmptyTrainingSessionPage();
  },
  onAddExerciseSmallButtonFormSubmit: function (event) {
    event.preventDefault();
    State.displayAddExerciseInputForm = true;
    GymTrackerClient.showTrainingSessionPage();
  },
  onAddExerciseInputFormSubmit: function (event) {
    event.preventDefault();
    const exerciseName = $(event.currentTarget).find('input[name=exerciseName]').val();
    GymTrackerAPI
      .addExercise(State.trainingSessionType, exerciseName)
      .then(session => {
        State.trainingSessionExercises = session.exercises;
        if (session.exercises.length !== 0) {
          GymTrackerClient.showTrainingSessionPage();
        } else {
          GymTrackerClient.showEmptyTrainingSessionPage();
        }
      })
      .catch(err => {
        console.error('(2) There has been a problem. Please try again later (' + JSON.stringify(err, null, 2) + ')');
      });
  },
  onCancelAddExerciseButtonFormSubmit: function (event) {
    event.preventDefault();
    GymTrackerClient.showTrainingSessionPage();
  }
};

export { EventHandler };