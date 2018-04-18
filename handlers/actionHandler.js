var authenticate = require('../microsoftGraph/authenticate.js');

var calendarHandler = require('../handlers/calendarHandler.js');
var userHandler = require('../handlers/userHandler.js');
var actionHandler = require('../handlers/actionHandler.js');

var hooks = require('hooks');
var Action = require('./../handlers/Action.js');

for (var k in hooks) {
  Action[k] = hooks[k];
}

function parseAction(req, res){
  this.options.contexts = req.body.result.contexts;
  this.options.action = req.body.result.action;

  switch (this.options.action) {
    case 'calendar_user_available' :
      console.log('--CHECK--');
      console.log('parseAction.options : ' + JSON.stringify(this.options));
      Action.prototype.findMeetingTimes = calendarHandler.findMeetingTimes.bind(this);
      Action.pre('findMeetingTimes', authenticate.refreshToken)
        .pre('findMeetingTimes', userHandler.searchUser)
        .pre('findMeetingTimes', authenticate.refreshToken);

      var action = new Action();
      action.findMeetingTimes(req, res);

      break;

    default:
      this.message = 'Could you repeat that?';
      this.speech = 'Could you repeat that?';
  }
  console.log('parseAction.options : ' + JSON.stringify(this.options));
}

exports.parseAction = parseAction;
