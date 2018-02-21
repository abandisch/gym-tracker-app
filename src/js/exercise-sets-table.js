import $ from "jquery";

export default class ExerciseSetsTable {
  constructor(props) {
    this.props = props;
  }
  createSetsRowHTML(sets) {
    let exerciseSets = `<tr><td colspan="5">Click the 'Add Set' button to add a new set for this exercise</td></tr>`;
    if (sets.length > 0) {
      exerciseSets = sets.map(set => {
        return `<tr data-exercise-set-id="${set.id}">
                  <td><button class="btn-delete-set"><i class="fa fa-times"></i><span class="sr-only">Delete Set</span></button></td>
                  <td>${set.setNumber}</td>
                  <td>${set.weight}</td>
                  <td>${set.reps}</td>
                  <td><button class="btn-edit-set"><i class="fa fa-edit"></i><span class="sr-only">Edit Set</span></button></td>
                </tr>`;
      }).join('');
    }
    return exerciseSets;
  }
  createSetsTableHTML(exercise) {
    const exerciseSetsHTML = this.createSetsRowHTML(exercise.sets);
    return `<table class="set-table">
                <!-- Table caption is for Screen Readers only --> 
                <caption class="sr-only">Exercise Sets Table for ${exercise.name}</caption>
                <thead>
                  <tr>
                    <th scope="col">Delete</th>
                    <th scope="col">Set #</th>
                    <th scope="col">Weight</th>
                    <th scope="col">Reps</th>
                    <th scope="col">Edit</th>
                  </tr>                
                </thead>
                <tbody>
                  ${exerciseSetsHTML} 
                </tbody>
              </table>`;
  }
  render(parent) {
    parent.html(this.createSetsTableHTML(this.props.exercise));
    $(parent).on('click', 'button', (event) => {
      event.preventDefault();
      const exerciseSetId = $(event.currentTarget).closest('tr').data('exercise-set-id');
      const func = $(event.currentTarget).text().trim() === 'Delete Set' ? 'delete' : 'edit';
      if (func === 'edit') {
        this.props.onClickEditButton(exerciseSetId);
      }
      if (func === 'delete') {
        this.props.onClickDeleteButton(exerciseSetId);
      }
    });
  }
}
