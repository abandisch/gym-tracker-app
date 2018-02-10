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

gymGoerSchema.statics.validateParameters = function(parameters, message) {
  return new Promise((resolve, reject) => {
    if (parameters.every(parameter => typeof parameter !== 'undefined') === true) {
      resolve(true);
    }
    reject(new Error(message));
  });
};

gymGoerSchema.statics.findGymGoerByID = function (gymGoerID) {
  return this.findOne({"_id": gymGoerID});
};

gymGoerSchema.statics.findGymGoerByEmail = function(email) {
  return this.validateParameters([email], 'Email is required')
    .then(() => this.findOne({email: email}))
    .then(gymGoer => gymGoer !== null ? gymGoer.serializeAll() : null)
    .catch(Error => {throw Error});
};

gymGoerSchema.statics.createGymGoer = function (email) {
  const newGymGoer = { email: email, trainingSessions: [] };

  return this.validateParameters([email], 'Email is required')
    .then(() => GymGoerModel.create(newGymGoer))
    .then(gymGoer => gymGoer.serializeAll());
};

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

  /*return this.validateParameters([gymGoerID, sessionType], 'Both ID and SessionType are required')
    .then(() => {
      return this.findOne({
        "_id": gymGoerID
      })
        .then(gymGoer => {
          if (gymGoer !== null) {
            const hasDoneSessionToday = gymGoer.hasExistingTrainingSessionToday(sessionType);
            if (hasDoneSessionToday === false) {
              const newSession = { sessionType: sessionType, exercises: [] };
              return this
                .findOneAndUpdate({ "_id": gymGoerID }, { $push: { trainingSessions: newSession } }, { new: true })
                .then(gymGoer => {
                  return gymGoer.getSessionForToday(sessionType);
                });
            }
            return gymGoer.getSessionForToday(sessionType);
          } else {
            throw new Error('ID not found');
          }
        })
        .then((session) => {
          return {
            sessionDate: session.sessionDate,
            exercises: session.exercises,
            sessionType: session.sessionType
          };
        });
    });*/
};

/**
 * Adds an array of exercises to a session and saves that to the database
 * @param {string} sessionId - Id of the session
 * @param {Object[]} newExercises - Array of exercises to add
 * @returns {Object} - Updated session with new exercises added
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

gymGoerSchema.statics.initSessionExercises = function(gymGoerID, sessionType) {
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
    });
};

gymGoerSchema.statics.initTrainingSession = function (gymGoerID, sessionType) {
  let session;
  return this.validateParameters([gymGoerID, sessionType], 'Both GymGoerID and SessionType are required')
    .then(() => this.addTrainingSession(gymGoerID, sessionType))
    .then(_session => session = _session)
    .then(() => this.initSessionExercises(gymGoerID, sessionType))
    .then(exercises => this.addExercisesToSession(session.sessionID, exercises))
    .then(_session => {
      // TODO: find last best set for each exercise right now
      session.exercises = _session.exercises;
      return session;
    });
};

const GymGoerModel = mongoose.model('GymGoer', gymGoerSchema);

module.exports = {GymGoerModel};