// this constant contains the error codes
const ERROR_CODES = {
  VALID_SESSION_ERROR : 'User device not valid',
  VALID_USER_ERROR : 'User not valid',
  DEFAULT_ERROR : "I don't understand you"
}

// this function raise the error when its called
function raiseError(res, code){
  message = ERROR_CODES[code]

  return res.json({
    speech: speech,
    displayText: message,
    source: "dialog-server-flow"
  })
}
