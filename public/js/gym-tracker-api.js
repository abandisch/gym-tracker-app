
const GymTrackerAPI = {
  authenticate(emailAddress) {
    // talk to server and authenticate
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhbGV4QGJhbmRpc2NoLmNvbSJ9.Kt3jE6DLqzqSU8lDC3heeqhLfBfbMV8GOdefU2blZqQ';
        resolve({
          isAuth: true,
          email: 'alex@bandisch'
        });
      }, 1);
    });
  },
  addTrainingSession(trainingSession) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let createdSession = trainingSession;
        resolve({
          created: true,
          session: createdSession
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
