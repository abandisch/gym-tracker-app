import $ from "jquery";

export default class ExerciseSetInputForm {
  constructor(props) {
    this.displayInputForm = props.displayInputForm || false;
    this.props = props;
  }
  addExerciseSetButtonFormHTML() {
    return `<form role="form" class="add-set-button-form">
              <button class="btn btn-small btn-add-set"><i class="fa fa-plus-square-o"></i> Add Set</button>
            </form>`;
  }
  exerciseSetInputFormHTML(set) {
    return `<form role="form" class="${set && set.reps && set.weight ? 'update-set-input-form' : 'add-set-input-form'}">
              <div class="inline-form-input">
                <label for="setWeight">Weight: </label>
                <input value="${set && set.weight ? set.weight : ''}" type="text" id="setWeight" name="weight" placeholder="E.g. 10 or Body Weight" required>
              </div>
              <div class="inline-form-input">
                <label for="setReps">Reps: </label>
                <input value="${set && set.reps ? set.reps : ''}" type="number" id="setReps" name="reps" placeholder="Number of reps" required>
              </div> 
              <button class="btn btn-small btn-save-set">
                <i class="fa fa-${set && set.reps && set.weight ? 'check' : 'plus-square-o'}" aria-hidden="true"></i> ${set && set.reps && set.weight ? 'Update Set' : 'Save New Set'}
              </button>
              <button class="btn btn-small btn-cancel-add-set">
                <i class="fa fa-ban" aria-hidden="true"></i> Cancel
              </button>
            </form>`;
  }
  bindCancelEvent(parent) {
    // Event for click cancel button
    $(parent).on('click', '.btn-cancel-add-set', (event) => {
      event.preventDefault();
      $(parent).unbind();
      this.displayInputForm = false;
      this.props.exerciseSet = null;
      this.render(parent);
    });
  }
  bindSaveNewSetEvent(parent) {
    // Event for submit 'add set' button
    $(parent).on('submit', '.add-set-input-form', (event) => {
      event.preventDefault();
      const weight = $(event.currentTarget).find('input[name=weight]').val();
      const reps = $(event.currentTarget).find('input[name=reps]').val();
      this.displayInputForm = false;
      this.props.onSubmitForm(weight, reps);
      this.render(parent);
    });
  }
  bindUpdateSetEvent(parent) {
    // Event for submit 'update set' button
    $(parent).on('submit', '.update-set-input-form', (event) => {
      event.preventDefault();
      const weight = $(event.currentTarget).find('input[name=weight]').val();
      const reps = $(event.currentTarget).find('input[name=reps]').val();
      const setNumber = this.props.exerciseSet.setNumber;
      this.props.onSubmitUpdateForm(weight, reps, setNumber);
      this.displayInputForm = false;
      this.render(parent);
    });
  }
  bindAddButtonFormEvent(parent) {
    // submit event for 'add new set' button
    $(parent).on('submit', '.add-set-button-form', (event) => {
      event.preventDefault();
      this.displayInputForm = true;
      this.render(parent);
    })
  }
  render(parent) {
    if (this.displayInputForm) {
      parent.html(this.exerciseSetInputFormHTML(this.props.exerciseSet));
      this.bindCancelEvent(parent);
      this.bindSaveNewSetEvent(parent);
      this.bindUpdateSetEvent(parent);
    } else {
      const addExerciseSetForm = this.addExerciseSetButtonFormHTML();
      parent.html(addExerciseSetForm);
      this.bindAddButtonFormEvent(parent);
    }
  }
}