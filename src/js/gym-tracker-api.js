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
  getCurrentGymGoer() {
    return MOCK_TRAINING_SESSION_DATA.gymgoers.find(gGoer => gGoer.email === JSON.parse(getCookie(COOKIE_NAME)).email);
  },
  getTodaysSession(trainingSessionType) {
    return this.getCurrentGymGoer().trainingSessions.find(session => {
      const trainingDate = new Date(Number.parseInt(session.sessionDate)).toLocaleString().split(',').splice(0, 1)[0];
      const today = new Date().toLocaleString().split(',').splice(0, 1)[0];
      return session.sessionType === trainingSessionType && trainingDate === today;
    });
  },
  // hasDoneTrainingSessionToday(trainingSessionType) {
  //   return this.getTodaysSession(trainingSessionType) !== undefined;
  // },
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
      setTimeout(() => {

        const isExistingExercise = this.getTodaysSession(trainingSession).exercises.find(exercise => exercise.name === exerciseName) !== undefined;
        if (!isExistingExercise) {
          this.getTodaysSession(trainingSession).exercises.push({name: exerciseName, sets: []});
        }
        console.log(this.getTodaysSession(trainingSession).exercises);
        resolve({
          created: true
        });
      }, 1);
    });
  },
  initTrainingSession(trainingSession) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'gym-tracker/init-training-session',
        data: JSON.stringify({sessionType: trainingSession}),
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      }).done(lastTrainingSessionExercises => {
        resolve(lastTrainingSessionExercises);
      }).fail(() => {
        reject({error: 'Error initialising training session'});
      });
    });
  },
  // Get all training session data
  // Include JWT in request Authorization header to identify the user
  // - /training-session/<training session type>, e.g. /training-session/chest
  getTrainingSessionData(trainingSession) {
    $.getJSON(GYM_TRACKER_API_URL, (data) => {
      console.log(data);
    })
  },
  // Get only the last training session data
  // Include JWT in request Authorization header to identify the user
  // - /training-session/<training session type>/last, e.g. /training-session/chest/last

};
