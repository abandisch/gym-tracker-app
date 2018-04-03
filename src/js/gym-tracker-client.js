import {State} from "./gym-tracker-state";
const $ = require("jquery");

const GymTrackerClient = {
  showStartPage() {
    State.displayHomePage = true;
    State.render();
  },
  showSelectTrainingSessionPage() {
    State.displaySelectTrainingSessionPage = true;
    State.render();
  },
  showEmptyTrainingSessionPage() {
    State.displayEmptyTrainingSessionPage = true;
    State.render();
  },
  showTrainingSessionPage() {
    State.displayTrainingSessionPage = true;
    State.render();
  },
  showExerciseHistoryPage() {
    State.displayExerciseHistoryPage = true;
    State.render();
  }
};

$(GymTrackerClient.showStartPage());

export { GymTrackerClient };