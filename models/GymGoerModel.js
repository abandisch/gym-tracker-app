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
gymGoerSchema.statics.addExercisesToSession = function(sessionId, newExercises) {
  return this.findOneAndUpdate(
      { "trainingSessions": { $elemMatch : { _id: sessionId } } },
      { $addToSet: { "trainingSessions.$.exercises": { $each: newExercises } } },
      { new: true }
    )
    .then(updatedGymGoer => updatedGymGoer.serializeAll().trainingSessions.find(s => (s.sessionID).toString() === (sessionId).toString()));
};

gymGoerSchema.statics.findBestSets = function () {
  return this.validateParameters()
.then(sessionExercises => {
    sessionExercises = sessionExercises.map(sessionExercise => {
      const previousSessionExercise = previousSessionWithExercises.exercises.find(ex => ex.name === sessionExercise.name);
      const exercise = { sets: sessionExercise.sets, name: sessionExercise.name, lastBestSet: null };
      if (previousSessionExercise !== undefined && previousSessionExercise.sets.length > 0) {
        const bestSet = GymGoerModelMethods.findBestSet(previousSessionExercise.sets);
        exercise.lastBestSet = {
          sessionDate: previousSessionWithExercises.sessionDate,
          weight: bestSet.weight,
          reps: bestSet.reps
        }
      }
      return exercise;
    });
    return sessionExercises;
  });
};

/**
 * Initialised session exercises, by getting previous set of exercises
 * for the given session (if any), and then adding those exercises to
 * the session (via addExercisesToSession call)
 * @param {string} gymGoerID - Id of the GymGoer
 * @param {string} sessionID - Id of the session
 * @param {string} sessionType - Type of session
 * @returns {Promise} - Updated session with new exercises added
 */
gymGoerSchema.statics.initSessionExercises = function(gymGoerID, sessionID, sessionType) {
  let previousSessionWithExercises;
  return GymGoerModel.findById(gymGoerID)
    .then(gymGoer => {
      const sessionForToday = gymGoer.getSessionForToday(sessionType);
      previousSessionWithExercises = gymGoer.findPreviousTrainingSessionWithExercises(sessionType);
      // if no previously saved exercises for today's session, but there is a previous session with exercises then use those
      if (sessionForToday.exercises.length === 0 && previousSessionWithExercises !== undefined) {
        // Just keep the exercise names, zero out the previous sets, so the user can add new sets
        sessionForToday.exercises = previousSessionWithExercises.exercises.map(ex => {
          return { sets: [], name: ex.name };
        });
      }
      // return the exercises array
      return sessionForToday.exercises;
    })
    .then(exercises => this.addExercisesToSession(sessionID, exercises));
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
      // TODO: find last best set for each exercise right now
      session.exercises = _session.exercises;
      return session;
    });
};

const GymGoerModel = mongoose.model('GymGoer', gymGoerSchema);

module.exports = {GymGoerModel};