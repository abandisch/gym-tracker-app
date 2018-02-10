'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const GymGoerModelMethods = require('./GymGoerModelMethods');

const gymGoerSchema = mongoose.Schema({
  email: {type: String,
          required: true,
          index: true,
          unique: true
  },
  trainingSessions: [
    {
      sessionType: {type: String, required: true},
      sessionDate: {type: Date, default: Date.now},
      exercises: [
        {
          name: {type: String, required: true},
          sets: [
            {
              setNumber: {type: Number, required: true},
              weight: {type: String, required: true},
              reps: {type: Number, required: true}
            }
          ]
        }
      ]
    }
  ]
});

// Assign the GymGoerModelMethods to the gymGoerSchema methods
Object.assign(gymGoerSchema.methods, GymGoerModelMethods);

/**
 * Validate the parameters
 * @param {Object[]} parameters - Array of parameters
 * @param {string} message - Error message to return if not all all parameters are defined
 * @returns {Promise} - resolved or rejected Promise
 */
gymGoerSchema.statics.validateParameters = function(parameters, message) {
  return new Promise((resolve, reject) => {
    if (parameters.every(parameter => typeof parameter !== 'undefined') === true) {
      resolve(true);
    }
    reject(new Error(message));
  });
};

/**
 * Find a GymGoer by ID
 * @param {string} gymGoerID - String of the ID to search for
 * @returns {Promise|null} - Promise containing GymGoer or null if not found
 */
gymGoerSchema.statics.findGymGoerByID = function (gymGoerID) {
  return this.findOne({"_id": gymGoerID});
};

/**
 * Find a GymGoer by email address
 * @param {string} email - String of the email to search for
 * @returns {Promise|null} - Promise containing GymGoer or null if not found
 */
gymGoerSchema.statics.findGymGoerByEmail = function(email) {
  return this.validateParameters([email], 'Email is required')
    .then(() => this.findOne({email: email}))
    .then(gymGoer => gymGoer !== null ? gymGoer.serializeAll() : null)
    .catch(Error => {throw Error});
};

/**
 * Create a GymGoer
 * @param {string} email - Email of the Gym Goer
 * @returns {Promise|null} - Promise containing the created GymGoer
 */
gymGoerSchema.statics.createGymGoer = function (email) {
  const newGymGoer = { email: email, trainingSessions: [] };

  return this.validateParameters([email], 'Email is required')
    .then(() => GymGoerModel.create(newGymGoer))
    .then(gymGoer => gymGoer.serializeAll());
};

/**
 * Create a GymGoer
 * @param {string} gymGoerID - ID of Gym Goer
 * @param {string} sessionType - Name of the session (chest, legs, back, arms etc)
 * @returns {Promise} - GymGoer's session
 */
gymGoerSchema.statics.addTrainingSession = function (gymGoerID, sessionType) {
  return this.validateParameters([gymGoerID, sessionType], 'Both ID and SessionType are required')
    .then(() => this.findGymGoerByID(gymGoerID))
    .then(gymGoer => {
      if (gymGoer === null) {
        throw new Error('Gym Goer ID not found');
      }
      if (gymGoer.hasExistingTrainingSessionToday(sessionType) === false) {
        const newSession = { sessionType: sessionType, exercises: [] };
        return this.findOneAndUpdate({ "_id": gymGoerID }, { $push: { trainingSessions: newSession } }, { new: true })
          .then(gymGoer => gymGoer.getSessionForToday(sessionType));
      }
      return gymGoer.getSessionForToday(sessionType);
    })
    .then((session) => ({
      sessionID: session['_id'],
      sessionDate: session.sessionDate,
      exercises: session.exercises,
      sessionType: session.sessionType
    }));
};

/**
 * Adds an array of exercises to a session and saves that to the database
 * @param {string} sessionId - Id of the session
 * @param {Object[]} newExercises - Array of exercises to add
 * @returns {Promise} - Updated session with new exercises added
 */
gymGoerSchema.statics.saveExercisesToSession = function(sessionId, newExercises) {
  return this.findOneAndUpdate(
      { "trainingSessions": { $elemMatch : { _id: sessionId } } },
      { $addToSet: { "trainingSessions.$.exercises": { $each: newExercises } } },
      { new: true }
    )
    .then(updatedGymGoer => updatedGymGoer.serializeAll().trainingSessions.find(s => (s.sessionID).toString() === (sessionId).toString()));
};

/**
 * Finds the last best set from the previous session exercise sets
 * @param {Object} currentSession - current training session
 * @param {Object} previousSession - previous training session
 * @returns {Promise} - Updated session with new last best sets added to each exercise
 */
gymGoerSchema.statics.findLastBestSetsForSession = function (currentSession, previousSession) {
  return new Promise((resolve, reject) => {
    currentSession.exercises = currentSession.exercises.map(exercise => {
      const prevSession = previousSession.exercises.find(ex => ex.name === exercise.name);
      if (prevSession !== undefined) {
        const lastBest = GymGoerModelMethods.getLastBestSet(prevSession.sets, previousSession.sessionDate);
        return { sets: exercise.sets, name: exercise.name, lastBestSet: lastBest };
      } else {
        return exercise;
      }
    });
    resolve(currentSession);
  })
};

/**
 * Get the exercises from the previous session, if there are no current exercises
 * @param {Object[]} currentExercises - current training session exercises
 * @param {Object} previousSessionWithExercises - previous training session
 * @returns {Promise} - Array of exercise objects
 */
gymGoerSchema.statics.getExercisesFromPreviousSession = function (currentExercises, previousSessionWithExercises) {
  return new Promise((resolve, reject) => {
    if (currentExercises.length === 0 && previousSessionWithExercises !== undefined) {
      currentExercises = previousSessionWithExercises.exercises.map(ex => {
        return { sets: [], name: ex.name };
      });
    }
    resolve(currentExercises);
  })
};

/**
 * Initialised session exercises, by getting previous set of exercises
 * for the given session (if any), and then adding those exercises to
 * the session (via saveExercisesToSession call)
 * @param {string} gymGoerID - Id of the GymGoer
 * @param {string} sessionID - Id of the session
 * @param {string} sessionType - Type of session
 * @returns {Promise} - Updated session with new exercises added
 */
gymGoerSchema.statics.initSessionExercises = function(gymGoerID, sessionID, sessionType) {
  let previousSessionWithExercises;
  let sessionForToday;
  let gymGoer;
  return GymGoerModel.findById(gymGoerID)
    .then(_gymGoer => gymGoer = _gymGoer)
    .then(gymGoer => gymGoer.getSessionForToday(sessionType))
    .then(_sessionForToday => sessionForToday = _sessionForToday)
    .then(() => gymGoer.findPreviousTrainingSessionWithExercises(sessionType))
    .then(_previousSessionWithExercises => previousSessionWithExercises = _previousSessionWithExercises)
    .then(() => this.getExercisesFromPreviousSession(sessionForToday.exercises, previousSessionWithExercises))
    .then(exercises => this.saveExercisesToSession(sessionForToday._id, exercises))
    .then(session => this.findLastBestSetsForSession(session, previousSessionWithExercises));
};

/**
 * Initialises training session for a GymGoer, by adding the training session to the database,
 * and initialising the exercises (via initSessionExercises call)
 * @param {string} gymGoerID - Id of the GymGoer
 * @param {string} sessionType - Type of session
 * @returns {Promise} - Training session with exercises (if any)
 */
gymGoerSchema.statics.initGymGoerTrainingSession = function (gymGoerID, sessionType) {
  let session;
  return this.validateParameters([gymGoerID, sessionType], 'Both GymGoerID and SessionType are required')
    .then(() => this.addTrainingSession(gymGoerID, sessionType))
    .then(_session => session = _session)
    .then(() => this.initSessionExercises(gymGoerID, session.sessionID, sessionType))
    .then(_session => {
      session.exercises = _session.exercises;
      return session;
    });
};

const GymGoerModel = mongoose.model('GymGoer', gymGoerSchema);

module.exports = {GymGoerModel};