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
  }
};

module.exports = GymGoerModelUtils;