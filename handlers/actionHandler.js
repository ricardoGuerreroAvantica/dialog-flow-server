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
    console.log("DATA:  # 1")

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
    console.log("DATA:  # 2")

      userHandler.helper(options, callback);
      break;

    //Case: show_events
    //Description: This case is trigger when the user ask for "Show my events" 
    case 'show_events' :
    console.log("DATA:  # 3")

      Action.prototype.showEvents = calendarHandler.showEvents;
      Action.pre('showEvents', authenticate.refreshToken)
      .pre('showEvents', timezoneHandler.getTimeZone)      ;
      var action = new Action();
      action.showEvents(options, callback);
      break;

    //Case: show_events_on_date
    //Description: This case is trigger when the user ask for "Show my events for [date]"
    case 'show_events_on_date' :
    console.log("DATA:  # 4")

      Action.prototype.showEventsOnDate = calendarHandler.showEventsOnDate;
      Action.pre('showEventsOnDate', authenticate.refreshToken)
      .pre('showEventsOnDate', timezoneHandler.getTimeZone)

      var action = new Action();
      action.showEventsOnDate(options, callback);
      break;

    //Case: show_locations
    //Description: #Currently the bot dont handle locations.
    case 'show_locations' :
    console.log("DATA:  # 5")

      Action.prototype.showLocations = locationHandler.showLocations;
      Action.pre('showLocations', authenticate.refreshToken)
      .pre('showLocations', timezoneHandler.getTimeZone)
      var action = new Action();
      action.showLocations(options, callback);
      break;


    //Case: create_event_finish
    //Description: This case is trigger when the user ask for "Done" and proceed to create the event in their calendars
    case 'create_event_finish' :
    console.log("DATA:  # 6")

      Action.prototype.scheduleMeeting = calendarHandler.scheduleMeeting;
      Action.pre('scheduleMeeting', authenticate.refreshToken)
      .pre('scheduleMeeting', timezoneHandler.getTimeZone)
      var action = new Action();
      action.scheduleMeeting(options, callback);
      break;
    
    //Case: create_event_invite
    //Description: This case is trigger when the user ask for "invite [name]"
    case 'create_event_invite' :
    console.log("DATA:  # 7")

      Action.prototype.inviteUser = eventHandler.inviteUser;
      Action.pre('inviteUser', authenticate.refreshToken)
        .pre('inviteUser',userHandler.preSearchUser);
      var action = new Action();
      action.inviteUser(options, callback);
      break;

    //Case: create_event_uninvite
    //Description: This case is trigger when the user ask for "Uninvite [name]"
    case 'create_event_uninvite' :
    console.log("DATA:  # 8")

      eventHandler.deleteInvite(options, callback);
      break;
    
    //Case: create_event_show_invites
    //Description: This case is trigger when the user ask for "Show my invites", and the bot proceed to show all the current invites for the event.
    case 'create_event_show_invites' :
    console.log("DATA:  # 9")
      eventHandler.showInvites(options, callback);
      break;

    //Case: check_available_Only_name
    //Description: this case is trigger when the user search for a employee using only the name of the employee
    case 'check_available_Only_name' :
    console.log("DATA:  # 10")

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
    console.log("DATA:  # 11")

      options.simpleInfo = false;
      Action.prototype.showEventDetails = calendarHandler.showEventDetails;
        //PRE
        Action.pre('showEventDetails', authenticate.refreshToken)
        .pre('showEventDetails', timezoneHandler.getTimeZone)
        var action = new Action();
        action.showEventDetails(options, callback);
      break;

    //Case: createEventBegin
    //Description: This case is trigger when all the information of the event creation is collected and then proced to show the event body to the user
    case 'createEventBegin' :
    console.log("DATA:  # 12")

      options.simpleInfo = true;
      Action.prototype.showEventDetails = calendarHandler.showEventDetails;
        //PRE
        Action.pre('showEventDetails', authenticate.refreshToken)
        .pre('showEventDetails', timezoneHandler.getTimeZone)
        var action = new Action();
        action.showEventDetails(options, callback);
      break;

    //Case: Default Answer
    //Description: This is the default answer sended when there is no other case that match the request case.
    default:
    console.log("DATA:  # 13")

      this.options.message = 'Could you repeat that?';
      this.options.speech = 'Could you repeat that?';
      callback(this.options);
  }

}

exports.parseAction = parseAction;
