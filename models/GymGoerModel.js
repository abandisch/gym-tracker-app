'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const GymGoerModelUtils = require('./GymGoerModelUtils');

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

// Assign the GymGoerModelUtils to the gymGoerSchema methods
Object.assign(gymGoerSchema.methods, GymGoerModelUtils);

gymGoerSchema.methods.serialize = function() {
  return {
    id: this._id,
    email: this.email
  };
};

gymGoerSchema.methods.serializeAll = function() {
  return {
    id: this._id,
    email: this.email,
    trainingSessions: this.trainingSessions.map(trainingSession => ({
      exercises: trainingSession.exercises,
      sessionDate: trainingSession.sessionDate,
      sessionType: trainingSession.sessionType
    }))
  };
};

gymGoerSchema.statics.findGymGoerByEmail = function(email) {
  if (email === undefined) {
    return new Promise((resolve, reject) => {
      reject(new Error('Email is required'));
    });
  }

  return this.findOne({email: email}).then(gymGoer => {
    if (gymGoer) {
      return gymGoer.serializeAll()
    } else {
      return null;
    }
  });

};

gymGoerSchema.statics.createGymGoer = function (email) {
  if (email === undefined) {
    return new Promise((resolve, reject) => {
      reject(new Error('Email is required'));
    });
  }
  return GymGoerModel.create({
    email: email,
    trainingSessions: []
  }).then(gymGoer => gymGoer.serializeAll());
};

gymGoerSchema.statics.addTrainingSession = function (gymGoerID, sessionType) {

  if (gymGoerID === undefined || sessionType === undefined) {
    return new Promise((resolve, reject) => {
      reject(new Error('Both GymGoer ID and SessionType is required'));
    });
  }

  const newSession = {
    sessionType: sessionType,
    exercises: []
  };

  return this.findOne({
      "_id": gymGoerID
    })
    .then(gymGoer => {
      if (gymGoer !== null) {
        const hasDoneSessionToday = gymGoer.hasDoneTrainingSessionToday(sessionType);
        if (hasDoneSessionToday === false) {
          return this
            .findOneAndUpdate({ "_id": gymGoerID }, { $push: { trainingSessions: newSession } })
            .then(gymGoer => {
              return gymGoer;
            });
        }
        return gymGoer;
      } else {
        throw new Error('ID not found');
      }
    })
    .then(() => {
      return {
        created: true,
        sessionType: sessionType
      };
    });
};

const GymGoerModel = mongoose.model('GymGoer', gymGoerSchema);

module.exports = {GymGoerModel};