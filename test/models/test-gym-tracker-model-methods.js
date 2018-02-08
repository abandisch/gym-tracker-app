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
      exercises: [
        {
          name: "bench press",
          sets: [
            {
              setNumber: 1,
              weight: "60",
              reps: 12
            },
            {
              setNumber: 2,
              weight: "60",
              reps: 10
            },
            {
              setNumber: 3,
              weight: "60",
              reps: 11
            }
          ]
        },
        {
          name: "dips",
          sets: [
            {
              setNumber: 1,
              weight: "body weight",
              reps: 11
            },
            {
              setNumber: 2,
              weight: "body weight",
              reps: 12
            },
            {
              setNumber: 3,
              weight: "body weight",
              reps: 11
            }
          ]
        },
        {
          name: "inclined bench",
          sets: [
            {
              setNumber: 1,
              weight: "45",
              reps: 10
            },
            {
              setNumber: 2,
              weight: "50",
              reps: 10
            },
            {
              setNumber: 3,
              weight: "45",
              reps: 10
            }
          ]
        }
      ],
      sessionDate: dateToday,
      sessionType: 'chest'
    },
    {
      sessionDate: dateYesterday,
      sessionType: 'chest',
      exercises: [
        {
          name: "bench press",
          sets: [
            {
              setNumber: 1,
              weight: "60",
              reps: 12
            },
            {
              setNumber: 2,
              weight: "60",
              reps: 10
            },
            {
              setNumber: 3,
              weight: "60",
              reps: 11
            }
          ]
        },
        {
          name: "dips",
          sets: [
            {
              setNumber: 1,
              weight: "body weight",
              reps: 11
            },
            {
              setNumber: 2,
              weight: "body weight",
              reps: 12
            },
            {
              setNumber: 3,
              weight: "body weight",
              reps: 11
            }
          ]
        },
        {
          name: "inclined bench",
          sets: [
            {
              setNumber: 1,
              weight: "45",
              reps: 10
            },
            {
              setNumber: 2,
              weight: "50",
              reps: 10
            },
            {
              setNumber: 3,
              weight: "45",
              reps: 10
            }
          ]
        }
      ]
    }
  ]
};

const TEST_GYM_GOER_3 = {
  id: '5a7ad0c00b1a3545ed5ed3f7',
  email: 'alex@bandisch.com',
  trainingSessions: [
    {
      sessionDate: dateYesterday,
      sessionType: 'chest',
      exercises: [
        {
          name: "bench press",
          sets: [
            {
              setNumber: 1,
              weight: "60",
              reps: 12
            },
            {
              setNumber: 2,
              weight: "60",
              reps: 10
            },
            {
              setNumber: 3,
              weight: "60",
              reps: 11
            }
          ]
        },
        {
          name: "dips",
          sets: [
            {
              setNumber: 1,
              weight: "body weight",
              reps: 11
            },
            {
              setNumber: 2,
              weight: "body weight",
              reps: 12
            },
            {
              setNumber: 3,
              weight: "body weight",
              reps: 11
            }
          ]
        },
        {
          name: "inclined bench",
          sets: [
            {
              setNumber: 1,
              weight: "45",
              reps: 10
            },
            {
              setNumber: 2,
              weight: "50",
              reps: 10
            },
            {
              setNumber: 3,
              weight: "45",
              reps: 10
            }
          ]
        }
      ]
    }
  ]
};

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

describe('# GymGoerModelMethods', function () {
  describe('# GymGoerModelMethods.getSessionForToday', function () {
    it('should return the training session for today', function () {
      const result = GymGoerModelMethods.getSessionForToday('chest', TEST_GYM_GOER);
      expect(result).to.be.an.instanceOf(Object);
      expect(result).to.have.keys(['exercises', 'sessionDate', 'sessionType']);
      expect(result.sessionType).to.be.equal('chest');
    });
    it('should return undefined if it cannot find the session for today', function () {
      const result = GymGoerModelMethods.getSessionForToday('legs', TEST_GYM_GOER);
      expect(result).to.be.equal(undefined);
    });
  });
  describe('# GymGoerModelMethods.hasExistingTrainingSessionToday', function () {
    it('should return true if there is an existing training session for today', function () {
      const result = GymGoerModelMethods.hasExistingTrainingSessionToday('chest', TEST_GYM_GOER);
      expect(result).to.be.equal(true);
    });
    it('should return false if there is no existing training session for today', function () {
      const result = GymGoerModelMethods.hasExistingTrainingSessionToday('chest', TEST_GYM_GOER_3);
      expect(result).to.be.equal(false);
    });
  });
  describe('# GymGoerModelMethods.findBestSet', function () {
    it('should return an object that has the best reps and weight out of the set, where weight is numeric', function () {
      const result = GymGoerModelMethods.findBestSet(TEST_SETS_NUMERIC);
      expect(result).to.be.an.instanceOf(Object);
      expect(result.weight).to.be.equal("110");
      expect(result.reps).to.be.equal("12");
    });
    it('should return an object that has the best reps and weight out of the set, where weight is a string', function () {
      const result = GymGoerModelMethods.findBestSet(TEST_SETS_STRING);
      expect(result).to.be.an.instanceOf(Object);
      expect(result.weight).to.be.equal("body weight");
      expect(result.reps).to.be.equal("12");
    });
  });
  describe('# GymGoerModelMethods.findPreviousTrainingSessionWithExercises', function () {
    it('should return the previous training session where there is one', function () {
      const result = GymGoerModelMethods.findPreviousTrainingSessionWithExercises('chest', TEST_GYM_GOER_2);
      const today = new Date().toISOString().split('T')[0];
      const resultSessionDate = new Date(result.sessionDate).toISOString().split('T')[0];
      expect(resultSessionDate).to.not.equal(today);
      expect(result).to.be.a('object');
      expect(result).to.have.keys(['sessionType', 'sessionDate', 'exercises']);
      expect(result.exercises.length).to.be.at.least(1);
    });
    it('should return undefined where there is no previous training session with exercises', function () {
      const result = GymGoerModelMethods.findPreviousTrainingSessionWithExercises('legs', TEST_GYM_GOER_2);
      expect(result).to.be.equal(undefined);
    });
  });
});