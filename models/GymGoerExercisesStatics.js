const {validateParameters, toReadableISODate} = require('./GymGoerUtils');
const GymGoerExercisesStatics = {
  extractExercisesFromLastSession(previousExercises) {
    // previousExercises[0] should contain the previous training session
    let exercisesArray = [];
    if (previousExercises !== null && previousExercises.length > 0) {
      const previousExerciseDate = toReadableISODate(previousExercises[0].sessionDate);
      // any exercises with the session date === previousSessionDate, will be exercises from the previous session
      exercisesArray = previousExercises.reduce((exercisesAccumulator, currentExercise) => {
        if (toReadableISODate(currentExercise.sessionDate) === previousExerciseDate) {
          exercisesAccumulator.push(currentExercise);
        }
        return exercisesAccumulator;
      }, []);
    }
    return exercisesArray;
  },
  findExercisesForToday(gymGoerId, sessionType) {
    const startToday = new Date().setHours(0,0,0,0);
    const endToday = new Date().setHours(23,59,59,0);

    return this.find({
      gymGoerId: gymGoerId,
      sessionType: sessionType,
      sessionDate: { $gte: startToday, $lte: endToday }
    })
      .sort({sessionDate: -1});
  },
  hasExistingTrainingSessionToday(sessionType, gymGoer) {
    // return this.getSessionForToday(sessionType, gymGoer) !== undefined;
    const startToday = new Date().setHours(0,0,0,0);
    const endToday = new Date().setHours(23,59,59,0);
    return this.count({
      gymGoerId: gymGoer.id,
      sessionType: sessionType,
      sessionDate: {$gte: startToday, $lte: endToday }
    })
      .then(count => count > 0);
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

module.exports = GymGoerExercisesStatics;