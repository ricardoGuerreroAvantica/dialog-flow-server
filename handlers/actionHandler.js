var authenticate = require('../microsoftGraph/authenticate.js');

var calendarHandler = require('../handlers/calendarHandler.js');
var userHandler = require('../handlers/userHandler.js');
var actionHandler = require('../handlers/actionHandler.js');

var hooks = require('hooks');
var Action = require('./../handlers/Action.js');

for (var k in hooks) {
  Action[k] = hooks[k];
}

function parseAction(req, res, callback){
  var options = this.options;
  options.contexts = req.body.result.contexts;
  options.action = req.body.result.action;
  options.parameters = req.body.result.parameters;

  console.log('parseAction.options.pre.httpCall : ' + JSON.stringify(options));

  switch (options.action) {
    ///////////////FIND MEETING TIME///////////////
    case 'calendar_user_available' :
      console.log('parseAction.options.pre : ' + JSON.stringify(options));
      //HOOK
      Action.prototype.findMeetingTimes = calendarHandler.findMeetingTimes;
      //PRE
      Action.pre('findMeetingTimes', authenticate.refreshToken)
        .pre('findMeetingTimes', userHandler.searchUser);

      var action = new Action();
      action.findMeetingTimes(options, callback);

      break;

    ///////////////SHOW EVENTS///////////////
    case 'show_events' :

      break;

    ///////////////DEFAULT ANSWER///////////////
    default:
      this.options.message = 'Could you repeat that?';
      this.options.speech = 'Could you repeat that?';
      callback(this.options);
  }

}

exports.parseAction = parseAction;
