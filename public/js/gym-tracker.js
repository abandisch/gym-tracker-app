const GYM_TRACKER_API_URL = `/resources/mock-data`;

const State = {
  displayHomePage: false,
  displaySelectTrainingSessionPage: false,
  displayEmptyTrainingSessionPage: false,
  trainingSessionType: '',
  trainingSessionIcons: [
    {exercise: 'chest', icon: 'fa-user'},
    {exercise: 'arms', icon: 'fa-hand-grab-o'},
    {exercise: 'legs', icon: 'fa-male'},
    {exercise: 'back', icon: 'fa-heart'}
  ],
  previousExercises: [],
  render() {
    const main = $('main');

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

    if (this.displayEmptyTrainingSessionPage) {
      const sessionDetails = {
        sessionIcon: this.trainingSessionIcons.find(x => x.exercise === this.trainingSessionType).icon,
        sessionType: this.trainingSessionType,
        sessionDate: new Date().getTime()
      };
      const pageHeadingHtml = TrainingSessionPage.render({ template: TrainingSessionPage.sessionHeading, session: sessionDetails });
      const formsContainer = $('<div class="no-previous-data"></div>');
      const changeSessionForm = TrainingSessionPage.render({ template: TrainingSessionPage.changeSessionForm, onSubmitForm: EventHandler.onChangeSessionFormSubmit });
      const addExercisesForm = TrainingSessionPage.render({ template: TrainingSessionPage.addExerciseBigButtonForm, session: sessionDetails, onSubmitForm: EventHandler.onAddExerciseFormSubmit });
      main.html(pageHeadingHtml);
      formsContainer.append(changeSessionForm);
      formsContainer.append(addExercisesForm);
      main.append(formsContainer);
      this.displayEmptyTrainingSessionPage = false;
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
  addExerciseBigButtonForm(session) {
    return `<form role="form" id="add-exercise-form">
              <p>No previous data - this is the first time you're tracking ${session.sessionType}. Add a new exercise to begin.</p>
              <button id="addBigExerciseButton" class="btn btn-big-round btn-green"><i class="fa fa-plus" aria-hidden="true"></i></button>
              <label for="addBigExerciseButton">Add a new Exercise</label>
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
        if (result.isAuth) {
          GymTrackerClient.showSelectTrainingSessionPage();
        }
      })
      .catch(err => {
        console.log('error:', err);
      });
  },
  onSelectTrainingSessionFormSubmit: function (event) {
    event.preventDefault();
    // get exercises from server here, if empty, display the empty training session page, else
    // display the training session page with the previous exercises on it
    GymTrackerClient.showEmptyTrainingSessionPage($(event.currentTarget).data('session'));
  },
  onChangeSessionFormSubmit: function (event) {
    event.preventDefault();
    GymTrackerClient.showSelectTrainingSessionPage();
  },
  onAddExerciseFormSubmit: function (event) {
    event.preventDefault();
    console.log('show modal to add new exercise');
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
  showEmptyTrainingSessionPage(trainingSession) {
    State.trainingSessionType = trainingSession;
    State.displayEmptyTrainingSessionPage = true;
    State.render();
  }
};

const GymTrackerAPI = {
  authenticate(emailAddress) {
    // talk to server and authenticate
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhbGV4QGJhbmRpc2NoLmNvbSJ9.Kt3jE6DLqzqSU8lDC3heeqhLfBfbMV8GOdefU2blZqQ';
        resolve({
          isAuth: true,
          email: 'alex@bandisch'
        });
      }, 1);
    });
  },
  // Get all training session data
  // Include JWT in request Authorization header to identify the user
  // - /training-session/<training session type>, e.g. /training-session/chest
  getTrainingSessionData(trainingSession) {
    $.getJSON(GYM_TRACKER_API_URL, (data) => {
      console.log(data);
    })
  },
  // Get only the last training session data
  // Include JWT in request Authorization header to identify the user
  // - /training-session/<training session type>/last, e.g. /training-session/chest/last

};

$(GymTrackerClient.showStartPage());