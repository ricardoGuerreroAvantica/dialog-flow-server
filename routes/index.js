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

  Action.hook('parseAction', actionHandler.parseAction, (error) => {
    errorHandler.raiseError(res, 'DEFAULT_ERROR');
  });

  Action.pre('parseAction', authenticate.validSession, (error) => {
    errorHandler.raiseError(res, 'VALID_SESSION_ERROR');
  });

  Action.pre('parseAction', authenticate.validUser, (error) => {
    errorHandler.raiseError(res, 'VALID_USER_ERROR');
  });

  Action.post('parseAction', (next) => {
    var contexts  = this.contexts;
    var message   = this.message;
    var speech    = this.speech;

    return res.json({
      speech: speech,
      displayText: message,
      source: "dialog-server-flow",
      contextOut : contexts
    });
  })
  var action = new Action();
  action.parseAction(req, res);

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
