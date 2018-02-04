'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;

const gymGoerSchema = mongoose.Schema({
  email: {type: String, required: true},
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
    trainingSessions: this.trainingSessions
  };
};

const GymGoerModel = mongoose.model('GymGoer', gymGoerSchema);

module.exports = {GymGoerModel};