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
          State.trainingSessionExercises = result.exercises;
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
          State.trainingSessionExercises = session.exercises;
          // State.initTrainingSessionExercises(session.exercises);
          GymTrackerClient.showTrainingSessionPage();
        } else {
          State.trainingSessionExercises = [];
          GymTrackerClient.showEmptyTrainingSessionPage();
        }
      });
  },
  onCancelAddExerciseButtonFormSubmit: function (event) {
    event.preventDefault();
    GymTrackerClient.showTrainingSessionPage();
  },
  onSaveAddSetForExercise: function(exerciseIndex) {
    return (weight, reps) => {
      const currentExerciseName = State.trainingSessionExercises[exerciseIndex].name;
      GymTrackerAPI
        .addSetToExercise(State.trainingSessionType, currentExerciseName, {weight: weight, reps: reps})
        .then(updatedSession => {
          State.trainingSessionExercises = updatedSession.exercises;
          GymTrackerClient.showTrainingSessionPage();
        });
    };
  },
  onEditExerciseSetButtonClick: function (exerciseIndex) {
    return (exerciseSetId, exerciseSet) => {
      State.trainingSessionExercises[exerciseIndex].displayExerciseSetInputForm = true;
      State.trainingSessionExercises[exerciseIndex].updateExerciseSet = {
        setId: exerciseSetId,
        set: exerciseSet
      };
      GymTrackerClient.showTrainingSessionPage();
    };
  },
  onUpdateExerciseSetSubmitForm: function (exerciseSetId) {
    return (weight, reps, setNumber) => {
      GymTrackerAPI
        .updateExerciseSet(exerciseSetId, {setNumber: setNumber, weight: weight, reps: reps})
        .then(() => GymTrackerAPI.initGymGoerTrainingSession(State.trainingSessionType))
        .then(session => {
          State.trainingSessionExercises = session.exercises;
          GymTrackerClient.showTrainingSessionPage();
        });
    };
  },
  onDeleteExerciseSetButtonClick: function(exerciseSetId) {
    GymTrackerAPI
      .deleteExerciseSet(exerciseSetId)
      .then(() => GymTrackerAPI.initGymGoerTrainingSession(State.trainingSessionType))
      .then(session => {
        State.trainingSessionExercises = session.exercises;
        GymTrackerClient.showTrainingSessionPage();
      });
  }
};

export { EventHandler };