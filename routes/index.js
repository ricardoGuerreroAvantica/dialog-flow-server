var express = require('express');
var router = express.Router();
var authenticate = require('../microsoftGraph/authenticate.js');
var errorHandler = require('../handlers/errorHandler.js');
var actionHandler = require('../handlers/actionHandler.js');
var hooks = require('hooks');
var Action = require('./../handlers/Action.js');

for (var k in hooks) {
  Action[k] = hooks[k];
}


router.post("/request", (req, res) => {

  Action.prototype.parseAction = actionHandler.parseAction;

  Action.pre('parseAction', authenticate.validSession, (error) => {
    errorHandler.raiseError(res, 'VALID_SESSION_ERROR');
  }).pre('parseAction', authenticate.validUser, (error) => {
    errorHandler.raiseError(res, 'VALID_USER_ERROR');
  });

  var action = new Action();

  action.parseAction(req, res, (result) => {
    var contexts  = result.contexts;
    var message   = result.speech;
    var speech    = result.message;
    console.log('request.options : ' + JSON.stringify(result, null, 2));

    return res.json({
      speech: speech,
      displayText: message,
      source: "dialog-server-flow",
      contextOut : contexts
    });
  });

});




router.get('/signIn', function (req, res) {
  authenticate.signIn(req, res);
});


router.get('/privacy', (req, res) => {

  res.json({info : 'soon'});
});


router.get('/terms', (req, res) => {

  res.json({info : 'soon'});
});


module.exports = router;
