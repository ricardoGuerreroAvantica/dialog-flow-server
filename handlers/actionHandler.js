var authenticate = require('../microsoftGraph/authenticate.js');
var calendarHandler = require('../handlers/calendarHandler.js');
var userHandler = require('../handlers/userHandler.js');
var eventHandler = require('../handlers/eventHandler.js');
var locationHandler = require('../handlers/locationHandler.js');
var hooks = require('hooks');
var Action = require('./../handlers/Action.js');
var timezoneHandler =require("./../handlers/timezoneHandler.js")
for (var k in hooks) {
  Action[k] = hooks[k];
}
/**
 * This is the function on charge of checking wha is the request action(options.action) send by dialog flow and then
 * execute the methods according to this action
 * @param {JSON} options.parameters The parameters are all the information from the current request (event name, user name, 
 * user lastname, event date, ...)
 * @param {JSON} options.contexts The contexts are the information passed down between intents, like event invites, user
 * access token, ...)
 * @param {String} options.action the action defines which functions needs to be executed in order to complete the user request.
 */
function parseAction(req, res, callback){
  var options = this.options;
  options.contexts = req.body.result.contexts || [];
  options.action = req.body.result.action;
  options.parameters = req.body.result.parameters;
  console.log("Case: " +JSON.stringify(options.action))

 
  switch (options.action) {
    
    //Case: calendar_user_available
    //Description: This case is trigger when the user ask for "Is [name] available [date]", search if the employee exists and then proceed to show the disponibility of them.
    case 'calendar_user_available' :
      Action.prototype.checkMeetingTimes = calendarHandler.checkMeetingTimes;
      Action.pre('checkMeetingTimes', authenticate.refreshToken)
      .pre('checkMeetingTimes', timezoneHandler.getTimeZone)
      .pre('checkMeetingTimes', calendarHandler.userData)
      .pre('checkMeetingTimes',userHandler.preSearchUser)
      .pre('checkMeetingTimes', calendarHandler.PrefindMeetingTimes);
      var action = new Action();
      action.checkMeetingTimes(options, callback);
      break;

    //Case: helper
    //Description: This case is trigger when the user ask for "Help" 
    case 'helper' :
      userHandler.helper(options, callback);
      break;

    //Case: show_events
    //Description: This case is trigger when the user ask for "Show my events" 
    case 'show_events' :
      Action.prototype.showEvents = calendarHandler.showEvents;
      Action.pre('showEvents', authenticate.refreshToken)
      .pre('showEvents', timezoneHandler.getTimeZone)      ;
      var action = new Action();
      action.showEvents(options, callback);
      break;

    //Case: show_events_on_date
    //Description: This case is trigger when the user ask for "Show my events for [date]"
    case 'show_events_on_date' :
      Action.prototype.showEventsOnDate = calendarHandler.showEventsOnDate;
      Action.pre('showEventsOnDate', authenticate.refreshToken)
      .pre('showEventsOnDate', timezoneHandler.getTimeZone)

      var action = new Action();
      action.showEventsOnDate(options, callback);
      break;

    //Case: show_locations
    //Description: #Currently the bot dont handle locations.
    case 'show_locations' :
      Action.prototype.showLocations = locationHandler.showLocations;
      Action.pre('showLocations', authenticate.refreshToken)
      .pre('showLocations', timezoneHandler.getTimeZone)
      var action = new Action();
      action.showLocations(options, callback);
      break;


    //Case: create_event_finish
    //Description: This case is trigger when the user ask for "Done" and proceed to create the event in their calendars
    case 'create_event_finish' :
      options = authenticate.promiseRefreshToken(options);
      console.log("start--------"+options.access_token);
      options.userTimezone =timezoneHandler.setTimeZone(options.access_token);
      console.log("end--------");
      console.log(JSON.stringify(options))

      Action.prototype.scheduleMeeting = calendarHandler.scheduleMeeting;
      var action = new Action();
      action.scheduleMeeting(options, callback);
      break;
    
    //Case: create_event_invite
    //Description: This case is trigger when the user ask for "invite [name]"
    case 'create_event_invite' :
      Action.prototype.inviteUser = eventHandler.inviteUser;
      Action.pre('inviteUser', authenticate.refreshToken)
        .pre('inviteUser',userHandler.preSearchUser);
      var action = new Action();
      action.inviteUser(options, callback);
      break;

    //Case: create_event_uninvite
    //Description: This case is trigger when the user ask for "Uninvite [name]"
    case 'create_event_uninvite' :
      eventHandler.deleteInvite(options, callback);
      break;
    
    //Case: create_event_show_invites
    //Description: This case is trigger when the user ask for "Show my invites", and the bot proceed to show all the current invites for the event.
    case 'create_event_show_invites' :
      eventHandler.showInvites(options, callback);
      break;

    //Case: check_available_Only_name
    //Description: this case is trigger when the user search for a employee using only the name of the employee
    case 'check_available_Only_name' :
        Action.prototype.checkUser = userHandler.checkUser;
        //PRE
        Action.pre('checkUser', authenticate.refreshToken)
        .pre('checkUser', timezoneHandler.getTimeZone)
        .pre('checkUser',userHandler.preSearchUser)
        //.pre('checkUser',userHandler.searchUser)
        var action = new Action();
        action.checkUser(options, callback);
      break;

      
    //Case: Show_event_Info
    //Description: This case is trigger when the user ask for "Show my event info" request, and will show the user the event body of the current event creation
    case 'Show_event_Info' :
      options.simpleInfo = false;
      Action.prototype.showEventDetails = calendarHandler.showEventDetails;
        //PRE
        Action.pre('showEventDetails', authenticate.refreshToken)
        .pre('showEventDetails', timezoneHandler.getTimeZone)
        var action = new Action();
        action.showEventDetails(options, callback);
      break;

    //Case: createEventBegin
    //Description: This case is trigger when all the information of the event creation is collected and then proceed to show the event body to the user
    case 'createEventBegin' :
      options.simpleInfo = true;
      Action.prototype.showEventDetails = calendarHandler.showEventDetails;
        //PRE
        Action.pre('showEventDetails', authenticate.refreshToken)
        .pre('showEventDetails', timezoneHandler.getTimeZone)
        var action = new Action();
        action.showEventDetails(options, callback);
      break;

    //Case: Default Answer
    //Description: This is the default answer send when there is no other case that match the request case.
    default:
      this.options.message = 'Could you repeat that?';
      this.options.speech = 'Could you repeat that?';
      callback(this.options);
  }

}

exports.parseAction = parseAction;
