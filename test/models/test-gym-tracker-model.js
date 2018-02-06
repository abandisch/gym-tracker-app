const expect = require('chai').expect;
const mongoose = require('mongoose');
const {TEST_DATABASE_URL} = require('../../config');
const {GymGoerModel} = require('../../models/GymGoerModel');

mongoose.Promise = global.Promise;

describe.only('# GymGoerModel', function () {

  // Connect to the database
  before(function () {
    return new Promise((resolve, reject) => {
      mongoose.connect(TEST_DATABASE_URL, err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  });

  // Clean the database before each test
  beforeEach(function () {
    return mongoose.connection.dropDatabase();
  });

  // Disconnect from the database
  after(function () {
    return mongoose.disconnect();
  });

  const TEST_EMAIL = 'alex@bandisch.com';

  describe('# GymGoerModel.createGymGoer', function () {

    it('should throw an Error is the email is not provided', function () {
      return GymGoerModel
        .createGymGoer()
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error);
        });
    });

    it('should throw an Error is the email is an empty string', function () {
      return GymGoerModel
        .createGymGoer("")
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error);
        });
    });

    it('should throw an Error if the email address is already in the database', function () {
      return GymGoerModel
        .createGymGoer(TEST_EMAIL)
        .then(gymGoer => {
          return GymGoerModel.createGymGoer(TEST_EMAIL);
        })
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error);
        });
    });

    it('should create and provide the newly created, serialized GymGoer', function () {
      return GymGoerModel
        .createGymGoer(TEST_EMAIL)
        .then(gymGoer => {
          expect(gymGoer).to.be.an.instanceOf(Object);
          expect(gymGoer).to.have.keys(['id', 'email', 'trainingSessions']);
        });
    });

  });

  describe('# GymGoerModel.findGymGoerByEmail', function () {

    it('should throw an Error if no email is provided', function () {
      return GymGoerModel
        .findGymGoerByEmail()
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error);
        })
    });

    it('should return null if it cannot find the GymGoer by email', function () {
      return GymGoerModel
        .findGymGoerByEmail(TEST_EMAIL)
        .then(gymGoer => {
          expect(gymGoer).to.be.equal(null);
        });
    });

    it('should find GymGoer by email and provide a serialised GymGoer', function () {
      return GymGoerModel
        .createGymGoer(TEST_EMAIL)
        .then(gymGoer => {
          return GymGoerModel
            .findGymGoerByEmail(TEST_EMAIL)
            .then(gymGoer => {
              expect(gymGoer).to.be.an.instanceOf(Object);
              expect(gymGoer).to.have.keys(['id', 'email', 'trainingSessions']);
            });
        });
    });

  });

  describe('# GymGoerModel.addTrainingSession', function () {

    it('should return null if the GymGoer ID does not exist in the database', function () {
      return GymGoerModel
        .addTrainingSession('5a777eed2f47b02f9d01757c', 'chest')
        .then(result => {
          expect(result).to.equal(null);
        });
    });

    it('should throw an Error if the GymGoer ID is not an ObjectID', function () {
      return GymGoerModel
        .addTrainingSession('banana', 'chest')
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error);
        });
    });

    it('should add a training session to a GymGoer', function () {
      return GymGoerModel
        .createGymGoer(TEST_EMAIL)
        .then(gymGoer => {
          return GymGoerModel
            .addTrainingSession(gymGoer.id, 'chest')
            .then(_gymGoper => {
              expect(_gymGoper.trainingSessions).to.have.lengthOf(1);
              expect(_gymGoper.trainingSessions[0]).to.have.keys(['sessionDate', 'exercises', 'sessionType']);
            })
        })
    });
  })
});