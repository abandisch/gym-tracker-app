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
      let addExercisesForm;
      if (this.displayAddExerciseInputForm) { // show the form with input field
        addExercisesForm = TrainingSessionPage.render({ template: TrainingSessionPage.addExerciseInputForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseInputFormSubmit });
      } else { // just show the big button form
        addExercisesForm = TrainingSessionPage.render({ template: TrainingSessionPage.addExerciseBigButtonForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseBigButtonFormSubmit });
      }
      main.html(pageHeadingHtml);
      formsContainer.append(changeSessionForm);
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
        addExercisesFormProps = { template: TrainingSessionPage.addExerciseSmallButtonForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseBigButtonFormSubmit };
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

const TrainingSessionPage = {
  sessionHeading(session) {
    let trainingDate = new Date(session.sessionDate).toLocaleString().split(',').splice(0, 1)[0];
    return `<h2 class="training-session-type type-${session.sessionType}"><i class="fa ${session.sessionIcon}"></i> ${session.sessionType.toUpperCase()} - ${trainingDate}</h2>`;
  },
  changeSessionForm() {
    return `<form role="form" id="change-session-form">
              <button class="btn btn-grey btn-small"><i class="fa fa-undo" aria-hidden="true"></i> Change Session</button>
            </form>`;
  },
  addExerciseSmallButtonForm() {
    return `<form role="form" id="add-exercise-button-form">
              <button class="btn btn-green btn-small"><i class="fa fa-plus" aria-hidden="true"></i> Add Exercise</button>
            </form>`;
  },
  addExerciseBigButtonForm(session) {
    return `<form role="form" id="add-exercise-button-form">
              <p>No previous data - this is the first time you're tracking ${session.sessionType}. Add a new exercise to begin.</p>
              <button id="addBigExerciseButton" class="btn btn-big-round btn-green"><i class="fa fa-plus" aria-hidden="true"></i></button>
              <label for="addBigExerciseButton">Add a new Exercise</label>
            </form>`;
  },
  addExerciseInputForm(session) {
    return `<form role="form" id="add-exercise-input-form">
              <p>No previous data - this is the first time you're tracking ${session.sessionType}. Add a new exercise to begin.</p>
              <label for="exerciseName">Add a new exercise</label>
              <input type="text" id="exerciseName" name="exerciseName" placeholder="New exercise name">
              <button class="btn btn-green"><i class="fa fa-plus-square-o" aria-hidden="true"></i> Save New Exercise</button>
            </form>`;
  },
  exercisesLiElement(exercise) {
    let lastSessionDate = new Date(exercise.sessionDate).toLocaleString().split(',').splice(0, 1)[0];
    return `<li>
              <h3>${exercise.name.toUpperCase()}</h3>
              <div class="last-session-results">
                <p class="last-session-date">Last Session [${lastSessionDate}]</p>
                <p class="last-session-stats"><span class="stats-weight">Weight: ${exercise.bestSet.weight}</span> - <span class="stats-reps">Max Reps: ${exercise.bestSet.reps}</span></p>
              </div>
              <div class="set-table">
                <div class="table-row">
                  <div class="table-cell">Set #</div>
                  <div class="table-cell">Weight</div>
                  <div class="table-cell">Reps</div>
                </div>
                <div class="table-row">
                  <div class="table-cell"></div>
                  <div class="table-cell"></div>
                  <div class="table-cell"></div>
                </div>
              </div>
              <button class="btn btn-small btn-aqua"><i class="fa fa-plus-square-o"></i> Add Set</button>
            </li>`;
  },
  exercisesForm(session) {
    const liElements = session.exercises.map(exercise => TrainingSessionPage.exercisesLiElement(exercise)).join('');
    return `<form role="form" id="exercises-form">
              <ul class="exercise-list">
                ${liElements}
              </ul>
            </form>`;
  },
  render(props) {
    const template = props.template(props.session);
    if (props.onSubmitForm) {
      return $(template).on('submit', props.onSubmitForm);
    }
    return template;
  }
};

const SelectTrainingSessionPage = {
  selectTrainingSessionIntroText() {
    return `
      <h2 class="heading-select-session">Select your training session for today</h2>
    `;
  },
  selectTrainingSessionForm() {
    return `<form role="form" id="select-training-session-form">
              <button class="btn-block btn-blue" data-session="chest"><i class="fa fa-user"></i> CHEST <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-pink" data-session="arms"><i class="fa fa-hand-grab-o"></i> ARMS <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-teal" data-session="legs"><i class="fa fa-male"></i> LEGS <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-orange" data-session="back"><i class="fa fa-heart"></i> BACK <span><i class="fa fa-angle-right"></i></span></button>
            </form>`;
  },
  render(props) {
    let templateHtml = props.template(props.args);
    if (props.onSubmitForm) {
      return $(templateHtml).on('click', 'button', props.onSubmitForm);
    }
    return templateHtml;
  }
};

const HomePage = {
  introText() {
    return `
      <p>What this app does and how it's used at a high level ...</p>
      <p>Bacon ipsum dolor amet pastrami cow fatback chuck swine meatloaf. Pastrami spare ribs tri-tip, chicken t-bone hamburger corned beef sirloin shoulder turkey short loin filet mignon.</p>
      <p> Alcatra hamburger boudin jerky biltong pork chop tongue buffalo brisket chuck frankfurter tail. Tri-tip turducken pork, kielbasa brisket strip steak capicola beef buffalo leberkas alcatra ribeye shoulder t-bone. Rump bresaola pork belly ground round. </p>
    `;
  },
  loginForm: function() {
    return `<form role="form" id="login-form">
              <label for="emailAddress">Enter your email address to get started:</label>
              <input type="email" id="emailAddress" name="emailAddress" placeholder="Your Email Address" required>
              <button class="btn btn-green"><i class="fa fa-play"></i> Start Your Training Session</button>
            </form>`;
  },
  render(props) {
    const templateHtml= props.template();
    if (props.onSubmitForm) {
      return $(templateHtml).on('submit', props.onSubmitForm);
    } else {
      return templateHtml;
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
        State.trainingSessionType = trainingSession.session;
        return GymTrackerAPI.getPreviousTrainingSessionExercises(trainingSession);
      })
      .then(previousExercises => {
        if (previousExercises.exercises) { // if there are previous exercises, show previous exercises page
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



// $(() => {
//   State.trainingSessionType = 'chest';
//   GymTrackerClient.showTrainingSessionPage();
// });
$(GymTrackerClient.showStartPage());