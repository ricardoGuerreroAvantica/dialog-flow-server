var authenticate = require('../microsoftGraph/authenticate.js');

var calendarHandler = require('../handlers/calendarHandler.js');
var userHandler = require('../handlers/userHandler.js');
var actionHandler = require('../handlers/actionHandler.js');

var hooks = require('hooks');
var Action = require('./../handlers/Action.js');

for (var k in hooks) {
  Action[k] = hooks[k];
}

async function parseAction(req, res){
  this.options.contexts = req.body.result.contexts;
  this.options.action = req.body.result.action;
  console.log('parseAction.options.pre : ' + JSON.stringify(this.options));
  switch (this.options.action) {
    case 'calendar_user_available' :
      console.log('parseAction.options.pre : ' + JSON.stringify(this.options));
      //HOOK
      Action.prototype.findMeetingTimes = calendarHandler.findMeetingTimes;
      //PRE
      Action.pre('findMeetingTimes', authenticate.refreshToken)
        .pre('findMeetingTimes', userHandler.searchUser)
        .pre('findMeetingTimes', authenticate.refreshToken);

      var action = new Action();
      await action.findMeetingTimes.call(this, req, res);
      break;

    default:
      this.message = 'Could you repeat that?';
      this.speech = 'Could you repeat that?';
  }
  console.log('parseAction.options : ' + JSON.stringify(this.options));
}

exports.parseAction = parseAction;
