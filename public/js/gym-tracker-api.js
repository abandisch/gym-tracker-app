const MOCK_TRAINING_SESSION_DATA = {
  "gymgoers": [
    {
      "id": "4c4ed66f-baf4-42c2-ac69-3e238db0d5d6",
      "email": "alex@bandisch.com",
      "trainingSessions": [
        {
          "id": "2d62be13-0820-45b4-b14f-60453a6a71eb",
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
                  "weight": "45",
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
          "id": "c1d7ec68-0382-4dfb-ae1b-1b6c8715f8db",
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
          "id": "27782519-5e78-4369-abba-90d6e46a9d12",
          "sessionType": "back",
          "sessionDate": "1517158394973",
          "exercises": []
        }
      ]
    }
  ]
};

function setCookie(cName, cValue, exDays) {
  let expires = '';
  if (exDays) {
    const d = new Date();
    d.setTime(d.getTime() + (exDays*24*60*60*1000));
    expires = "expires="+ d.toUTCString();
  }
  document.cookie = cName + "=" + cValue + ";" + expires + ";path=/";
}

function getCookie(name) {
  const regexp = new RegExp("(?:^" + name + "|;\s*"+ name + ")=(.*?)(?:;|$)", "g");
  const result = regexp.exec(document.cookie);
  return (result === null) ? null : result[1];
}

const COOKIE_NAME = 'gymGoer';

const GymTrackerAPI = {
  authenticate(emailAddress) {
    // talk to server and authenticate
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isExistingGymGoer = MOCK_TRAINING_SESSION_DATA.gymgoers.find(g => g.email === emailAddress) !== undefined;
        if (!isExistingGymGoer) {
          const newGymGoer = {
            email: emailAddress,
            trainingSessions: []
          };
          MOCK_TRAINING_SESSION_DATA.gymgoers.push(newGymGoer);
        }
        const cookieData = {
          email: emailAddress,
          jwt_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhbGV4QGJhbmRpc2NoLmNvbSJ9.Kt3jE6DLqzqSU8lDC3heeqhLfBfbMV8GOdefU2blZqQ'
        };
        // create cookie
        setCookie(COOKIE_NAME, JSON.stringify(cookieData));
        resolve({email: emailAddress});
      }, 1);
    });
  },
  addTrainingSession(trainingSessionType) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const gymGoer = MOCK_TRAINING_SESSION_DATA.gymgoers.find(gGoer => gGoer.email === JSON.parse(getCookie(COOKIE_NAME)).email);
        
        const hasTrainingSessionToday = gymGoer.trainingSessions.find(session => {
          const trainingDate = new Date(Number.parseInt(session.sessionDate)).toLocaleString().split(',').splice(0, 1)[0];
          const today = new Date().toLocaleString().split(',').splice(0, 1)[0];
          return session.sessionType === trainingSessionType && trainingDate === today;
        }) !== undefined;

        if (!hasTrainingSessionToday) {
          const session = {
            exercises: [],
            sessionType: trainingSessionType,
            sessionDate: new Date().getTime()
          };
          gymGoer.trainingSessions.push(session);
        }

        resolve({
          created: true,
          sessionType: trainingSessionType
        });
      }, 1);
    });
  },
  addExercise(trainingSession, exerciseName) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          created: true
        });
      }, 1);
    });
  },
  getPreviousTrainingSessionExercises(trainingSession) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (trainingSession.session === 'chest') { // only fake 'chest', leave others blank
          resolve({
            sessionType: "chest",
            exercises: [
              {
                sessionDate: 1517260770351,
                name: "bench press",
                bestSet: {
                  weight: "60kg",
                  reps: 12
                }
              },
              {
                sessionDate: 1517260770351,
                name: "dips",
                bestSet: {
                  weight: "body weight",
                  reps: 8
                }
              },
              {
                sessionDate: 1517260770351,
                name: "inclined bench",
                bestSet: {
                  weight: "45kg",
                  reps: 10
                }
              }
            ]
          })
        } else {
          resolve({
            previousTrainingSessionExercises: {}
          });
        }
      }, 1);
    })
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
