const GymGoerModelMethods = {
  getTodaysSession(sessionType, gymGoer = this) {
    return gymGoer.trainingSessions.find(session => {
      const trainingDate = new Date(session.sessionDate).toLocaleString().split(',').splice(0, 1)[0];
      const today = new Date().toLocaleString().split(',').splice(0, 1)[0];
      return session.sessionType === sessionType && trainingDate === today;
    });
  },
  hasDoneTrainingSessionToday(sessionType, gymGoer = this) {
    return this.getTodaysSession(sessionType, gymGoer) !== undefined;
  },
  serialize() {
    return {
      id: this._id,
      email: this.email
    };
  },
  serializeAll() {
    return {
      id: this._id,
      email: this.email,
      trainingSessions: this.trainingSessions.map(trainingSession => ({
        exercises: trainingSession.exercises,
        sessionDate: trainingSession.sessionDate,
        sessionType: trainingSession.sessionType
      }))
    };
  },
  findPreviousTrainingSessionWithExercises(sessionType, gymGoer = this) {
    return gymGoer.trainingSessions
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
        if (Number.isNaN(Number.parseInt(setA.weight))) {
          return 0;
        }
        return Number.parseInt(setB.weight) - Number.parseInt(setA.weight);
      });
    return sets[0];
  }
};

module.exports = GymGoerModelMethods;