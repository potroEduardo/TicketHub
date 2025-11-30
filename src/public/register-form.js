// check matching password
const pw = $('#password')[0];
const confPw = $('#confPassword')[0];
pw.onchange = () => checkPw();
confPw.onchange = () => checkPw();

function checkPw() {
  const pwValue = pw.value;
  const confPwValue = confPw.value;
  if (pwValue !== confPwValue) {
    confPw.setCustomValidity('Contraseña no coincide');
  } else {
    confPw.setCustomValidity('');
  }
}

