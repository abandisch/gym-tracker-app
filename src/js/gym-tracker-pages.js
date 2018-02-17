const $ = require("jquery");

const TrainingPageStaticContent = {
  noPreviousDataNote(session) {
    if (session === undefined) {
      return '';
    }
    return `<p class="text-center">No previous data - this is the first time you're tracking ${session.sessionType}. Add a new exercise to begin.</p>`
  },
  render(props) {
    return props.template(props.session);
  }
};

const TrainingPageHeadingSection = {
  html(session
  ) {
    if (session.sessionDate === undefined || session.sessionDate === undefined) {
      return '';
    }
    let trainingDate = new Date(session.sessionDate).toLocaleString().split(',').splice(0, 1)[0];
    return `<h2 class="training-session-type type-${session.sessionType}"><i class="fa ${session.sessionIcon}"></i> ${session.sessionType.toUpperCase()} - ${trainingDate}</h2>`;
  },
  render(props) {
    if (props === undefined) {
      return '';
    }
    return this.html(props.session);
  }
};

const TrainingPageChangeSessionSection = {
  html() {
    return `<form role="form" id="change-session-form">
              <button class="btn btn-change-session btn-small"><i class="fa fa-undo" aria-hidden="true"></i> Change Session</button>
            </form>`;
  },
  render(props) {
    const template = this.html(props.session);
    if (props.onSubmitForm) {
      return $(template).on('submit', props.onSubmitForm);
    }
    return template;
  }
};

const TrainingPageAddExerciseSection = {
  cancelAddExerciseSmallButtonForm() {
    return `<form role="form" id="cancel-add-exercise-button-form">
              <button class="btn btn-small btn-cancel-add-exercise"><i class="fa fa-ban" aria-hidden="true"></i> Cancel</button>
            </form>`;
  },
  addExerciseSmallButtonForm() {
    return `<form role="form" id="add-exercise-button-form">
              <button class="btn btn-add-exercise btn-small"><i class="fa fa-plus" aria-hidden="true"></i> Add Exercise</button>
            </form>`;
  },
  addExerciseBigButtonForm() {
    return `<form role="form" id="add-exercise-button-form">
              <button id="addBigExerciseButton" class="btn btn-big-round btn-add-exercise"><i class="fa fa-plus" aria-hidden="true"></i></button>
              <label for="addBigExerciseButton">Add a new Exercise</label>
            </form>`;
  },
  addExerciseInputForm() {
    return `<form role="form" id="add-exercise-input-form">
              <label for="exerciseName">Add a new exercise</label>
              <input type="text" id="exerciseName" name="exerciseName" placeholder="New exercise name">
              <button class="btn btn-add-exercise"><i class="fa fa-plus-square-o" aria-hidden="true"></i> Save New Exercise</button>
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

const TrainingPageExerciseSetSection = {
  createExerciseSetsHTML(exercise) {
    let exerciseSets = `<div class="table-row"><div class="table-cell"></div><div class="table-cell"></div><div class="table-cell"></div></div>`;
    if (exercise.sets.length > 0) {
      exerciseSets = exercise.sets.map(set => {
        return `<div class="table-row">  
                <div class="table-cell">${set.setNumber}</div>
                <div class="table-cell">${set.weight}</div>
                <div class="table-cell">${set.reps}</div>
              </div>`;
      }).join('');
    }
    return exerciseSets;
  },
  addExerciseSetButtonFormHTML(exercise, exerciseIndex) {
    return `<form role="form" data-exercise-index="${exerciseIndex}">
              <button class="btn btn-small btn-add-set" data-exercise="${exercise.name}"><i class="fa fa-plus-square-o"></i> Add Set</button>
            </form>`;
  },
  addExerciseSetInputFormHTML(exercise, exerciseIndex) {
    return `<form role="form" data-exercise-index="${exerciseIndex}">
              <div class="inline-form-input">
                <label for="setWeight">Weight: </label>
                <input type="text" id="setWeight" name="weight" placeholder="E.g. 10 or Body Weight" required>
              </div>
              <div class="inline-form-input">
                <label for="setReps">Reps: </label>
                <input type="number" id="setReps" name="reps" placeholder="Number of reps" required>
              </div> 
              <button class="btn btn-small btn-save-set">
                <i class="fa fa-plus-square-o" aria-hidden="true" data-exercise-name="${exercise.name}"></i> Save New Set
              </button>
            </form>`;
  },
  cancelAddExerciseSetButtonForm() {
    return `<form role="form">
              <button class="btn btn-small btn-cancel-add-set">
                <i class="fa fa-ban" aria-hidden="true"></i> Cancel
              </button>
            </form>`;
  },
  render(props) {
    const template = props.template(props.exercise, props.exerciseIndex);
    if (props.onSubmitForm) {
      // return $(template).on('click', 'button', props.onSubmitForm);
      return $(template).on('submit', props.onSubmitForm);
    }
    return template;
  }
};

const TrainingPageExerciseListSection = {
  createLastBestSetHTML(exercise) {
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
  exerciseListItemHTML(exercise) {
    const lastBestSetHTML = this.createLastBestSetHTML(exercise);
    const exerciseSetsHTML = TrainingPageExerciseSetSection.render({template: TrainingPageExerciseSetSection.createExerciseSetsHTML, exercise: exercise});
    return `<li>
              <h3>${exercise.name.toUpperCase()}</h3>
              ${lastBestSetHTML}
              <div class="set-table">
                <div class="table-row">
                  <div class="table-cell">Set #</div>
                  <div class="table-cell">Weight</div>
                  <div class="table-cell">Reps</div>
                </div>
                ${exerciseSetsHTML}
              </div>
              <div class="add-exercise-set"></div>
            </li>`;
  },
  exercisesList(exercises, onAddSetSubmitEvent, onSaveAddSetSubmitForm, onCancelAddSetSubmitForm) {
    let list = $.parseHTML('<ul class="exercise-list"></ul>');
    let addExerciseSetForm;
    let saveAddExerciseSetForm;
    let cancelAddExerciseSetForm;
    exercises.forEach((exercise, index) => {
      const liElement = $.parseHTML(this.exerciseListItemHTML(exercise));
      if (exercise.displayAddSetInputForm) {
        saveAddExerciseSetForm = TrainingPageExerciseSetSection.render({template: TrainingPageExerciseSetSection.addExerciseSetInputFormHTML, exercise: exercise, exerciseIndex: index, onSubmitForm: onSaveAddSetSubmitForm});
        cancelAddExerciseSetForm = TrainingPageExerciseSetSection.render({template: TrainingPageExerciseSetSection.cancelAddExerciseSetButtonForm, onSubmitForm: onCancelAddSetSubmitForm});
        exercise.displayAddSetInputForm = false; // Reset this to false, so it doesn't appear again
        $(liElement).find('.add-exercise-set').append(saveAddExerciseSetForm);
        $(liElement).find('.add-exercise-set').append(cancelAddExerciseSetForm);
      } else {
        addExerciseSetForm = TrainingPageExerciseSetSection.render({template: TrainingPageExerciseSetSection.addExerciseSetButtonFormHTML, exercise: exercise, exerciseIndex: index, onSubmitForm: onAddSetSubmitEvent});
        $(liElement).find('.add-exercise-set').append(addExerciseSetForm);
      }
      $(list).append(liElement);
    });
    /*const exerciseLiElements = exercises.map((exercise, exerciseIndex) => {
      const liElement = $.parseHTML(this.exerciseListItemHTML(exercise));
      const addExerciseSetForm = TrainingPageExerciseSetSection.render({template: TrainingPageExerciseSetSection.addExerciseSetForm, exercise: exercise, onSubmitForm: onAddSetSubmitEvent});
      $(liElement).find('.add-exercise-set').append(addExerciseSetForm);
      return liElement;
    });
    $(list).append(exerciseLiElements);*/
    return list;
  },
  render(props) {
    return this.exercisesList(props.exercises, props.onAddSetSubmitEvent, props.onSaveAddSetSubmitForm, props.onCancelAddSetSubmitForm)
  }
};

const SelectTrainingSessionSection = {
  selectTrainingSessionIntroText() {
    return `
      <h2 class="heading-select-session">Select your training session for today</h2>
    `;
  },
  selectTrainingSessionForm() {
    return `<form role="form" id="select-training-session-form">
              <button class="btn-block btn-chest" data-session="chest"><i class="fa fa-user"></i> CHEST <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-back" data-session="back"><i class="fa fa-heart"></i> BACK <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-arms" data-session="arms"><i class="fa fa-hand-grab-o"></i> ARMS <span><i class="fa fa-angle-right"></i></span></button>
              <button class="btn-block btn-legs" data-session="legs"><i class="fa fa-male"></i> LEGS <span><i class="fa fa-angle-right"></i></span></button>
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
      <section role="region" aria-labelledby="intro-heading" class="section-intro-text">
        <h2 id="intro-heading">What is the Gym Tracker?</h2>
        <p>The Gym Tracker App provides an easy interface to help you track your exercises, weights and reps at the gym.</p>
        <p>To start off, enter your email address. Then select the training session you're doing at the gym, then add your first exercise.</p>
        <p>Once you've done a set, record the weight in numbers (e.g. 40) or text (e.g. Body Weight), and the number of reps.</p>
        <p>Next time you do the same session, the app will preload the exercises for you and display your best set from the previous session.</p>
      </section>
    `;
  },
  loginForm: function() {
    return `<form role="form" id="login-form">
              <label for="emailAddress">Enter your email address to get started:</label>
              <input type="email" id="emailAddress" name="emailAddress" placeholder="Your Email Address" required>
              <button class="btn btn-start"><i class="fa fa-play"></i> Start Your Training Session</button>
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

export { SelectTrainingSessionSection, HomePage,
         TrainingPageHeadingSection, TrainingPageChangeSessionSection,
         TrainingPageAddExerciseSection, TrainingPageStaticContent,
         TrainingPageExerciseListSection };