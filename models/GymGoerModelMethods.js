const GymGoerModelMethods = {
  getSessionForToday(sessionType, gymGoer = this) {
    return gymGoer.trainingSessions.find(session => {
      const trainingDate = new Date(session.sessionDate).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return session.sessionType === sessionType && trainingDate === today;
    });
  },
  hasExistingTrainingSessionToday(sessionType, gymGoer = this) {
    return this.getSessionForToday(sessionType, gymGoer) !== undefined;
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
        sessionID: trainingSession._id,
        exercises: trainingSession.exercises.map(exercise => ({sets: exercise.sets, name: exercise.name})),
        sessionDate: trainingSession.sessionDate,
        sessionType: trainingSession.sessionType
      }))
    };
  },
  findPreviousTrainingSessionWithExercises(sessionType, gymGoer = this) {
    const today = new Date().toISOString().split('T')[0];
    return gymGoer.trainingSessions
      .reduce((sessions, current) => {
        const trainingDate = new Date(current.sessionDate).toISOString().split('T')[0];
        if (current.exercises.length &&
            current.sessionType === sessionType &&
            trainingDate !== today) {
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
  },
  getLastBestSet(sets, setSessionDate) {
    const bestSet = this.findBestSet(sets);
    if (bestSet !== undefined) {
      return {
        sessionDate: setSessionDate,
        weight: bestSet.weight,
        reps: bestSet.reps
      };
    }
    return {};
  }
};

module.exports = GymGoerModelMethods;