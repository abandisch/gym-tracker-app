import $ from "jquery";

export default class ExerciseSetInputForm {
  constructor(props) {
    this.displayAddSetInputForm = false;
    this.props = props;
  }
  addExerciseSetButtonFormHTML() {
    return `<form role="form" class="add-set-button-form">
              <button class="btn btn-small btn-add-set"><i class="fa fa-plus-square-o"></i> Add Set</button>
            </form>`;
  }
  addExerciseSetInputFormHTML() {
    return `<form role="form" class="add-set-input-form">
              <div class="inline-form-input">
                <label for="setWeight">Weight: </label>
                <input type="text" id="setWeight" name="weight" placeholder="E.g. 10 or Body Weight" required>
              </div>
              <div class="inline-form-input">
                <label for="setReps">Reps: </label>
                <input type="number" id="setReps" name="reps" placeholder="Number of reps" required>
              </div> 
              <button class="btn btn-small btn-save-set">
                <i class="fa fa-plus-square-o" aria-hidden="true"></i> Save New Set
              </button>
              <button class="btn btn-small btn-cancel-add-set">
                <i class="fa fa-ban" aria-hidden="true"></i> Cancel
              </button>
            </form>`;
  }
  render(parent) {
    if (this.displayAddSetInputForm) {
      parent.html(this.addExerciseSetInputFormHTML());
      // Event for click cancel button
      $(parent).on('click', '.btn-cancel-add-set', (event) => {
        event.preventDefault();
        this.displayAddSetInputForm = false;
        this.render(parent);
      });
      // Event for submit 'add set' button
      $(parent).on('submit', '.add-set-input-form', (event) => {
        event.preventDefault();
        const weight = $(event.currentTarget).find('input[name=weight]').val();
        const reps = $(event.currentTarget).find('input[name=reps]').val();
        this.displayAddSetInputForm = false;
        this.props.onSubmitForm(weight, reps);
        this.render(parent);
      });
    } else {
      const addExerciseSetForm = this.addExerciseSetButtonFormHTML();
      parent.html(addExerciseSetForm);
      $(parent).on('submit', '.add-set-button-form', (event) => {
        event.preventDefault();
        this.displayAddSetInputForm = true;
        this.render(parent);
      });
    }
  }
}