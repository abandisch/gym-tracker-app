const State = {
  displayHomePage: false,
  displaySelectTrainingSessionPage: false,
  render() {
    if (this.displayHomePage) {
      const main = $('main');
      const pageTextHtml = HomePage.render({template: HomePage.introText});
      const homePageLoginHtml = HomePage.render({template: HomePage.loginForm, onSubmitForm: EventHandler.onLoginFormSubmit});
      main.html(pageTextHtml);
      main.append(homePageLoginHtml);
      this.displayHomePage = false;
    }

    if (this.displaySelectTrainingSessionPage) {
      const main = $('main');
      const pageTextHtml = TrainingSession.render({template: TrainingSession.introText});
      const selectTrainingSessionHtml = TrainingSession.render({template: TrainingSession.selectTrainingSessionForm, onSubmitForm: EventHandler.onSelectTrainingFormSubmit});
      main.html(pageTextHtml);
      main.append(selectTrainingSessionHtml);
      this.displaySelectTrainingSessionPage = false;
    }
  }
};

const TrainingSession = {
  introText() {
    return `
      <h2 class="heading-select-session">Select your training session for today</h2>
    `;
  },
  selectTrainingSessionForm() {
    return `<form role="form" id="select-training-session-form">
              <button class="btn-block btn-blue"><i class="fa fa-user"></i> CHEST <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-pink"><i class="fa fa-hand-grab-o"></i> ARMS <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-teal"><i class="fa fa-male"></i> LEGS <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-orange"><i class="fa fa-heart"></i> BACK <span><i class="fa fa-angle-right"></i></span></button>
            </form>`;
  },
  render(props) {
    const templateHtml= props.template;
    if (props.onSubmitForm) {
      $(templateHtml).on('submit', props.onSubmitForm);
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
  loginForm() {
    return `<form role="form" id="login-form">
              <label for="emailAddress">Enter your email address to get started:</label>
              <input type="email" id="emailAddress" name="emailAddress" placeholder="Your Email Address" required>
              <button class="btn btn-success"><i class="fa fa-play"></i> Start Your Training Session</button>
            </form>`;
  },
  render(props) {
    const templateHtml= props.template;
    if (props.onSubmitForm) {
      $(templateHtml).on('submit', props.onSubmitForm);
    }
    return templateHtml;
  }
};

const EventHandler = {
  onLoginFormSubmit: function (event) {
    event.preventDefault();
    //window.location.href = 'training-session/select-session/';
    GymTracker.showSelectTrainingSessionPage();
  },
  onSelectTrainingFormSubmit: function (event) {
    event.preventDefault();
  }
};

const GymTracker = {
  showStartPage() {
    State.displayHomePage = true;
    State.render();
  },
  showSelectTrainingSessionPage() {
    State.displaySelectTrainingSessionPage = true;
    State.render();
  }
};

$(GymTracker.showStartPage());