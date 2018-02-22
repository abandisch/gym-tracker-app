import {EventHandler} from "./gym-tracker-events";
import ExerciseSetInputForm from "./exercise-set-input-form";
import ExerciseSetsTable from "./exercise-sets-table";
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
    return `<form role="form" class="change-session-form">
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
    return `<form role="form" class="cancel-add-exercise-button-form">
              <button class="btn btn-small btn-cancel-add-exercise"><i class="fa fa-ban" aria-hidden="true"></i> Cancel</button>
            </form>`;
  },
  addExerciseSmallButtonForm() {
    return `<form role="form" class="add-exercise-button-form">
              <button class="btn btn-add-exercise btn-small"><i class="fa fa-plus" aria-hidden="true"></i> Add Exercise</button>
            </form>`;
  },
  addExerciseBigButtonForm() {
    return `<form role="form" class="add-exercise-button-form">
              <button id="addBigExerciseButton" class="btn btn-big-round btn-add-exercise"><i class="fa fa-plus" aria-hidden="true"></i></button>
              <label for="addBigExerciseButton">Add a new Exercise</label>
            </form>`;
  },
  addExerciseInputForm() {
    return `<form role="form" class="add-exercise-input-form">
              <label for="exerciseName">Add a new exercise</label>
              <input type="text" id="exerciseName" name="exerciseName" placeholder="New exercise name" required>
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

const TrainingPageExerciseListSection = {
  createLastBestSetHTML(exercise) {
    let lastSessionResults = '<div class="last-session-results"><p class="no-stats">No stats from a previous session</p></div>';
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
    // const exerciseSetsHTML = TrainingPageExerciseSetSection.render({template: TrainingPageExerciseSetSection.createExerciseSetsHTML, exercise: exercise});
    return `<li>
              <h3>${exercise.name.toUpperCase()}</h3>
              ${lastBestSetHTML}
              <div class="exercise-sets"></div>
              <div class="exercise-set-input"></div>
            </li>`;
  },
  exercisesList(exercises) {
    let list = $.parseHTML('<ul class="exercise-list"></ul>');
    exercises.forEach((exercise, index) => {
      const liElement = $.parseHTML(this.exerciseListItemHTML(exercise));
      const exerciseSetFormOptions = {onSubmitForm: EventHandler.onSaveAddSetForExercise(index)};
      if (exercise.displayExerciseSetInputForm) {
        Object.assign(exerciseSetFormOptions, {
          displayInputForm: true,
          exerciseSet: exercise.updateExerciseSet.set,
          onSubmitUpdateForm: EventHandler.onUpdateExerciseSetSubmitForm(exercise.updateExerciseSet.setId)});
        exercise.displayExerciseSetInputForm = false;
      }
      const exerciseSetForm = new ExerciseSetInputForm(exerciseSetFormOptions);
      const addExerciseSetDiv = $(liElement).find('.exercise-set-input');
      exerciseSetForm.render(addExerciseSetDiv);
      const exerciseSetsTable = new ExerciseSetsTable({exercise: exercise, onClickEditButton: EventHandler.onEditExerciseSetButtonClick(index), onClickDeleteButton: EventHandler.onDeleteExerciseSetButtonClick});
      const exerciseSetsDiv = $(liElement).find('.exercise-sets');
      exerciseSetsTable.render(exerciseSetsDiv);
      $(list).append(liElement);
    });
    return list;
  },
  render(props) {
    return this.exercisesList(props.exercises)
  }
};

const SelectTrainingSessionSection = {
  selectTrainingSessionForm() {
    return `<form role="form" class="select-training-session-form">
              <fieldset>
                <legend>
                        <h2 class="heading-select-session">Select your training session for today</h2>
                </legend>
              </fieldset>
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
    return `<form role="form" class="login-form">
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