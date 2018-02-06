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

  const startOfToday = new Date().setHours(0,0,0,0);
  const endOfToday = new Date().setHours(23,59,59,999);
  const newSession = {
    sessionType: sessionType,
    exercises: []
  };

  return this.findOneAndUpdate({
    // Find GymGoer by gymGoerID
    "_id": gymGoerID,
    // Find trainingSessions, where sessionDate is NOT today
    "trainingSessions.sessionDate": { $not: { $gte: startOfToday, $lt: endOfToday } },
    // Find trainingSessions, where sessionType is NOT sessionType
    "trainingSessions.sessionType": { $not: { $eq: sessionType } }
  },{
    $push: {
      trainingSessions: newSession
    }
  },{
    new: true
  })
  .then(gymGoer => {
    if (gymGoer === null) {
      return null;
    }
    return gymGoer.serializeAll()
  })
  .catch(err => {
    throw new Error(err.message);
  });

};

const GymGoerModel = mongoose.model('GymGoer', gymGoerSchema);

module.exports = {GymGoerModel};