import { setCookie, getCookie } from "./cookies";
const $ = require("jquery");

const COOKIE_NAME = 'gymGoer';

export const GymTrackerAPI = {
  authenticate(emailAddress) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'gym-tracker/login',
        data: JSON.stringify({email: emailAddress, password: 'null'}),
        contentType: 'application/json',
        method: 'POST',
        dataType: 'json'
      }).done(result => {
        const cookieData = {
          email: emailAddress,
          jwt_token: result.authToken
        };
        setCookie(COOKIE_NAME, JSON.stringify(cookieData));
        resolve({email: emailAddress});
      }).fail(() => {
        reject({error: 'Error logging in'});
      })
    });
  },
  addExercise(trainingSession, exerciseName) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `gym-tracker/exercises`,
        data: JSON.stringify({sessionType: trainingSession, exerciseName: exerciseName}),
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      }).done(updatedSessionExercises => {
        resolve(updatedSessionExercises);
      }).fail(() => {
        reject({error: 'Error adding exercise to training session'});
      });
    });
  },
  initGymGoerTrainingSession(trainingSession) {
    const ISODateToday = new Date().toISOString().slice(0, 10);
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `gym-tracker/exercises/${trainingSession}/${ISODateToday}`,
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      }).done(initialisedTrainingSession => {
        resolve(initialisedTrainingSession);
      }).fail(() => {
        reject({error: 'Error initialising training session'});
      });
    });
  },
  addSetToExercise(trainingSession, nameOfExercise, newSetForExercise) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'gym-tracker/exercises/sets',
        data: JSON.stringify({sessionType: trainingSession, exerciseName: nameOfExercise, newSet: newSetForExercise}),
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      }).done(updatedSessionExercises => resolve(updatedSessionExercises))
        .fail(() => {
        reject({error: 'Error adding set to exercise for training session'});
      });
    });
  },
  deleteExerciseSet(exerciseSetId) {
    return new Promise((resolve, reject) => {
      $.ajax({
          url: `gym-tracker/exercises/sets/${exerciseSetId}`,
          method: 'DELETE'
        })
        .done(() => resolve(true))
        .fail(() => reject({error: 'Error deleting set from exercise'}));
    });
  }
};
