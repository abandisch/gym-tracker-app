const expect = require('chai').expect;

const GymGoerExercisesStatics = require('../../models/GymGoerExercisesStatics');

let dateToday = new Date();
let dateYesterday = new Date();
dateYesterday.setDate(dateToday.getDate() - 1);

const TEST_SETS_NUMERIC = [
  {
    setNumber: "1",
    weight: "110",
    reps: "12"
  },
  {
    setNumber: "2",
    weight: "110",
    reps: "11"
  },
  {
    setNumber: "3",
    weight: "110",
    reps: "12"
  }
];

const TEST_SETS_STRING = [
  {
    setNumber: "1",
    weight: "body weight",
    reps: "12"
  },
  {
    setNumber: "2",
    weight: "body weight",
    reps: "11"
  },
  {
    setNumber: "3",
    weight: "body weight",
    reps: "12"
  }
];

describe('# GymGoerExercisesStatics', function () {
  describe('# GymGoerExercisesStatics.findBestSet', function () {
    it('should return an object that has the best reps and weight out of the set, where weight is numeric', function () {
      const result = GymGoerExercisesStatics.findBestSet(TEST_SETS_NUMERIC);
      expect(result).to.be.an.instanceOf(Object);
      expect(result.weight).to.be.equal("110");
      expect(result.reps).to.be.equal("12");
    });
    it('should return an object that has the best reps and weight out of the set, where weight is a string', function () {
      const result = GymGoerExercisesStatics.findBestSet(TEST_SETS_STRING);
      expect(result).to.be.an.instanceOf(Object);
      expect(result.weight).to.be.equal("body weight");
      expect(result.reps).to.be.equal("12");
    });
  });
});