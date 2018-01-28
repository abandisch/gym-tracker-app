/* Temp function to simulate login */
function login() {
  $('#login-form').submit((event) => {
    event.preventDefault();
    window.location.href = 'training-session/select-session/';
  });
}

$(login);