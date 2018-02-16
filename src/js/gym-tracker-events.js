import {GymTrackerAPI} from "./gym-tracker-api";
import {State} from "./gym-tracker-state";
import {GymTrackerClient} from "./gym-tracker-client";
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
          State.initTrainingSessionExercises(result.exercises);
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
        if (session.exercises.length !== 0) {
          State.initTrainingSessionExercises(session.exercises);
          GymTrackerClient.showTrainingSessionPage();
        } else {
          State.trainingSessionExercises = [];
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
  },
  onAddSetForExerciseButtonFormSubmit: function (event) {
    event.preventDefault();
    const exerciseIndex = Number.parseInt($(event.currentTarget).data('exercise-index'));
    State.trainingSessionExercises[exerciseIndex].displayAddSetInputForm = true;
    GymTrackerClient.showTrainingSessionPage();
  },
  onCancelAddSetForExerciseButtonFormSubmit: function (event) {
    event.preventDefault();
    // just show the training page again (State would have been reset)
    GymTrackerClient.showTrainingSessionPage();
  },
  onSaveAddSetForExerciseButtonFormSubmit: function (event) {
    event.preventDefault();

    const exerciseIndex = Number.parseInt($(event.currentTarget).data('exercise-index'));
    const weight = $(event.currentTarget).find('input[name=weight]').val();
    const reps = $(event.currentTarget).find('input[name=reps]').val();
    const currentExerciseName = State.trainingSessionExercises[exerciseIndex].name;

    State.trainingSessionExercises[exerciseIndex].displayAddSetInputForm = true;
    GymTrackerAPI
      .addSetToExercise(State.trainingSessionType, currentExerciseName, {weight: weight, reps: reps})
      .then(updatedSession => {
        State.initTrainingSessionExercises(updatedSession.exercises);
        GymTrackerClient.showTrainingSessionPage();
      });
  }
};

export { EventHandler };