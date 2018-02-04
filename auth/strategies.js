'use strict';
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { GymGoerModel } = require('../models/GymGoerModel');
const { JWT_SECRET } = require('../config');

const localStrategy = new LocalStrategy({usernameField: 'email'},(email, password, callback) => {
    GymGoerModel.findOne({ email: email })
      .then(gymGoer => {
        if (!gymGoer) {
          return GymGoerModel.create({
            email: email,
            trainingSessions: []
          });
        }
        return callback(null, gymGoer);
      })
      .then(gymGoer => {
        return callback(null, gymGoer);
      })
      .catch(err => {
        if (err.reason === 'LoginError') {
          return callback(null, false, err);
        }
        return callback(err, false);
      });
});

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    // Look for the JWT as a Bearer auth header
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    // Only allow HS256 tokens - the same as the ones we issue
    algorithms: ['HS256']
  },
  (payload, done) => {
    done(null, payload.user);
  }
);

module.exports = { localStrategy, jwtStrategy };
