import { GymTrackerAPI }  from './gym-tracker-api';
import { TrainingSessionPage, SelectTrainingSessionPage, HomePage } from './gym-tracker-pages';
const $ = require("jquery");

const GYM_TRACKER_API_URL = `/resources/mock-data`;

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
  previousTrainingSessionExercises: {},
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
      let addExercisesFormProps;
      if (this.displayAddExerciseInputForm) { // show the form with input field
        addExercisesFormProps = { template: TrainingSessionPage.addExerciseInputForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseInputFormSubmit };
      } else { // just show the big button form
        addExercisesFormProps = { template: TrainingSessionPage.addExerciseSmallButtonForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseSmallButtonFormSubmit };
      }
      const addExercisesForm = TrainingSessionPage.render(addExercisesFormProps);
      const exercisesForm = TrainingSessionPage.render({ template: TrainingSessionPage.exercisesForm, session: State.previousTrainingSessionExercises });
      formsContainer.append(changeSessionForm);
      formsContainer.append(addExercisesForm);
      formsContainer.append(exercisesForm);
      main.html(pageHeadingHtml);
      main.append(formsContainer);
      // main.append(formsContainer);
      this.displayTrainingSessionPage = false;
      this.displayAddExerciseInputForm = false;
    }
  }
};

const EventHandler = {
  onLoginFormSubmit: function (event) {
    event.preventDefault();
    const emailAddress = $(event.currentTarget).find('input[name=emailAddress]').val();
    GymTrackerAPI.authenticate(emailAddress)
      .then(result => {
        // show select training session page
        GymTrackerClient.showSelectTrainingSessionPage();
      })
      .catch(err => {
        console.log('error:', err);
      });
  },
  onSelectTrainingSessionFormSubmit: function (event) {
    event.preventDefault();
    // get exercises from server here, if empty, display the empty training session page, else
    // display the training session page with the previous exercises on it
    const selectedTrainingSession = $(event.currentTarget).data('session');
    GymTrackerAPI
      .addTrainingSession(selectedTrainingSession)
      .then((trainingSession) => {
        State.trainingSessionType = trainingSession.sessionType;
        return GymTrackerAPI.getLastTrainingSessionExercises(trainingSession);
      })
      .then(previousExercises => {
        if (previousExercises.exercises.length) { // if there are previous exercises, show previous exercises page
          State.previousTrainingSessionExercises = previousExercises;
          GymTrackerClient.showTrainingSessionPage();
        } else { // if there are no previous exercises, show empty training session page
          GymTrackerClient.showEmptyTrainingSessionPage();
        }
      });
  },
  onChangeSessionFormSubmit: function (event) {
    event.preventDefault();
    GymTrackerClient.showSelectTrainingSessionPage();
  },
  onAddExerciseBigButtonFormSubmit: function (event) {
    event.preventDefault();
    State.displayAddExerciseInputForm = true;
    GymTrackerClient.showEmptyTrainingSessionPage();
  },
  onAddExerciseSmallButtonFormSubmit: function (event) {
    event.preventDefault();
    State.displayAddExerciseInputForm = true;
    GymTrackerClient.showTrainingSessionPage();
  },
  onAddExerciseInputFormSubmit: function (event) {
    event.preventDefault();
    const exerciseName = $(event.currentTarget).find('input[name=exerciseName]').val();
    console.log('new exercise is:', exerciseName);
    GymTrackerAPI.addExercise(State.trainingSessionType, exerciseName)
      .then(() => {
        GymTrackerClient.showTrainingSessionPage();
      });
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