'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
// const GymGoerExercisesMethods = require('./GymGoerExercisesMethods');
const GymGoerExercisesStatics = require('./GymGoerExercisesStatics');
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
Object.assign(gymGoerExercisesSchema.statics, GymGoerExercisesStatics);

gymGoerExercisesSchema.methods.serialize = function () {
  return {
    id: this._id,
    exerciseName: this.exerciseName,
    gymGoerId: this.gymGoerId,
    sessionDate: this.sessionDate,
    sessionType: this.sessionType,
    sets: this.sets.map(set => ({setNumber: set.setNumber, weight: set.weight, reps: set.reps}))
  };
};

gymGoerSchema.methods.serializeAll = function() {
  return {
    id: this._id,
    email: this.email
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
gymGoerExercisesSchema.statics.findAllPreviousExercisesForSessionType = function(sessionType, gymGoerId) {
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
 * Find the last exercise for the given session type for the given GymGoer
 * @param {string} sessionType - Type of training session (chest, legs, back, arms etc)
 * @param {string} gymGoerId - GymGoer ID
 * @param {string} exerciseName - Name of the exercise
 * @param {boolean} findWithSets - find ony exercises that have sets
 * @returns {Object[]} - Array of previous exercise objects
 */
gymGoerExercisesSchema.statics.findSinglePreviousExerciseForSessionType = function(gymGoerId, sessionType, exerciseName, findWithSets = true) {
  const startToday = new Date().setHours(0,0,0,0);
  let query = {
    gymGoerId: gymGoerId,
    sessionType: sessionType,
    sessionDate: { $lt: startToday },
    exerciseName: exerciseName
  };

  if (findWithSets === true) {
    query['$where'] = "this.sets.length > 0";
  }

  return this.find(query)
    .sort({sessionDate: -1}) // sort in descending sessionDate order, so the 0th element will be the most recent
    .then(previousExercises => {
      if (previousExercises.length > 0) {
        return previousExercises[0].serialize();
      }
      return null;
    });
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
    .then(exercises => GymGoerExercisesModel.attachLastBestSetToMultipleExercises(exercises))
    .then(exercises => GymGoerExercisesModel.flattenExercises(exercises));
};

/**
 * Adds multiple new exercise with no sets to the session for the given GymGoer
 * @param {string} gymGoerId - GymGoer ID
 * @param {string} sessionType - Type of training session (chest, legs, back, arms etc)
 * @param {Object[]} exercises - Array of the new exercises to add
 * @returns {Promise} - Updated session with new exercise added
 */
gymGoerExercisesSchema.statics.addMultipleNewExercises = function(gymGoerId, sessionType, exercises) {

  const exercisesToInsert = exercises.map(exercise => ({
    gymGoerId: gymGoerId,
    sessionType: sessionType,
    exerciseName: exercise.exerciseName,
    sets: []
  }));

  return this.insertMany(exercisesToInsert)
    .then(() => GymGoerExercisesModel.findExercisesForToday(gymGoerId, sessionType))
    .then(exercises => GymGoerExercisesModel.attachLastBestSetToMultipleExercises(exercises))
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
    .then(exercises => GymGoerExercisesModel.attachLastBestSetToMultipleExercises(exercises))
    .then((exercisesForToday) => GymGoerExercisesModel.flattenExercises(exercisesForToday))
};

/**
 * Callback function for attachLastBestSetToMultipleExercises - finds the previous exercise and gets the best set from that exercise
 * @param {Object} exercise object
 * @returns {Promise} - Updated exercise with last best sets added to the exercise
 */
gymGoerExercisesSchema.statics.attachLastBestSetToSingleExercise = function (exercise) {
  return GymGoerExercisesModel.findSinglePreviousExerciseForSessionType(exercise.gymGoerId, exercise.sessionType, exercise.exerciseName)
    .then(previousExercise => {
      let lastBest = {};
      if (previousExercise !== null) {
        lastBest = GymGoerExercisesModel.getLastBestSet(previousExercise.sets, previousExercise.sessionDate);
      }
      return {
        sessionDate: exercise.sessionDate,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        gymGoerId: exercise.gymGoerId,
        sessionType: exercise.sessionType,
        lastBestSet: lastBest
      };
    });
};

/**
 * Finds the last best set from the previous session exercise sets
 * @param {Object[]} exercises - array of exercise objects
 * @returns {Promise} - Updated session with new last best sets added to each exercise
 */
gymGoerExercisesSchema.statics.attachLastBestSetToMultipleExercises = function (exercises) {
  const processExercisesFunctions = [];
  exercises.forEach(exercise => processExercisesFunctions.push(GymGoerExercisesModel.attachLastBestSetToSingleExercise(exercise)));
  return Promise
    .all(processExercisesFunctions)
    .catch(err => console.error(err));
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
        lastBestSet: exercise.lastBestSet
      };
    })
  };
};

/**
 * Gets the previous exercises for the given session type and creates a session object with the previous exercises, if any
 * @param {string} gymGoerId - Id of the GymGoer
 * @param {string} sessionType - Type of session
 * @returns {Object|Promise} - Updated session with empty exercise set or a promise containing session with previous exercises
 */
gymGoerExercisesSchema.statics.preFillExercisesFromPreviousSession = function (gymGoerId, sessionType) {
  const startToday = new Date().setHours(0,0,0,0);
  return GymGoerExercisesModel.findAllPreviousExercisesForSessionType(sessionType, gymGoerId)
    .then(exercisesArray => {
      const defaultSessionObject = { sessionType: sessionType, sessionDate: startToday, exercises: [] };
      if (exercisesArray.length > 0) {
        return GymGoerExercisesModel.addMultipleNewExercises(gymGoerId, sessionType, exercisesArray);
      } else {
        return defaultSessionObject;
      }
    });
};

/**
 * Initialises session's exercises, by getting today's exercises, or previous
 * set of exercises for the given session (if any)
 * @param {string} gymGoerId - Id of the GymGoer
 * @param {string} sessionType - Type of session
 * @returns {Promise} - Updated session with new exercises added
 */
gymGoerExercisesSchema.statics.initSessionExercises = function(gymGoerId, sessionType) {
  return GymGoerExercisesModel.findExercisesForToday(gymGoerId, sessionType)
    .then(exercises => GymGoerExercisesModel.attachLastBestSetToMultipleExercises(exercises))
    .then(exercises => {
      if (exercises !== null && exercises.length > 0) { // There are exercises for today
        // return GymGoerExercisesModel.findLastBestSetForExercises(exercisesArray)
        //        .then(exercises => GymGoerExercisesModel.flattenExercises(exercises))
        return GymGoerExercisesModel.flattenExercises(exercises)
      } else { // No exercises for today
        return GymGoerExercisesModel.preFillExercisesFromPreviousSession(gymGoerId, sessionType);
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