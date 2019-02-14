var request = require("../microsoftGraph/request.js")
var moment = require("moment")
var axios = require("axios")
var commons = require("../utils/commons.js")
var textResponses =require("./../constants/TextResponses")
var errorHandler = require("./errorHandler.js")

/**
 * dialogflow replace " ' and '' with different values to represent them, this function return the message 
 * to it original characters.
 * @param {string} name contains all the current invitations of the event.
 */
function replaceSpecialCharacters(name){
  name = name.replace("&quot;","\"")
  name = name.replace("quot;","\"")
  name = name.replace("&quot","\"")
  name = name.replace("&apos;","\'")
  name = name.replace("apos;","\'")
  name = name.replace("&apos","\'")
  return name
}

/**
 * This functions take all the current event values and invites from the contexts then generates a new message showing them.
 * @param {JSON} options.contexts contains all the context stored in dialog flow temporal memory.
 * @param {JSON} options.contexts.parameters this value contains all the information from the the current event
 *  stored in dialog flow.
 * @param {JSON} options.message contains the return message that will be send to dialog flow
 */
function showEventDetails(options,callback){
  try{
    var eventContext = commons.getContext(options.contexts, "createevent")
    var name = eventContext.parameters.eventName
    name = replaceSpecialCharacters(name)
    var duration = eventContext.parameters.duration || {amount : 1, unit : "hours"}
    var date = eventContext.parameters.date + " " + eventContext.parameters.time
    var startDate = moment.utc(date, "YYYY-MM-DD HH:mm:ss").format("L")
    var startTime = moment.utc(date, "YYYY-MM-DD HH:mm:ss").format("h:mm a")
    if(options.source== "ios"){
      var message = "The event : "+name + ", will be created on " +startDate+ "\nAt: " + startTime  + " with a duration of: "+  duration.amount +" "+ duration.unit+"."+ "\n"
    }
    else{
      var message = "The event : *"+name + "*, will be created on *" +startDate+ "*\nAt: *" + startTime  + "* with a duration of: *"+  duration.amount +" "+ duration.unit+"*."+ "\n"
    }
    if (options.simpleInfo==true){
      message += textResponses.showEventDetailsResponses.initialMessage
    }
    else{
      message += textResponses.showEventDetailsResponses.invitesMessage
      var invitesContext = commons.getContext(options.contexts, "invites")
      if (!invitesContext){
        message += textResponses.showEventDetailsResponses.noInvitesMessage
        options.message = message
        callback(options)
      }
      var invites = invitesContext.parameters.invites
      if(invites!== undefined){
        invites.forEach((invite) => {
          message += invite.emailAddress.name + " Email: " + invite.emailAddress.address + "\n"
        })
      }
    }
    options.message = message
    callback(options)
  }
  catch(error){
    console.log("error in : function showEventDetails" + error)
    callback(options)
  }
}

/**
 * this function is in charge of creating the new event in the established time values.
 * @param {JSON} options.contexts contains all the context stored in dialog flow temporal memory.
 * @param {JSON} options.contexts.parameters this value contains all the information from the the current event
 *  stored in dialog flow.
 * @param {JSON} options.message contains the return message that will be send to dialog flow
 */
async function scheduleMeeting(options){
  let promise = new Promise((resolve, reject) => {
    //Set all the basic variables for the event creation.
    
    var invitesContext = commons.getContext(options.contexts, "invites")
    var eventContext = commons.getContext(options.contexts, "createevent")
    var invites = (invitesContext && invitesContext.parameters && invitesContext.parameters.invites) || []
    var name = replaceSpecialCharacters(eventContext.parameters.eventName)
    var duration = eventContext.parameters.duration || {amount : 1, unit : "hours"}
    var date = eventContext.parameters.date + " " + eventContext.parameters.time
    var startDate = moment.utc(date, "YYYY-MM-DDTHH:mm:ss.SSS").add(-parseFloat(options.userTimezone.time), "hours").format("YYYY-MM-DDTHH:mm:ss")
    var endDate = moment.utc(date, "YYYY-MM-DDTHH:mm:ss.SSS").add(-parseFloat(options.userTimezone.time), "hours").add(duration.amount, duration.unit).format("YYYY-MM-DDTHH:mm:ss")
    if (duration.unit === "h") duration.unit = "hours"
    else if(duration.unit === "min") duration.unit = "minutes"
    var body = {
      "subject": name,
      "attendees": invites,
      "start": { "dateTime": startDate + ".000Z", "timeZone": "UTC" },
      "end": { "dateTime": endDate + ".000Z", "timeZone": "UTC" }
    }
    request.postData(textResponses.graphRequests.graph,textResponses.graphRequests.events, options.access_token, JSON.stringify(body), (error, response) => {
      if (error){
        errorHandler.actionError(error)
        reject("Error in scheduleMeeting")
      }
      generateEventBody(response.subject,options.userTimezone,response.start.date,response.end.dateTime,response.organizer.emailAddress.name)
      eventContext.lifespan = 0
      if (invitesContext){
        invitesContext.lifespan = 0
      }
      resolve("Success")
    })
  })
  await promise
}

/**
 * This function is in charge of getting the basic information of the user
 * @param {JSON} options.userName contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.access_token contains the token generated with the user credentials to access microsoft graph
 */
async function userData(options){
  let promise = new Promise((resolve, reject) => {
    axios.get(textResponses.graphRequests.me, {
      headers : {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + options.access_token
      }
    })
    .then((response) => {
      options.userName = response.data.displayName
      resolve("Success")
    })
    .catch((error) => {
      reject("Error")
    })
  })
  await promise
  return options
}


/**
 * This function takes the information(email, name, lastname) of the employee that the user is asking for, and 
 * make a request to microsoft graph to check if this user exists in the avantica user database.
 * @param {JSON} options.parameters contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.user contains the token generated with the user credentials to access microsoft graph
 */
async function PreFindMeetingTimes(options){
  let promise = new Promise((resolve, reject) => {
    var parameters = options.parameters
    var date = parameters.date
    var user = options.user
    var time = options.parameters.time
    options.message +=  textResponses.preFindMeetingTimesResponses.initialMessage
    
    time = options.parameters.time
    let isOrganizerInRequest = options.user.displayName != options.userName //Compares if the current user is asking for their availability
    // The postBody is created with the new timerConstraing
    var postBody = {
      attendees: commons.getAttendees([user]),
      timeConstraint : commons.getTimeConstraint(date, time, 0, 2,options.userTimezone),
      isOrganizerOptional: isOrganizerInRequest
    }

    //The request to microsoft 365 is executed here:
      request.postData(textResponses.graphRequests.graph,textResponses.graphRequests.meetingTimes, options.access_token, JSON.stringify(postBody), (error, response) => {
        if (error){
          errorHandler.actionError(error)
        }
        var meetings = response.meetingTimeSuggestions
        if (meetings.length > 0){
          
          //Found open meeting times in the requested TimeConstrain
          meetings.forEach((meeting) => {
            let timeSet = commons.parseDate(meeting.meetingTimeSlot.start.dateTime,options.userTimezone) + " to " +
                        commons.parseDate(meeting.meetingTimeSlot.end.dateTime,options.userTimezone) +".\n"
            if(!options.message.includes(timeSet)){
              options.message += timeSet
            }
          })
          resolve("Success")
        }else{
            //Didnt find any meeting time .
            if(response.emptySuggestionsReason == "Unknown"){
              options.message = textResponses.preFindMeetingTimesResponses.errorAccessA + options.user.displayName + textResponses.preFindMeetingTimesResponses.errorAccessB
            }
            else{
              options.message = textResponses.preFindMeetingTimesResponses.noAvailableMessage+ options.user.displayName +"."
            }
            resolve("Success")
          }
      })
    })
    await promise
    return options
    }



/**
 * this function is in charge of taking two different dates and show the events between them.
 * @param {JSON} options.parameters contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.message this value contains the return message that will be send to dialog flow
 */
async function showEventsOnDate(options){
    var parameters = options.parameters
    var date = parameters.date
    var filter = ""
    var url = ""
    var startDate=moment((date+("T00:00:00.000")), "YYYY-MM-DDThh:mm:ss.SSS").add(-parseFloat(options.userTimezone.time), "hours").format("YYYY-MM-DDTHH:mm:ss")
    var endDate=moment((date+("T23:59:59.000")), "YYYY-MM-DDThh:mm:ss.SSS").add(-parseFloat(options.userTimezone.time), "hours").format("YYYY-MM-DDTHH:mm:ss")
    filter = "startdatetime=" + startDate+ "Z" +
              "&enddatetime=" + endDate+ "Z"
    url = textResponses.graphRequests.calendarView
    options = await graphEventRequest(url + filter,options)
    return options;
}

/**
 * this function ask to microsoft graph for a list of all the current events of the user.
 * @param {JSON} options.parameters contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.message this value contains the return message that will be send to dialog flow
 */
async function showEvents(options){
  try{
    var parameters = options.parameters
    var name = parameters.name
    var period = parameters.period
    var filter = ""
    var url = ""
    if (name){
      filter = "$filter=startswith(subject,'" + name + "')"
      url = textResponses.graphRequests.fullEvents
    }else if (period){
      period = period.split("/")
      filter = "startdatetime=" + moment(period[0], "YYYY-MM-DDT00:00:00.000").add(-parseFloat(options.userTimezone.time), "hours").format("YYYY-MM-DDTHH:mm:ss.000") + "Z" +
              "&enddatetime=" + moment(period[1], "YYYY-MM-DDT00:00:00.000").add((24+(-parseFloat(options.userTimezone.time))), "hours").format("YYYY-MM-DDTHH:mm:ss.000") + "Z" // Here are added 30 hours to get end of the day 23:59 in UTC format
      url = textResponses.graphRequests.calendarView
    }else{
      
      filter = "startdatetime=" + moment().startOf("day").add(-parseFloat(options.userTimezone.time), "hours").format("YYYY-MM-DDTHH:mm:ss.000") + "Z" +
              "&enddatetime=" + moment().startOf("day").add(24+(-parseFloat(options.userTimezone.time)), "hours").format("YYYY-MM-DDTHH:mm:ss.000") + "Z"
      url = textResponses.graphRequests.calendarView
    }
    options = await graphEventRequest(url + filter,options)
    return options;
  }
  catch(err){
    console.log(err)
  }
  
}


async function graphEventRequest(request,options){
  let promise = new Promise((resolve, reject) => {
    axios.get(request, {
      headers : {
        "Content-Type":
        "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + options.access_token }
    })
    .then((response) => {
      var events = response.data.value
      if (events.length > 0){
        options.message =  textResponses.showEvents.initialMessage
        events.forEach((event) => {
          
          options.message += generateEventBody(event.subject,options.userTimezone,event.start.dateTime,event.end.dateTime,event.organizer.emailAddress.name)
        })
        resolve("Success")
      }else{ 
        options.message =  textResponses.showEvents.emptyAgenda
        resolve("Success")
      }
    })
    .catch((error) => {
      reject("error")
      console.log(error)
    })
  })
  await promise 
  return options
}
function generateEventBody(subject,timeZone,start,end,organizer){
            var result = "\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\nSubject        : "    + subject +"\n"
            result += "Date           : "  + moment(start).add(timeZone.time, "hours").format("DD-MM-YYYY")+"\n"
            result += "Starts at      : "  + commons.parseDate(start,timeZone) +"\n"
            result += "Ends at        : "    + commons.parseDate(end,timeZone) +"\n"
            result += "Location       :  to be announced \n" //locations are not supported
            result += "Organizer      : "  + organizer
            return result
}
exports.showEventsOnDate = showEventsOnDate
exports.userData = userData
exports.scheduleMeeting = scheduleMeeting
exports.showEvents = showEvents
exports.PreFindMeetingTimes = PreFindMeetingTimes
exports.showEventDetails = showEventDetails
