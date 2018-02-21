import { SelectTrainingSessionSection, HomePage,
         TrainingPageHeadingSection, TrainingPageChangeSessionSection,
         TrainingPageAddExerciseSection, TrainingPageStaticContent,
         TrainingPageExerciseListSection } from './gym-tracker-pages';
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
  trainingSessionExercises: [],
  initTrainingSessionExercises(exercises) {
    this.trainingSessionExercises = exercises.map(ex => {
      ex.displayAddSetInputForm = false; // Include displayAddSetInputForm to the exercise object
      return ex;
    });
  },
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
      const selectTrainingSessionHtml = SelectTrainingSessionSection.render({template: SelectTrainingSessionSection.selectTrainingSessionForm, onSubmitForm: EventHandler.onSelectTrainingSessionFormSubmit});
      main.html(selectTrainingSessionHtml);
      // main.html(pageTextHtml);
      // main.append(selectTrainingSessionHtml);
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
      const pageHeadingHtml = TrainingPageHeadingSection.render({ session: sessionDetails });
      const formsContainer = $('<div class="no-previous-data"></div>');
      const changeSessionForm = TrainingPageChangeSessionSection.render({ onSubmitForm: EventHandler.onChangeSessionFormSubmit });
      const noPreviousDataNote = TrainingPageStaticContent.render({ template: TrainingPageStaticContent.noPreviousDataNote, session: sessionDetails });
      let addExercisesForm;
      if (this.displayAddExerciseInputForm) { // show the form with input field
        addExercisesForm = TrainingPageAddExerciseSection.render({ template: TrainingPageAddExerciseSection.addExerciseInputForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseInputFormSubmit });
      } else { // just show the big button form
        addExercisesForm = TrainingPageAddExerciseSection.render({ template: TrainingPageAddExerciseSection.addExerciseBigButtonForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseBigButtonFormSubmit });
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
      // Page Header: SessionType [Date]
      const pageHeadingHtml = TrainingPageHeadingSection.render({ session: sessionDetails });

      const exerciseDataContainer = $('<div class="exercise-data"></div>');

      // Change session type button/form
      const changeSessionForm = TrainingPageChangeSessionSection.render({ onSubmitForm: EventHandler.onChangeSessionFormSubmit });
      exerciseDataContainer.append(changeSessionForm);

      // Add exercise form
      if (this.displayAddExerciseInputForm) {
        const cancelAddExerciseButtonForm = TrainingPageAddExerciseSection.render({ template: TrainingPageAddExerciseSection.cancelAddExerciseSmallButtonForm, onSubmitForm: EventHandler.onCancelAddExerciseButtonFormSubmit  });
        const addExerciseInputForm = TrainingPageAddExerciseSection.render({ template: TrainingPageAddExerciseSection.addExerciseInputForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseInputFormSubmit });
        exerciseDataContainer.append(cancelAddExerciseButtonForm);
        exerciseDataContainer.append(addExerciseInputForm);
      } else {
        const addExercisesForm = TrainingPageAddExerciseSection.render({ template: TrainingPageAddExerciseSection.addExerciseSmallButtonForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseSmallButtonFormSubmit });
        exerciseDataContainer.append(addExercisesForm);
      }

      // Exercises list - also contains the individual add set forms for each exercise
      const exerciseListSection = TrainingPageExerciseListSection.render({exercises: State.trainingSessionExercises});
      exerciseDataContainer.append(exerciseListSection);

      // Build the page
      main.html(pageHeadingHtml);
      main.append(exerciseDataContainer);
      this.displayTrainingSessionPage = false;
      this.displayAddExerciseInputForm = false;
    }
  }
};

export { State }