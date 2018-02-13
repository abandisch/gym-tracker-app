const expect = require('chai').expect;
const mongoose = require('mongoose');
const {TEST_DATABASE_URL} = require('../../config');
const {GymGoerModel, GymGoerExercisesModel} = require('../../models/GymGoerModel');

mongoose.Promise = global.Promise;

const createTestGymGoer = (email) => {
  return GymGoerModel.createGymGoer(email);
};
const findTestGymGoer = (email) => {
  return GymGoerModel.findGymGoerByEmail(email);
};
const addTestTrainingSession = (gymGoerId, sessionType) => {
  return GymGoerExercisesModel.addTrainingSession(gymGoerId, sessionType);
};
const addTestSessionForGymGoer = (sessionType) => {
  return (gymGoer) => addTestTrainingSession(gymGoer.id, sessionType).then(() => gymGoer);
};
function addPreviousTestExercise(gymGoerId, sessionType, sessionDate, exerciseName) {
  return GymGoerExercisesModel.create({
    gymGoerId: gymGoerId,
    sessionType: sessionType,
    sessionDate: sessionDate,
    exerciseName: exerciseName,
    sets: []
  });
}
function toReadableISODate(date) {
  return new Date(date).toISOString().split('T')[0];
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const TEST_EMAIL = 'alex@bandisch.com';

describe('# GymGoerExerciseModel', function () {
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

  // Test Dates
  let oneWeekAgoDate = new Date();
  oneWeekAgoDate.setDate(oneWeekAgoDate.getDate() - 7);

  let twoWeeksAgoDate = new Date();
  twoWeeksAgoDate.setDate(oneWeekAgoDate.getDate() - 7);

  const initTestGymGoerTrainingSession = (gymGoerId, sessionType) => {
    return GymGoerExercisesModel.initGymGoerTrainingSession(gymGoerId, sessionType);
  };

  describe('# GymGoerExercisesModel.initSessionExercises', function () {
    it('should provide a session with empty exercises array', function () {
      let gymGoer;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => GymGoerExercisesModel.initSessionExercises(gymGoer.id, 'chest'))
        .then(session => {
          expect(session.exercises.length).to.equal(0)
        });
    });
  });

  describe('# GymGoerExercisesModel.initGymGoerTrainingSession', function () {
    it('should initialise a training session for a gym goer', function () {
      let gymGoer;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => initTestGymGoerTrainingSession(gymGoer.id, 'chest'))
        .then(initialisedSession => {
          const dateToday = new Date().toISOString().split('T')[0];
          const dateSession = new Date(initialisedSession.sessionDate).toISOString().split('T')[0];
          expect(initialisedSession).to.be.a('object');
          expect(initialisedSession).to.have.keys(['sessionDate', 'exercises', 'sessionType']);
          expect(dateSession).to.equal(dateToday);
        });
    })
  });

  describe('# GymGoerExercisesModel.addNewExercise', function () {
    it('should add a new exercise to the Gym Goer\'s session and return the session', function () {
      let gymGoer;
      const TEST_SESSION_TYPE = 'legs';
      const TEST_EXERCISE_NAME_1 = "leg press";
      const TEST_EXERCISE_NAME_2 = "squats";
      const TEST_EXERCISE_NAME_3 = "deadlift";
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => GymGoerExercisesModel.addNewExercise(gymGoer.id, TEST_SESSION_TYPE, TEST_EXERCISE_NAME_1))
        .then(() => sleep(100)) // add some time between insert, per real life
        .then(() => GymGoerExercisesModel.addNewExercise(gymGoer.id, TEST_SESSION_TYPE, TEST_EXERCISE_NAME_2))
        .then(() => sleep(100)) // add some time between insert, per real life
        .then(() => GymGoerExercisesModel.addNewExercise(gymGoer.id, TEST_SESSION_TYPE, TEST_EXERCISE_NAME_3))
        .then(session => {
          expect(session.exercises.length).to.equal(3);
          expect(session.exercises[0].name).to.equal(TEST_EXERCISE_NAME_3);
          expect(session.exercises[1].name).to.equal(TEST_EXERCISE_NAME_2);
          expect(session.exercises[2].name).to.equal(TEST_EXERCISE_NAME_1);
          expect(session.sessionType).to.equal(TEST_SESSION_TYPE);
        })
        .then(() => GymGoerExercisesModel.find({"gymGoerId": gymGoer.id, "sessionType": TEST_SESSION_TYPE}))
        .then((sessionFromDB) => {
          expect(sessionFromDB.length).to.equal(3);
          expect(sessionFromDB[0].sessionType).to.equal(TEST_SESSION_TYPE);
        })
    });
  });

  describe('# GymGoerExercisesModel.findPreviousExercises', function () {

    it('should return an array of exercises from the last training session', function () {
      const TEST_SESSION_TYPE = 'chest';
      const TEST_EXERCISE_NAME_1 = 'bench press';
      const TEST_EXERCISE_NAME_2 = 'inclined bench press';
      const TEST_EXERCISE_NAME_3 = 'dips';

      let gymGoer;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, oneWeekAgoDate, TEST_EXERCISE_NAME_1))
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, oneWeekAgoDate, TEST_EXERCISE_NAME_2))
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, oneWeekAgoDate, TEST_EXERCISE_NAME_3))
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, twoWeeksAgoDate, TEST_EXERCISE_NAME_1))
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, twoWeeksAgoDate, TEST_EXERCISE_NAME_2))
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, twoWeeksAgoDate, TEST_EXERCISE_NAME_3))
        .then(() => GymGoerExercisesModel.findPreviousExercises(TEST_SESSION_TYPE, gymGoer.id))
        .then((exercises) => {
          exercises.forEach(exercise => {
            expect(toReadableISODate(exercise.sessionDate)).to.equal(toReadableISODate(oneWeekAgoDate))
            expect(exercise.sessionType).to.equal(TEST_SESSION_TYPE);
            expect(exercise.gymGoerId.toString()).to.equal(gymGoer.id.toString());
          });
          expect(exercises.length).to.equal(3);
        });
    });
    it('should return an empty array where there is no previous exercises for the session type', function () {
      let gymGoer;
      const REQUIRED_SESSION_TYPE = 'chest';
      const OTHER_SESSION_TYPE = 'legs';
      const TEST_EXERCISE_NAME = 'leg press';
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => addPreviousTestExercise(gymGoer.id, OTHER_SESSION_TYPE, oneWeekAgoDate, TEST_EXERCISE_NAME))
        .then(() => GymGoerExercisesModel.findPreviousExercises(REQUIRED_SESSION_TYPE, gymGoer.id))
        .then((exercises) => {
          expect(exercises.length).to.equal(0);
        });
    });
  });

  describe('# GymGoerExercisesModel.hasExistingTrainingSessionToday', function () {
    it('should return true if there is an existing training session for today', function () {
      const SESSION_TYPE = 'chest';
      const TEST_EXERCISE_NAME = 'bench press';
      const TODAY = new Date();
      let gymGoer;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => addPreviousTestExercise(gymGoer.id, SESSION_TYPE, TODAY, TEST_EXERCISE_NAME))
        .then(() => GymGoerExercisesModel.hasExistingTrainingSessionToday(SESSION_TYPE, gymGoer))
        .then((result) => {
          expect(result).to.be.equal(true);
        });
    });
    it('should return false if there is no existing training session for today', function () {
      const SESSION_TYPE = 'chest';
      const OTHER_SESSION_TYPE = 'legs';
      const TEST_EXERCISE_NAME = 'bench press';
      const TODAY = new Date();
      let gymGoer;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => addPreviousTestExercise(gymGoer.id, OTHER_SESSION_TYPE, TODAY, TEST_EXERCISE_NAME))
        .then(() => GymGoerExercisesModel.hasExistingTrainingSessionToday(SESSION_TYPE, gymGoer))
        .then((result) => {
          expect(result).to.be.equal(false);
        });
    });
  });

  describe('# GymGoerExercisesModel.flattenExercises', function () {
    it('should return an object containing the session details and an array of exercises', function () {
      const TEST_SESSION_TYPE = 'chest';
      const TEST_EXERCISE_NAME_1 = 'bench press';
      const TEST_EXERCISE_NAME_2 = 'inclined bench press';
      const TEST_EXERCISE_NAME_3 = 'dips';
      const TODAY = new Date();
      let gymGoer;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, TODAY, TEST_EXERCISE_NAME_1))
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, TODAY, TEST_EXERCISE_NAME_2))
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, TODAY, TEST_EXERCISE_NAME_3))
        .then(() => GymGoerExercisesModel.findExercisesForToday(gymGoer.id, TEST_SESSION_TYPE))
        .then((exercises) => GymGoerExercisesModel.flattenExercises(exercises))
        .then((exerciseSession) => {
          expect(exerciseSession.sessionType).to.equal(TEST_SESSION_TYPE);
          expect(exerciseSession.exercises.length).to.equal(3);
          expect(toReadableISODate(exerciseSession.sessionDate)).to.equal(toReadableISODate(TODAY));
        });
    });
    it('should return null if no array of exercises is provided', function () {
      let gymGoer;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => GymGoerExercisesModel.flattenExercises([]))
        .then((exerciseSession) => {
          expect(exerciseSession).to.equal(null);
        });
    });

  });

  describe.skip('# GymGoerExercisesModel.findLastBestSet', function () {
    it('should find and return the last best set for an exercise from the previous session');
    it('should return an empty object if there is no last best set in the previous session');
  });

  describe('# GymGoerExercisesModel.addNewSet', function () {
    it('should assign the setNumber to the set, add a new set to the exercise and return the updated exercise session', function () {
      const TEST_SESSION_TYPE = 'chest';
      const TEST_EXERCISE_NAME_1 = 'bench press';
      const TEST_EXERCISE_NAME_2 = 'inclined bench press';
      const TEST_SET = {
        weight: "40",
        reps: 12
      };
      const TODAY = new Date();

      let gymGoer;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoer = _gymGoer)
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, TODAY, TEST_EXERCISE_NAME_1))
        .then(() => addPreviousTestExercise(gymGoer.id, TEST_SESSION_TYPE, TODAY, TEST_EXERCISE_NAME_2))
        .then(() => GymGoerExercisesModel.addNewSet(gymGoer.id, TEST_SESSION_TYPE, TEST_EXERCISE_NAME_1, TEST_SET))
        .then(() => GymGoerExercisesModel.addNewSet(gymGoer.id, TEST_SESSION_TYPE, TEST_EXERCISE_NAME_1, TEST_SET))
        .then((exerciseSession) => {
          expect(exerciseSession.sessionType).to.equal(TEST_SESSION_TYPE);
          expect(exerciseSession.sets.length).to.equal(2);
          expect(toReadableISODate(exerciseSession.sessionDate)).to.equal(toReadableISODate(TODAY));
          expect(exerciseSession.exerciseName).to.equal(TEST_EXERCISE_NAME_1);
          expect(exerciseSession.sets[0].setNumber).to.equal(1);
          expect(exerciseSession.sets[0].weight).to.equal("40");
          expect(exerciseSession.sets[0].reps).to.equal(12);
        });
    });
  });

});

describe('# GymGoerModel', function () {

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

  describe('# GymGoerModel.createGymGoer', function () {

    it('should throw an Error is the email is not provided', function () {
      return createTestGymGoer()
        .catch(err => expect(err).to.be.an.instanceOf(Error));
    });

    it('should throw an Error is the email is an empty string', function () {
      return createTestGymGoer("")
        .catch(err => expect(err).to.be.an.instanceOf(Error));
    });

    it('should throw an Error if the email address is already in the database', function () {
      return createTestGymGoer(TEST_EMAIL)
        .then(() => createTestGymGoer(TEST_EMAIL))
        .catch(err => expect(err).to.be.an.instanceOf(Error));
    });

    it('should create and provide the newly created, serialized GymGoer', function () {
      return createTestGymGoer(TEST_EMAIL)
        .then(gymGoer => {
          expect(gymGoer).to.be.an.instanceOf(Object);
          expect(gymGoer).to.have.keys(['id', 'email']);
        });
    });

  });

  describe('# GymGoerModel.findGymGoerByEmail', function () {

    it('should throw an Error if no email is provided', function () {
      return findTestGymGoer()
        .catch(err => expect(err).to.be.an.instanceOf(Error));
    });

    it('should return null if it cannot find the GymGoer by email', function () {
      return findTestGymGoer(TEST_EMAIL)
        .then(gymGoer => expect(gymGoer).to.be.equal(null));
    });

    it('should find GymGoer by email and provide a serialised GymGoer', function () {
      let gymGoerID;
      return createTestGymGoer(TEST_EMAIL)
        .then(_gymGoer => gymGoerID = _gymGoer.id)
        .then(() => findTestGymGoer(TEST_EMAIL))
        .then(gymGoer => {
          expect(gymGoer).to.be.an.instanceOf(Object);
          expect(gymGoer).to.have.keys(['id', 'email']);
        });
    });

  });

  /* - THIS HAS BEEN MOVED TO GymGoerUtils
  describe('# GymGoerModel.validateParameters', function () {
    it('should return true if all parameters are not undefined', function () {
      const parameter1 = 'test1';
      const parameter2 = 'test2';
      GymGoerModel
        .validateParameters([parameter1, parameter2], 'test message')
        .then(result => {
          expect(result).to.equal(true);
        });
    });
    it('should throw an Error if one or all parameters are undefined', function () {
      const parameter1 = 'test1';
      const parameter2 = undefined;
      GymGoerModel
        .validateParameters([parameter1, parameter2], 'All parameters are required')
        .catch(result => {
          expect(result).to.be.an.instanceOf(Error);
        });
    });
    it('should throw an Error if all parameters are undefined', function () {
      const parameter1 = undefined;
      GymGoerModel
        .validateParameters([parameter1], 'All parameters are required')
        .catch(result => {
          expect(result).to.be.an.instanceOf(Error);
        });
    });
  });*/

});
