const {validateParameters, toReadableISODate} = require('./GymGoerUtils');
const GymGoerExercisesStatics = {
  findExerciseName(exerciseId) {
    return this.find
  },
  findExerciseHistory(gymGoerId, exerciseId) {
    return this
      .findById({_id: exerciseId}, {exerciseName: 1, gymGoerId: 1})
      .then(res => {
        return this
          .find( { $and: [{exerciseName: res.exerciseName}, {gymGoerId: res.gymGoerId}] })  
      });
  },
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
  findExercisesByDate(gymGoerId, sessionType, sessionISODate) {
    const dateStart = new Date(sessionISODate).setHours(0,0,0,0);
    const dateEnd = new Date(sessionISODate).setHours(23,59,59,0);

    return this.find({
        gymGoerId: gymGoerId,
        sessionType: sessionType,
        sessionDate: { $gte: dateStart, $lte: dateEnd }
      })
      .sort({sessionDate: -1});
  },
  findExercisesForToday(gymGoerId, sessionType) {
    const dateISOToday = new Date().toISOString().slice(0, 10);
    return this.findExercisesByDate(gymGoerId, sessionType, dateISOToday);
  },
  hasExistingTrainingSessionToday(sessionType, gymGoer) {
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