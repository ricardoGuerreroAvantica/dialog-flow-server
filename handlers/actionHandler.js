var authenticate = require('../microsoftGraph/authenticate.js');

var calendarHandler = require('../handlers/calendarHandler.js');
var userHandler = require('../handlers/userHandler.js');

var hooks = require('hooks')
  , Action = require('./Action');

for (var k in hooks) {
  Action[k] = hooks[k];
}

function parseAction(req, res){
  this.options.contexts = req.body.result.contexts;
  this.options.action = req.body.result.action;

  switch (this.options.action) {
    case 'calendar_user_available' :
      Action.hook('findMeetingTimes', calendarHandler.findMeetingTimes);

      Action.pre('findMeetingTimes', authenticate.refreshToken);
      Action.pre('findMeetingTimes', userHandler.searchUser);
      Action.pre('findMeetingTimes', authenticate.refreshToken);

      var action = new Action();
      action.findMeetingTimes(req, res);

      break;

    default:
      this.message = 'Could you repeat that?';
      this.speech = 'Could you repeat that?';
  }
}
