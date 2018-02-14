'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const GymGoerExercisesMethods = require('./GymGoerExercisesMethods');
const {validateParameters, toReadableISODate} = require('./GymGoerUtils');

const gymGoerExercisesSchema = mongoose.Schema({
  gymGoerId: {type: mongoose.Schema.Types.ObjectId, required: true},
  sessionType: {type: String, required: true},
  sessionDate: {type: Date, default: Date.now},
  exerciseName: {type: String, default: ''},
  sets: [
    {
      setNumber: {type: Number, required: true},
      weight: {type: String, required: true},
      reps: {type: Number, required: true}
    }
  ]
});

const gymGoerSchema = mongoose.Schema({
  email: {type: String,
          required: true,
          index: true,
          unique: true
  }
});

// Assign the GymGoerExercisesMethods to the gymGoerSchema methods
Object.assign(gymGoerExercisesSchema.statics, GymGoerExercisesMethods);

gymGoerSchema.methods.serializeAll = function() {
  return {
    id: this._id,
    email: this.email/*,
      trainingSessions: this.trainingSessions.map(trainingSession => ({
        sessionID: trainingSession._id,
        exercises: trainingSession.exercises.map(exercise => ({sets: exercise.sets, name: exercise.name, exerciseID: exercise._id})),
        sessionDate: trainingSession.sessionDate,
        sessionType: trainingSession.sessionType
      }))*/
  };
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
  return validateParameters([email], 'Email is required')
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

  return validateParameters([email], 'Email is required')
    .then(() => GymGoerModel.create(newGymGoer))
    .then(gymGoer => gymGoer.serializeAll());
};

/**
 * Find the exercises from the last session for the given GymGoer
 * @param {string} sessionType - Type of training session (chest, legs, back, arms etc)
 * @param {string} gymGoerId - GymGoer ID
 * @returns {Object[]} - Array of previous exercise objects
 */
gymGoerExercisesSchema.statics.findPreviousExercises = function(sessionType, gymGoerId) {
  const startToday = new Date().setHours(0,0,0,0);

  return this.find({ // find previous exercises for sessionType
      gymGoerId: gymGoerId,
      sessionType: sessionType,
      sessionDate: { $lt: startToday }
    })
    .sort({sessionDate: -1}) // sort in descending sessionDate order, so the 0th element will be the most recent
    .then(previousExercises => GymGoerExercisesModel.extractExercisesFromLastSession(previousExercises));
};

/**
 * Adds a single new exercise with no sets to the session for the given GymGoer
 * @param {string} gymGoerId - GymGoer ID
 * @param {string} sessionType - Type of training session (chest, legs, back, arms etc)
 * @param {string} exerciseName - Name of the new exercise
 * @returns {Promise} - Updated session with new exercise added
 */
gymGoerExercisesSchema.statics.addNewExercise = function(gymGoerId, sessionType, exerciseName) {
  return this.create({
      gymGoerId: gymGoerId,
      sessionType: sessionType,
      exerciseName: exerciseName,
      sets: []
    })
    .then(() => GymGoerExercisesModel.findExercisesForToday(gymGoerId, sessionType))
    .then(exercises => GymGoerExercisesModel.flattenExercises(exercises));
};

gymGoerExercisesSchema.statics.addMultipleNewExercises = function(gymGoerId, sessionType, exercises) {

  const exercisesToInsert = exercises.map(exercise => ({
    gymGoerId: gymGoerId,
    sessionType: sessionType,
    exerciseName: exercise.exerciseName,
    sets: []
  }));

  return this.insertMany(exercisesToInsert)
    .then(() => GymGoerExercisesModel.findExercisesForToday(gymGoerId, sessionType))
    .then(exercises => GymGoerExercisesModel.flattenExercises(exercises));
};

/**
 * Adds a new Set to the exercise
 * @param {String} gymGoerId - GymGoer Id
 * @param {String} sessionType - type of session
 * @param {String} exerciseName - name of the exercise
 * @param {Object} newSet - Object containing the details of the new set { weight, reps }
 * @returns {Promise} - Updated exercise session with new set added to the exercise
 */
gymGoerExercisesSchema.statics.addNewSet = function (gymGoerId, sessionType, exerciseName, newSet) {
  const startToday = new Date().setHours(0,0,0,0);
  const endToday = new Date().setHours(23,59,59,0);
  let setNumber;

  return this.findOne({
      "gymGoerId": gymGoerId,
      "sessionType": sessionType,
      "sessionDate": { $gte: startToday, $lte: endToday },
      "exerciseName": exerciseName
    })
    .then(exercise => setNumber = exercise.sets.length + 1)
    .then(() => this.findOneAndUpdate({
      "gymGoerId": gymGoerId,
      "sessionType": sessionType,
      "sessionDate": { $gte: startToday, $lte: endToday },
      "exerciseName": exerciseName
      },
      { $addToSet:
          {
            "sets": {
              setNumber: setNumber,//{ $size: "$sets" }, // see if there is a better way of doing this ...
              weight: newSet.weight,
              reps: newSet.reps
            }
          }
      },
      { new: true }
    ))
    .then(() => GymGoerExercisesModel.findExercisesForToday(gymGoerId, sessionType))
    .then((exercisesForToday) => GymGoerExercisesModel.flattenExercises(exercisesForToday))
};

/**
 * Finds the last best set from the previous session exercise sets
 * @param {Object} currentSession - current training session
 * @param {Object} previousSession - previous training session
 * @returns {Promise} - Updated session with new last best sets added to each exercise
 */
gymGoerExercisesSchema.statics.findLastBestSetForExercise = function (currentSession, previousSession) {
  return new Promise((resolve, reject) => {
    if (previousSession !== undefined) {
      currentSession.lastBestSet = GymGoerExercisesMethods.getLastBestSet(previousSession.sets, previousSession.sessionDate);
    } else {
      currentSession.lastBestSet = {};
    }
    resolve(currentSession);
  })
};

/**
 * Turn an array of exercises into a single object
 * @param {Object[]} arrayOfExercises - array of exercise objects
 * @return {Object} - Session Object that looks like: { sessionType, sessionDate, exercises[ exerciseName, sets, lastBestSet ] }
*/
gymGoerExercisesSchema.statics.flattenExercises = function(arrayOfExercises) {
  if (!Array.isArray(arrayOfExercises) || arrayOfExercises.length === 0) {
    return null;
  }
  return {
    sessionType: arrayOfExercises[0].sessionType,
    sessionDate: arrayOfExercises[0].sessionDate,
    exercises: arrayOfExercises.map(exercise => {
      return {
        name: exercise.exerciseName,
        sets: exercise.sets,
        lastBestSet: {}
      }
    })
  };
};

/**
 * Initialises session's exercises, by getting previous set of exercises
 * for the given session (if any), and then adding those exercises to
 * the session (via addNewExercise call)
 * @param {string} gymGoerId - Id of the GymGoer
 * @param {string} sessionType - Type of session
 * @returns {Promise} - Updated session with new exercises added
 */
gymGoerExercisesSchema.statics.initSessionExercises = function(gymGoerId, sessionType) {
  const startToday = new Date().setHours(0,0,0,0);
  return GymGoerExercisesModel.findExercisesForToday(gymGoerId, sessionType)
    .then(exercises => {
      if (exercises !== null && exercises.length > 0) { // There are exercises for today
        return GymGoerExercisesModel.flattenExercises(exercises)
      } else { // No exercises for today
        return GymGoerExercisesModel.findPreviousExercises(sessionType, gymGoerId)
          .then(exercisesArray => {
            if (exercisesArray.length > 0) {
              return GymGoerExercisesModel.addMultipleNewExercises(gymGoerId, sessionType, exercisesArray)
                // .then(exercises => GymGoerExercisesModel.flattenExercises(exercises));
            } else {
              return { sessionType: sessionType, sessionDate: startToday, exercises: [] }
            }
          });
      }
    });
};

/**
 * Initialises training session for a GymGoer, by adding the training session to the database,
 * and initialising the exercises (via initSessionExercises call)
 * @param {string} gymGoerID - Id of the GymGoer
 * @param {string} sessionType - Type of session
 * @returns {Promise} - Training session with exercises (if any)
 */
gymGoerExercisesSchema.statics.initGymGoerTrainingSession = function (gymGoerID, sessionType) {
  return validateParameters([gymGoerID, sessionType], 'Both GymGoerID and SessionType are required')
          .then(() => GymGoerExercisesModel.initSessionExercises(gymGoerID, sessionType))
};

const GymGoerModel = mongoose.model('GymGoer', gymGoerSchema);
const GymGoerExercisesModel = mongoose.model('GymGoerExercises', gymGoerExercisesSchema);

module.exports = {GymGoerModel, GymGoerExercisesModel};