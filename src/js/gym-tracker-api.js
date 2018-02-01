

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

export const GymTrackerAPI = {
  getCurrentGymGoer() {
    return MOCK_TRAINING_SESSION_DATA.gymgoers.find(gGoer => gGoer.email === JSON.parse(getCookie(COOKIE_NAME)).email);
  },
  hasDoneTrainingSessionToday(trainingSessionType) {
    return this.getCurrentGymGoer().trainingSessions.find(session => {
      const trainingDate = new Date(Number.parseInt(session.sessionDate)).toLocaleString().split(',').splice(0, 1)[0];
      const today = new Date().toLocaleString().split(',').splice(0, 1)[0];
      return session.sessionType === trainingSessionType && trainingDate === today;
    }) !== undefined;
  },
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

        const hasDoneSessionToday = this.hasDoneTrainingSessionToday(trainingSessionType);

        if (!hasDoneSessionToday) {
          const session = {
            exercises: [],
            sessionType: trainingSessionType,
            sessionDate: new Date().getTime()
          };
          this.getCurrentGymGoer().trainingSessions.push(session);
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
  findLastTrainingSession(sessionType) {
    return this.getCurrentGymGoer().trainingSessions
      .reduce((sessions, current) => {
        if (current.exercises.length && current.sessionType === sessionType) {
          sessions.push(current);
        }
        return sessions;
      }, [])
      .sort((a, b) => Number.parseInt(b.sessionDate) - Number.parseInt(a.sessionDate))[0];
  },
  findBestSet(sets) {
    sets
      .sort((setA, setB) => setB.reps - setA.reps) // sort by reps
      .sort((setA, setB) => { // sort by weight
        if (!Number.isNaN(Number.parseInt(setA.weight)) && setA.weight !== setB.weight) {
          return Number.parseInt(setB.weight) - Number.parseInt(setA.weight);
        } else {
          return 0;
        }
      });
    return sets[0];
  },
  getLastTrainingSessionExercises(trainingSession) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lastSession = this.findLastTrainingSession(trainingSession.sessionType);

        const lastSessionExercises = {
          sessionType: trainingSession.sessionType,
          exercises: []
        };

        if (lastSession !== undefined) {
          lastSessionExercises.exercises =
            lastSession.exercises
              .map(exercise => ({
                sessionDate: Number.parseInt(lastSession.sessionDate),
                name: exercise.name,
                bestSet: this.findBestSet(exercise.sets)
              }));
        }

        resolve(lastSessionExercises);

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
