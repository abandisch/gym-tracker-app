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

    const selectedTrainingSession = $(event.currentTarget).data('session');
    GymTrackerAPI
      .initGymGoerTrainingSession(selectedTrainingSession)
      .then(result => {
        State.trainingSessionType = result.sessionType;
        if (result.exercises.length !== 0) {
          State.initTrainingSessionExercises(result.exercises);
          GymTrackerClient.showTrainingSessionPage();
        } else {
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
  onSaveAddSetForExercise: function(exerciseIndex) {
    return (weight, reps) => {
      const currentExerciseName = State.trainingSessionExercises[exerciseIndex].name;

      // State.trainingSessionExercises[exerciseIndex].displayAddSetInputForm = true;
      GymTrackerAPI
        .addSetToExercise(State.trainingSessionType, currentExerciseName, {weight: weight, reps: reps})
        .then(updatedSession => {
          State.initTrainingSessionExercises(updatedSession.exercises);
          GymTrackerClient.showTrainingSessionPage();
        });
    };
  },
  onEditExerciseSet: function (exerciseSetId, updatedExerciseSet) {
    console.log('editing exerciseSetId:', exerciseSetId);
    /*GymTrackerAPI
      .updateExerciseSet(exerciseSetId, updatedExerciseSet)
      .then(() => GymTrackerAPI.initGymGoerTrainingSession(State.trainingSessionType))
      .then(session => {
        State.initTrainingSessionExercises(session.exercises);
        GymTrackerClient.showTrainingSessionPage();
      })*/
  },
  onDeleteExerciseSet: function(exerciseSetId) {
    GymTrackerAPI
      .deleteExerciseSet(exerciseSetId)
      .then(() => GymTrackerAPI.initGymGoerTrainingSession(State.trainingSessionType))
      .then(session => {
        State.initTrainingSessionExercises(session.exercises);
        GymTrackerClient.showTrainingSessionPage();
      })
    }
};

export { EventHandler };