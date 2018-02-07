const expect = require('chai').expect;

const GymGoerModelMethods = require('../../models/GymGoerModelMethods');

let dateToday = new Date();
let dateYesterday = new Date();
dateYesterday.setDate(dateToday.getDate() - 1);

const TEST_GYM_GOER = {
  id: '5a7ad0c00b1a3545ed5ed3f7',
  email: 'alex@bandisch.com',
  trainingSessions: [
    {
      exercises: [],
      sessionDate: dateToday,
      sessionType: 'chest'
    },
    {
      exercises: [],
      sessionDate: dateYesterday,
      sessionType: 'chest'
    }
  ]
};

const TEST_GYM_GOER_2 = {
  id: '5a7ad0c00b1a3545ed5ed3f7',
  email: 'alex@bandisch.com',
  trainingSessions: [
    {
      exercises: [],
      sessionDate: dateYesterday,
      sessionType: 'chest'
    }
  ]
};

describe('# GymGoerModelMethods', function () {
  describe('# GymGoerModelMethods.getTodaysSession', function () {
    it('should return the training session for today', function () {
      const result = GymGoerModelMethods.getTodaysSession('chest', TEST_GYM_GOER);
      expect(result).to.be.an.instanceOf(Object);
      expect(result).to.have.keys(['exercises', 'sessionDate', 'sessionType']);
      expect(result.sessionType).to.be.equal('chest');
    });
    it('should return undefined if it cannot find the session for today', function () {
      const result = GymGoerModelMethods.getTodaysSession('legs', TEST_GYM_GOER);
      expect(result).to.be.equal(undefined);
    });
  });
  describe('# GymGoerModelMethods.hasDoneTrainingSessionToday', function () {
    it('should return true if there is an existing training session for today', function () {
      const result = GymGoerModelMethods.hasDoneTrainingSessionToday('chest', TEST_GYM_GOER);
      expect(result).to.be.equal(true);
    });
    it('should return false if there is no existing training session for today', function () {
      const result = GymGoerModelMethods.hasDoneTrainingSessionToday('chest', TEST_GYM_GOER_2);
      expect(result).to.be.equal(false);
    });
  });
});