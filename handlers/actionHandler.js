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

  console.log('parseAction.options.pre : ' + JSON.stringify(options));
  switch (options.action) {
    ///////////////FIND MEETING TIME///////////////
    case 'calendar_user_available' :

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
      //HOOK
      Action.prototype.showEvents = calendarHandler.showEvents;
      //PRE
      Action.pre('showEvents', authenticate.refreshToken);

      var action = new Action();
      action.showEvents(options, callback);
      break;

    ///////////////SCHEDULE A MEETING - INVITE USER(s) ///////////////
    case 'create_event_invites' :
      //HOOK
      Action.prototype.showEvents = calendarHandler.generateInvites;

      var action = new Action();
      action.generateInvites(options, callback);
      break;

    ///////////////DEFAULT ANSWER///////////////
    default:
      this.options.message = 'Could you repeat that?';
      this.options.speech = 'Could you repeat that?';
      callback(this.options);
  }

}

exports.parseAction = parseAction;
