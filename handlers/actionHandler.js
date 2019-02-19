var authenticate = require("../microsoftGraph/authenticate.js")
var calendarHandler = require("../handlers/calendarHandler.js")
var userHandler = require("../handlers/userHandler.js")
var eventHandler = require("../handlers/eventHandler.js")
var locationHandler = require("../handlers/locationHandler.js")
var hooks = require("hooks")
var Action = require("./../handlers/Action.js")
var timezoneHandler =require("./../handlers/timezoneHandler.js")
var textResponses =require("./../constants/TextResponses")
for (var k in hooks) {
  Action[k] = hooks[k]
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
async function parseAction(req, res, callback){
  var options = this.options
  options.contexts = req.body.result.contexts || []
  options.action = req.body.result.action
  options.parameters = req.body.result.parameters
  console.log("Case: " +JSON.stringify(options.action))

 
  switch (options.action) {
    
    //Case: calendar_user_available
    //Description: This case is trigger when the user ask for "Is [name] available [date]", search if the employee exists and then proceed to show the disponibility of them.
    case "calendar_user_available" :
      options = await authenticate.promiseRefreshToken(options)
      options.userTimezone = await timezoneHandler.setTimeZone(options.access_token)
      options = await calendarHandler.userData(options)
      options = await userHandler.preSearchUser(options)
      if(options.user){
        options = await calendarHandler.PreFindMeetingTimes(options)
      }
      callback(options)
      break

    //Case: helper
    //Description: This case is trigger when the user ask for "Help" 
    case "helper" :
      options = await userHandler.helper(options)
      console.log("check")
      callback(options)
      break

    //Case: show_events
    //Description: This case is trigger when the user ask for "Show my events" 
    case "show_events" :
      options = await authenticate.promiseRefreshToken(options)
      console.log(JSON.stringify(options))
      options.userTimezone = await timezoneHandler.setTimeZone(options.access_token)
      await calendarHandler.showEvents(options)
      callback(options)
      break

    //Case: show_events_on_date
    //Description: This case is trigger when the user ask for "Show my events for [date]"
    case "show_events_on_date" :
      options = await authenticate.promiseRefreshToken(options)
      options.userTimezone = await timezoneHandler.setTimeZone(options.access_token)
      await calendarHandler.showEventsOnDate(options)
      callback(options)
      break

    //Case: show_locations
    //Description: #Currently the bot dont handle locations.
    case "show_locations" :
      Action.prototype.showLocations = locationHandler.showLocations
      Action.pre("showLocations", authenticate.refreshToken)
      var action = new Action()
      action.showLocations(options, callback)
      break


    //Case: create_event_finish
    //Description: This case is trigger when the user ask for "Done" and proceed to create the event in their calendars
    case "create_event_finish" :
      options = await authenticate.promiseRefreshToken(options)
      options.userTimezone = await timezoneHandler.setTimeZone(options.access_token)
      console.log("timezone :"+ options.userTimezone)
      options = await calendarHandler.scheduleMeeting(options)
      callback(options)
      break
    
    //Case: create_event_invite
    //Description: This case is trigger when the user ask for "invite [name]"
    case "create_event_invite" :
      options = await authenticate.promiseRefreshToken(options)
      options = await userHandler.preSearchUser(options)
      options = await eventHandler.inviteUser(options)
      callback(options)
      break

    //Case: create_event_uninvite
    //Description: This case is trigger when the user ask for "Uninvite [name]"
    case "create_event_uninvite" :
      eventHandler.deleteInvite(options, callback)
      break
    
    //Case: create_event_show_invites
    //Description: This case is trigger when the user ask for "Show my invites", and the bot proceed to show all the current invites for the event.
    case "create_event_show_invites" :
      eventHandler.showInvites(options, callback)
      break

    //Case: check_available_Only_name
    //Description: this case is trigger when the user search for a employee using only the name of the employee
    case "check_available_Only_name" :
      options = await authenticate.promiseRefreshToken(options)
      options.userTimezone = await timezoneHandler.setTimeZone(options.access_token)
      options = await calendarHandler.userData(options)
      options = await userHandler.preSearchUser(options)
      if(options.user){
        options.message = textResponses.preSearchUserResponses.successMessage
      }
      callback(options)
      break

      
    //Case: Show_event_Info
    //Description: This case is trigger when the user ask for "Show my event info" request, and will show the user the event body of the current event creation
    case "Show_event_Info" :
      options.simpleInfo = false
      Action.prototype.showEventDetails = calendarHandler.showEventDetails
        Action.pre("showEventDetails", authenticate.refreshToken)
        var action = new Action()
        action.showEventDetails(options, callback)
      break

    //Case: createEventBegin
    //Description: This case is trigger when all the information of the event creation is collected and then proceed to show the event body to the user
    case "createEventBegin" :
      options.simpleInfo = true
      Action.prototype.showEventDetails = calendarHandler.showEventDetails
        Action.pre("showEventDetails", authenticate.refreshToken)
        var action = new Action()
        action.showEventDetails(options, callback)
      break

    //Case: Default Answer
    //Description: This is the default answer send when there is no other case that match the request case.
    default:
      this.options.message = "Could you repeat that?"
      callback(this.options)
  }

}

exports.parseAction = parseAction
