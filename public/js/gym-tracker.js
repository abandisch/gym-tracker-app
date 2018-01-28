const State = {
  displayHomePage: false,
  render() {
    if (this.displayHomePage) {
      const main = $('main');
      const homePageIntroHtml = HomePage.render({template: HomePage.introText});
      const homePageLoginHtml = HomePage.render({template: HomePage.loginForm, onSubmitForm: EventHandler.onLoginFormSubmit});
      main.html(homePageIntroHtml);
      main.append(homePageLoginHtml);
      this.displayHomePage = false;
    }
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
    window.location.href = 'training-session/select-session/';
  }
};

const GymTracker = {
  showStartPage() {
    State.displayHomePage = true;
    State.render();
  }
};

$(GymTracker.showStartPage());