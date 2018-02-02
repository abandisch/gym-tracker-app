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
        console.log('error:', err);
      });
  },
  onSelectTrainingSessionFormSubmit: function (event) {
    event.preventDefault();
    // get exercises from server here, if empty, display the empty training session page, else
    // display the training session page with the previous exercises on it
    const selectedTrainingSession = $(event.currentTarget).data('session');
    GymTrackerAPI
      .addTrainingSession(selectedTrainingSession)
      .then((trainingSession) => {
        State.trainingSessionType = trainingSession.sessionType;
        return GymTrackerAPI.getLastTrainingSessionExercises(trainingSession);
      })
      .then(previousExercises => {
        if (previousExercises.exercises.length) { // if there are previous exercises, show previous exercises page
          State.previousTrainingSessionExercises = previousExercises;
          GymTrackerClient.showTrainingSessionPage();
        } else { // if there are no previous exercises, show empty training session page
          GymTrackerClient.showEmptyTrainingSessionPage();
        }
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
    console.log('new exercise is:', exerciseName);
    GymTrackerAPI.addExercise(State.trainingSessionType, exerciseName)
      .then(() => {
        GymTrackerClient.showTrainingSessionPage();
      });
  }
};

export { EventHandler };