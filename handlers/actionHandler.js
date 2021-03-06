var authenticate = require('../microsoftGraph/authenticate.js');

var calendarHandler = require('../handlers/calendarHandler.js');
var userHandler = require('../handlers/userHandler.js');
var actionHandler = require('../handlers/actionHandler.js');
var eventHandler = require('../handlers/eventHandler.js');
var locationHandler = require('../handlers/locationHandler.js');

var hooks = require('hooks');
var Action = require('./../handlers/Action.js');

for (var k in hooks) {
  Action[k] = hooks[k];
}

function parseAction(req, res, callback){
  var options = this.options;
  options.contexts = req.body.result.contexts || [];
  options.action = req.body.result.action;
  options.parameters = req.body.result.parameters;

  console.log('parseAction.options.pre : ' + JSON.stringify(options, null, 2));
  switch (options.action) {
    ///////////////FIND MEETING TIME///////////////
    case 'calendar_user_available' :
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

    ///////////////SHOW LOCATIONS///////////////
    case 'show_locations' :
      //HOOK
      Action.prototype.showLocations = locationHandler.showLocations;
      //PRE
      Action.pre('showLocations', authenticate.refreshToken);

      var action = new Action();
      action.showLocations(options, callback);
      break;


    ///////////////SCHEDULE A MEETING - INVITE USER ///////////////
    case 'create_event_finish' :
      //HOOK
      Action.prototype.scheduleMeeting = calendarHandler.scheduleMeeting;
      //PRE
      Action.pre('scheduleMeeting', authenticate.refreshToken);

      var action = new Action();
      action.scheduleMeeting(options, callback);
      break;
    ///////////////SCHEDULE A MEETING - INVITE USER ///////////////
    case 'create_event_invite' :
      Action.prototype.inviteUser = eventHandler.inviteUser;
      //PRE
      Action.pre('inviteUser', authenticate.refreshToken)
        .pre('inviteUser', userHandler.searchUser);

      var action = new Action();
      action.inviteUser(options, callback);

      break;
    ///////////////SCHEDULE A MEETING - UNINVITE USER ///////////////
    case 'create_event_uninvite' :
      eventHandler.deleteInvite(options, callback);
      break;
    ///////////////SCHEDULE A MEETING - SHOW INVITES USER ///////////////
    case 'create_event_show_invites' :
      eventHandler.showInvites(options, callback);
      break;
    ///////////////SCHEDULE A MEETING - SHOW INVITES USER ///////////////
    case 'create_event_uninvite' :
      eventHandler.showInvites(options, callback);
      break;

    ///////////////DEFAULT ANSWER///////////////
    default:
      this.options.message = 'Could you repeat that?';
      this.options.speech = 'Could you repeat that?';
      callback(this.options);
  }

}

exports.parseAction = parseAction;
