import { TrainingSessionPage, SelectTrainingSessionPage, HomePage } from './gym-tracker-pages';
import {EventHandler} from './gym-tracker-events';
const $ = require("jquery");

const State = {
  displayHomePage: false,
  displaySelectTrainingSessionPage: false,
  displayEmptyTrainingSessionPage: false,
  displayTrainingSessionPage: false,
  displayAddExerciseInputForm: false,
  trainingSessionType: '',
  trainingSessionIcons: [
    {exercise: 'chest', icon: 'fa-user'},
    {exercise: 'arms', icon: 'fa-hand-grab-o'},
    {exercise: 'legs', icon: 'fa-male'},
    {exercise: 'back', icon: 'fa-heart'}
  ],
  trainingSessionExercises: {},
  render() {
    const main = $('main');
    let sessionDetails = { };

    if (this.displayHomePage) {
      const pageTextHtml = HomePage.render({template: HomePage.introText});
      const homePageLoginHtml = HomePage.render({template: HomePage.loginForm, onSubmitForm: EventHandler.onLoginFormSubmit});
      main.html(pageTextHtml);
      main.append(homePageLoginHtml);
      this.displayHomePage = false;
    }

    if (this.displaySelectTrainingSessionPage) {
      const pageTextHtml = SelectTrainingSessionPage.render({template: SelectTrainingSessionPage.selectTrainingSessionIntroText});
      const selectTrainingSessionHtml = SelectTrainingSessionPage.render({template: SelectTrainingSessionPage.selectTrainingSessionForm, onSubmitForm: EventHandler.onSelectTrainingSessionFormSubmit});
      main.html(pageTextHtml);
      main.append(selectTrainingSessionHtml);
      this.displaySelectTrainingSessionPage = false;
    }

    if (this.displayEmptyTrainingSessionPage || this.displayTrainingSessionPage) {
      sessionDetails = {
        sessionIcon: this.trainingSessionIcons.find(x => x.exercise === this.trainingSessionType).icon,
        sessionType: this.trainingSessionType,
        sessionDate: new Date().getTime()
      };
    }

    if (this.displayEmptyTrainingSessionPage) {
      const pageHeadingHtml = TrainingSessionPage.render({ template: TrainingSessionPage.sessionHeading, session: sessionDetails });
      const formsContainer = $('<div class="no-previous-data"></div>');
      const changeSessionForm = TrainingSessionPage.render({ template: TrainingSessionPage.changeSessionForm, onSubmitForm: EventHandler.onChangeSessionFormSubmit });
      const noPreviousDataNote = TrainingSessionPage.render({ template: TrainingSessionPage.noPreviousDataNote, session: sessionDetails });
      let addExercisesForm;
      if (this.displayAddExerciseInputForm) { // show the form with input field
        addExercisesForm = TrainingSessionPage.render({ template: TrainingSessionPage.addExerciseInputForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseInputFormSubmit });
      } else { // just show the big button form
        addExercisesForm = TrainingSessionPage.render({ template: TrainingSessionPage.addExerciseBigButtonForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseBigButtonFormSubmit });
      }
      main.html(pageHeadingHtml);
      formsContainer.append(changeSessionForm);
      formsContainer.append(noPreviousDataNote);
      formsContainer.append(addExercisesForm);
      main.append(formsContainer);
      this.displayEmptyTrainingSessionPage = false;
      this.displayAddExerciseInputForm = false;
    }

    if (this.displayTrainingSessionPage) {
      const pageHeadingHtml = TrainingSessionPage.render({ template: TrainingSessionPage.sessionHeading, session: sessionDetails });

      const formsContainer = $('<div class="exercise-data"></div>');
      const changeSessionForm = TrainingSessionPage.render({ template: TrainingSessionPage.changeSessionForm, onSubmitForm: EventHandler.onChangeSessionFormSubmit });
      formsContainer.append(changeSessionForm);

      if (this.displayAddExerciseInputForm) { // show the form with input field and cancel button
        const cancelAddExerciseButtonForm = TrainingSessionPage.render({ template: TrainingSessionPage.cancelAddExerciseSmallButtonForm, onSubmitForm: EventHandler.onCancelAddExerciseButtonFormSubmit  });
        const addExerciseInputForm = TrainingSessionPage.render({ template: TrainingSessionPage.addExerciseInputForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseInputFormSubmit });
        formsContainer.append(cancelAddExerciseButtonForm);
        formsContainer.append(addExerciseInputForm);
      } else { // just show the big button form
        const addExercisesForm = TrainingSessionPage.render({ template: TrainingSessionPage.addExerciseSmallButtonForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseSmallButtonFormSubmit });
        formsContainer.append(addExercisesForm);
      }
      const exercisesForm = TrainingSessionPage.render({ template: TrainingSessionPage.exercisesForm, session: State.trainingSessionExercises });
      formsContainer.append(exercisesForm);
      main.html(pageHeadingHtml);
      main.append(formsContainer);
      this.displayTrainingSessionPage = false;
      this.displayAddExerciseInputForm = false;
    }
  }
};

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
  }
};

$(GymTrackerClient.showStartPage());

export { State, GymTrackerClient }