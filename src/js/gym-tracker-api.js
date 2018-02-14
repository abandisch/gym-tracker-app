import { setCookie, getCookie } from "./cookies";
const $ = require("jquery");

const MOCK_TRAINING_SESSION_DATA = {
  "gymgoers": [
    {
      "id": "4c4ed66f-baf4-42c2-ac69-3e238db0d5d6",
      "email": "alex@bandisch.com",
      "trainingSessions": [
        {
          "sessionType": "chest",
          "sessionDate": "1517331036931",
          "exercises": [
            {
              "name": "bench press",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "60",
                  "reps": "12"
                },
                {
                  "setNumber": "2",
                  "weight": "60",
                  "reps": "10"
                },
                {
                  "setNumber": "3",
                  "weight": "60",
                  "reps": "11"
                }
              ]
            },
            {
              "name": "dips",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "body weight",
                  "reps": "11"
                },
                {
                  "setNumber": "2",
                  "weight": "body weight",
                  "reps": "12"
                },
                {
                  "setNumber": "3",
                  "weight": "body weight",
                  "reps": "11"
                }
              ]
            },
            {
              "name": "inclined bench",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "45",
                  "reps": "10"
                },
                {
                  "setNumber": "2",
                  "weight": "50",
                  "reps": "10"
                },
                {
                  "setNumber": "3",
                  "weight": "45",
                  "reps": "10"
                }
              ]
            }
          ]
        },
        {
          "sessionType": "legs",
          "sessionDate": "1517158236931",
          "exercises": [
            {
              "name": "leg press",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "110",
                  "reps": "12"
                },
                {
                  "setNumber": "2",
                  "weight": "110",
                  "reps": "11"
                },
                {
                  "setNumber": "3",
                  "weight": "110",
                  "reps": "12"
                }
              ]
            },
            {
              "name": "barbell squat",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "100",
                  "reps": "10"
                },
                {
                  "setNumber": "2",
                  "weight": "100",
                  "reps": "10"
                },
                {
                  "setNumber": "3",
                  "weight": "100",
                  "reps": "9"
                }
              ]
            },
            {
              "name": "split squats",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "12",
                  "reps": "10"
                },
                {
                  "setNumber": "2",
                  "weight": "12",
                  "reps": "10"
                },
                {
                  "setNumber": "3",
                  "weight": "12",
                  "reps": "10"
                }
              ]
            }
          ]
        },
        {
          "sessionType": "back",
          "sessionDate": "1517158394973",
          "exercises": []
        },
        {
          "sessionType": "chest",
          "sessionDate": "1516726236931",
          "exercises": [
            {
              "name": "bench press",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "55",
                  "reps": "14"
                },
                {
                  "setNumber": "2",
                  "weight": "55",
                  "reps": "13"
                },
                {
                  "setNumber": "3",
                  "weight": "55",
                  "reps": "13"
                }
              ]
            },
            {
              "name": "dips",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "body weight",
                  "reps": "14"
                },
                {
                  "setNumber": "2",
                  "weight": "body weight",
                  "reps": "14"
                },
                {
                  "setNumber": "3",
                  "weight": "body weight",
                  "reps": "13"
                }
              ]
            },
            {
              "name": "inclined bench",
              "sets": [
                {
                  "setNumber": "1",
                  "weight": "40",
                  "reps": "13"
                },
                {
                  "setNumber": "2",
                  "weight": "40",
                  "reps": "13"
                },
                {
                  "setNumber": "3",
                  "weight": "40",
                  "reps": "12"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const COOKIE_NAME = 'gymGoer';

export const GymTrackerAPI = {
  authenticate(emailAddress) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'gym-tracker/login',
        data: JSON.stringify({email: emailAddress, password: 'null'}),
        contentType: 'application/json',
        method: 'POST',
        dataType: 'json'
      }).done(result => {
        const cookieData = {
          email: emailAddress,
          jwt_token: result.authToken
        };
        setCookie(COOKIE_NAME, JSON.stringify(cookieData));
        resolve({email: emailAddress});
      }).fail(() => {
        reject({error: 'Error logging in'});
      })
    });
  },
  addExercise(trainingSession, exerciseName) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'gym-tracker/add-exercise',
        data: JSON.stringify({sessionType: trainingSession, exerciseName: exerciseName}),
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      }).done(updatedSessionExercises => {
        resolve(updatedSessionExercises);
      }).fail(() => {
        reject({error: 'Error adding exercise to training session'});
      });
    });
  },
  initGymGoerTrainingSession(trainingSession) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'gym-tracker/init-training-session',
        data: JSON.stringify({sessionType: trainingSession}),
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      }).done(initialisedTrainingSession => {
        resolve(initialisedTrainingSession);
      }).fail(() => {
        reject({error: 'Error initialising training session'});
      });
    });
  },
  addSetToExercise(trainingSession, nameOfExercise, newSetForExercise) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'gym-tracker/add-exercise-set',
        data: JSON.stringify({sessionType: trainingSession, exerciseName: nameOfExercise, newSet: newSetForExercise}),
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      }).done(updatedSessionExercises => resolve(updatedSessionExercises))
        .fail(() => {
        reject({error: 'Error adding set to exercise for training session'});
      });
    });
  }
};
