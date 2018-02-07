const GymGoerModelUtils = {
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
  }
};

module.exports = GymGoerModelUtils;