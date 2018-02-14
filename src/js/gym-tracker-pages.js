const $ = require("jquery");

const TrainingSessionPage = {
  sessionHeading(session) {
    if (session === undefined) {
      return null;
    }
    let trainingDate = new Date(session.sessionDate).toLocaleString().split(',').splice(0, 1)[0];
    return `<h2 class="training-session-type type-${session.sessionType}"><i class="fa ${session.sessionIcon}"></i> ${session.sessionType.toUpperCase()} - ${trainingDate}</h2>`;
  },
  noPreviousDataNote(session) {
    if (session === undefined) {
      return null;
    }
    return `<p class="text-center">No previous data - this is the first time you're tracking ${session.sessionType}. Add a new exercise to begin.</p>`
  },
  changeSessionForm() {
    return `<form role="form" id="change-session-form">
              <button class="btn btn-grey btn-small"><i class="fa fa-undo" aria-hidden="true"></i> Change Session</button>
            </form>`;
  },
  cancelAddExerciseSmallButtonForm() {
    return `<form role="form" id="cancel-add-exercise-button-form">
              <button class="btn btn-orange btn-small"><i class="fa fa-ban" aria-hidden="true"></i> Cancel</button>
            </form>`;
  },
  addExerciseSmallButtonForm() {
    return `<form role="form" id="add-exercise-button-form">
              <button class="btn btn-green btn-small"><i class="fa fa-plus" aria-hidden="true"></i> Add Exercise</button>
            </form>`;
  },
  addExerciseBigButtonForm() {
    return `<form role="form" id="add-exercise-button-form">
              <button id="addBigExerciseButton" class="btn btn-big-round btn-green"><i class="fa fa-plus" aria-hidden="true"></i></button>
              <label for="addBigExerciseButton">Add a new Exercise</label>
            </form>`;
  },
  addExerciseInputForm() {
    return `<form role="form" id="add-exercise-input-form">
              <label for="exerciseName">Add a new exercise</label>
              <input type="text" id="exerciseName" name="exerciseName" placeholder="New exercise name">
              <button class="btn btn-green"><i class="fa fa-plus-square-o" aria-hidden="true"></i> Save New Exercise</button>
            </form>`;
  },
  getLastSessionResultsHTML(exercise) {
    let lastSessionResults = '<div class="last-session-results"><p class="last-session-date"></p><p class="last-session-stats">No stats from a previous session</p></div>';
    if (exercise.lastBestSet.weight !== undefined && exercise.lastBestSet.reps !== undefined) {
      const lastSessionDate = new Date(exercise.lastBestSet.sessionDate).toLocaleString().split(',').splice(0, 1)[0];
      lastSessionResults = `<div class="last-session-results">
                              <p class="last-session-date">Last Session [${lastSessionDate}]</p>
                              <p class="last-session-stats"><span class="stats-weight">Weight: ${exercise.lastBestSet.weight}</span> - <span class="stats-reps">Max Reps: ${exercise.lastBestSet.reps}</span></p>
                            </div>`;
    }
    return lastSessionResults;
  },
  getExerciseSetsHTML(exercise) {
    let exerciseSets = `<div class="table-row"><div class="table-cell"></div><div class="table-cell"></div><div class="table-cell"></div></div>`;
    if (exercise.sets.length > 0) {
      exerciseSets = exercise.sets.map(set => {
      return `<div class="table-row">  
                <div class="table-cell">${set.setNumber}</div>
                <div class="table-cell">${set.weight}</div>
                <div class="table-cell">${set.reps}</div>
              </div>`;
      });
    }
    return exerciseSets;
  },
  addExerciseSetFormInputHTML(exercise) {
    let html = `<button class="btn btn-small btn-aqua" data-exercise="${exercise.name}"><i class="fa fa-plus-square-o"></i> Add Set</button>`;
    if (exercise.displayAddSetInputForm) {
      html = `<div class="add-exercise-set">
                <div class="inline-form-input">
                  <label for="setWeight">Weight: </label>
                  <input type="text" id="setWeight" name="weight" placeholder="E.g. 10 or Body Weight">
                </div>
                <div class="inline-form-input">
                  <label for="setReps">Reps: </label>
                  <input type="text" id="setReps" name="reps" placeholder="Number of reps">
                </div>                 
                  <button class="btn btn-small btn-green"><i class="fa fa-plus-square-o" aria-hidden="true" data-exercise-name="${exercise.name}"></i> Save New Set</button>
                  <button class="btn btn-small btn-orange"><i class="fa fa-ban" aria-hidden="true"></i> Cancel</button>
              </div>`;
    }
    return html;
  },
  exercisesLiElement(exercise) {
    const lastSessionResultsHTML = TrainingSessionPage.getLastSessionResultsHTML(exercise);

    let exerciseSetsHTML = TrainingSessionPage.getExerciseSetsHTML(exercise);
    if (Array.isArray(exerciseSetsHTML)) {
      exerciseSetsHTML = exerciseSetsHTML.join('');
    }

    const addSetFormInputHTML = TrainingSessionPage.addExerciseSetFormInputHTML(exercise);

    return `<li>
              <h3>${exercise.name.toUpperCase()}</h3>
              ${lastSessionResultsHTML}
              <div class="set-table">
                <div class="table-row">
                  <div class="table-cell">Set #</div>
                  <div class="table-cell">Weight</div>
                  <div class="table-cell">Reps</div>
                </div>
                ${exerciseSetsHTML}
              </div>
              ${addSetFormInputHTML}
            </li>`;
  },
  exercisesForm(exercises) {
    const liElements = exercises.map(exercise => TrainingSessionPage.exercisesLiElement(exercise)).join('');
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

export { TrainingSessionPage, SelectTrainingSessionPage, HomePage };