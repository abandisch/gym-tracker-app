
function setCookie(cName, cValue, exDays) {
  let expires = '';
  if (exDays) {
    const d = new Date();
    d.setTime(d.getTime() + (exDays*24*60*60*1000));
    expires = "expires="+ d.toUTCString();
  }
  document.cookie = cName + "=" + cValue + ";" + expires + ";path=/";
}

function getCookie(name) {
  const regexp = new RegExp("(?:^" + name + "|;\s*"+ name + ")=(.*?)(?:;|$)", "g");
  const result = regexp.exec(document.cookie);
  return (result === null) ? null : result[1];
}

export { setCookie, getCookie };