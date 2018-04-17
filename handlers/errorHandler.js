
const ERROR_CODES = {
  VALID_SESSION_ERROR : 'User device not valid',
  VALID_USER_ERROR : 'User not valid',
  DEFAULT_ERROR : "I don't understand you"
}


function raiseError(res, code){
  message = ERROR_CODES[code];

  return res.json({
    speech: speech,
    displayText: message,
    source: "dialog-server-flow"
  });
}
