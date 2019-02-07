var request = require('../microsoftGraph/request.js');
var moment = require('moment');
var axios = require('axios');
var commons = require('../utils/commons.js');
var timezoneHandler =require("./../handlers/timezoneHandler.js")

/**
 * dialogflow replace " ' and '' with different values to represent them, this function return the message 
 * to it original characters.
 * @param {string} name contains all the current invitations of the event.
 */
function replaceSpecialCharacteres(name){
  name = name.replace("&quot;","\"");
  name = name.replace("quot;","\"");
  name = name.replace("&quot","\"");
  name = name.replace("&apos;","\'");
  name = name.replace("apos;","\'");
  name = name.replace("&apos","\'");
  return name;
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
    var eventContext = commons.getContext(options.contexts, 'createevent');
    var name = eventContext.parameters.eventName;
    name = replaceSpecialCharacteres(name);
    var duration = eventContext.parameters.duration || {amount : 1, unit : 'hours'};
    var date = eventContext.parameters.date + ' ' + eventContext.parameters.time;
    var startDate = moment.utc(date, 'YYYY-MM-DD HH:mm:ss').format('L');
    var startTime = moment.utc(date, 'YYYY-MM-DD HH:mm:ss').format('h:mm a');
    if(options.source== 'ios'){
      var message = "The event : "+name + ', will be created on ' +startDate+ '\nAt: ' + startTime  + " with a duration of: "+  duration.amount +" "+ duration.unit+"."+ '\n';
    }
    else{
      var message = "The event : *"+name + '*, will be created on *' +startDate+ '*\nAt: *' + startTime  + "* with a duration of: *"+  duration.amount +" "+ duration.unit+"*."+ '\n';
    }
    if (options.simpleInfo==true){
      message += '¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯'+'\n' +"Remember You can:"+'\n'+"▶ Change the name, date, time or duration of the event."+'\n'+"▶ Make some invites."+'\n\n'+"If you want to finish the creation, say \"Done\" or ask me for \"Help\" for more information."
    }
    

    else{
      message += '\n' +'¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯'+'\n';
      message += "Your invites:"+'\n';
      var invitesContext = commons.getContext(options.contexts, 'invites');
      console.log("invites contexts"+JSON.stringify(invitesContext))

      if (!invitesContext){
        message += "There are no invitations yet.";
        options.message = message;
        callback(options);
      }
      
      console.log("Contexts"+JSON.stringify(options.contexts))
      var invites = invitesContext.parameters.invites;
      if(invites!== undefined){
        invites.forEach((invite) => {
          message += invite.emailAddress.name + " Email: " + invite.emailAddress.address + '\n';
        });
      }
    }
    console.log(JSON.stringify(options.contexts))
    options.message = message;
    callback(options)
  }
  catch(error){
    console.log("error in : function showEventDetails" + error);
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
    
    var invitesContext = commons.getContext(options.contexts, 'invites');
    var eventContext = commons.getContext(options.contexts, 'createevent');
    var invites = (invitesContext && invitesContext.parameters && invitesContext.parameters.invites) || [];
    var name = replaceSpecialCharacteres(eventContext.parameters.eventName);
    var duration = eventContext.parameters.duration || {amount : 1, unit : 'hours'};
    var date = eventContext.parameters.date + ' ' + eventContext.parameters.time;
    var startDate = moment.utc(date, 'YYYY-MM-DDThh:mm:ss.SSS').add(-parseFloat(options.userTimezone.time), 'hours').format('YYYY-MM-DDTHH:mm:ss');
    var endDate = moment.utc(date, 'YYYY-MM-DDThh:mm:ss.SSS').add(-parseFloat(options.userTimezone.time), 'hours').add(duration.amount, duration.unit).format('YYYY-MM-DDTHH:mm:ss');
    if (duration.unit === 'h') duration.unit = 'hours';
    else if(duration.unit === 'min') duration.unit = 'minutes';
    var body = {
      "subject": name,
      "attendees": invites,
      "start": { "dateTime": startDate + '.000Z', "timeZone": "UTC" },
      "end": { "dateTime": endDate + '.000Z', "timeZone": "UTC" }
    }
    console.log(JSON.stringify(body))
    request.postData('graph.microsoft.com','/v1.0/me/events', options.access_token, JSON.stringify(body), (error, response) => {
      if (error){
        console.log('scheduleMeeting.error : ' + JSON.stringify(error));
        errorHandler.actionError(error);
        reject("Error in scheduleMeeting")
      }
      options.message = options.speech = response.subject + ' created' + '\n';
      options.message += '¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯' + '\n';
      options.message += 'Starts at: ' + commons.parseDate(response.start.dateTime,options.userTimezone) + '\n' +
            'Ends at: ' + commons.parseDate(response.end.dateTime,options.userTimezone) + '\n' +
            'Location: ' +((response.location && response.location.displayName) ? (response.location.displayName) : 'to be announced') + '\n' +
            'Organizer: ' + response.organizer.emailAddress.name + '\n';
      if (response.attendees && response.attendees.length > 0){
        options.message += '\n';
        options.message += 'Invites: \n\n';
        response.attendees.forEach((attendee) => {
          options.message += attendee.emailAddress.name + " Email: " + attendee.emailAddress.address + '\n';
        });
      }

      eventContext.lifespan = 0;
      if (invitesContext)
        invitesContext.lifespan = 0;
      resolve("Success");
    });
  });
  await promise;
}

/**
 * This function is in charge of getting the basic information of the user
 * @param {JSON} options.userName contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.access_token contains the token generated with the user credentials to access microsoft graph
 */
async function userData(options){
  let promise = new Promise((resolve, reject) => {
    axios.get('https://graph.microsoft.com/v1.0/me', {
      headers : {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + options.access_token
      }
    })
    .then((response) => {
      options.userName = response.data.displayName;
      resolve("Success");
    })
    .catch((error) => {
      console.log('showLocations.error : ' + error);
      reject("Error");
    });;
  });
  await promise
  return options
}


/**
 * This function takes the information(email, name, lastname) of the employee that the user is asking for, and 
 * make a request to microsoft graph to check if this user exists in the avantica user database.
 * @param {JSON} options.parameters contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.user contains the token generated with the user credentials to access microsoft graph
 */
async function PrefindMeetingTimes(options){
  let promise = new Promise((resolve, reject) => {
    var parameters = options.parameters;
    var date = parameters.date;
    var user = options.user;
    var time = options.parameters.time;
    options.message += options.speech = "I found some space at: "+'\n'+"¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯"+'\n'+"From:"+'\n';
    
    time = options.parameters.time;
    let isOrganizerInRequest = options.user.displayName != options.userName; //Compares if the current user is asking for their availability
    // The postBody is created with the new timerConstraing
    var postBody = {
      attendees: commons.getAttendees([user]),
      timeConstraint : commons.getTimeConstraint(date, time, 0, 2,options.userTimezone),
      isOrganizerOptional: isOrganizerInRequest
    };

    //The request to microsoft 365 is executed here:
      request.postData('graph.microsoft.com','/beta/me/findMeetingTimes', options.access_token, JSON.stringify(postBody), (error, response) => {
        if (error){
          errorHandler.actionError(error);
        }
        var meetings = response.meetingTimeSuggestions;
        if (meetings.length > 0){
          
          //Found open meeting times in the requested TimeConstrain
          meetings.forEach((meeting) => {
            let timeSet = commons.parseDate(meeting.meetingTimeSlot.start.dateTime,options.userTimezone) + ' to ' +
                        commons.parseDate(meeting.meetingTimeSlot.end.dateTime,options.userTimezone) +"."+ '\n';
            if(!options.message.includes(timeSet)){
              options.message += timeSet
            }
          });
          resolve("Success");
        }else{
            //Didnt find any meeting time .
            if(response.emptySuggestionsReason == "Unknown"){
              options.message = "Couldn't access to " + options.user.displayName + " shedule, the calendar of this employee may be restricted at this time."
            }
            else{
              options.message = "Didn't find any available slot in the calendar of "+ options.user.displayName +"."
            }
            resolve("Success");
          }
      })
    });
    await promise;
    return options
    }

/**
 * This function ask for the calendar of the employee and check if there is any free space between two
 * times/dates.
 * @param {JSON} options.parameters contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.user contains the token generated with the user credentials to access microsoft graph
 */
function checkMeetingTimes(options, callback){

      if (options.message == "I found some space at: "+'\n'+"¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯"+'\n'+"From:"+'\n'){
        //if FindingMeetingTimes didn't find any meeting the system will proceed to make another search
        //with more extensive time margin:
        options.message = options.speech = "I didn't found space at the requested time, but I found some space at: "+'\n'+"¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯"+'\n';
        
        var parameters = options.parameters;
        var date = parameters.date;
        var user = options.user;
        var time = options.parameters.time;
        time = options.parameters.time;
        // The postBody is created with the new timerConstraing
        let isOrganizerInRequest = options.user.displayName != options.userName; //Compares if the current user is asking for their availability
        var postBody = {
          attendees: commons.getAttendees([user]),
          timeConstraint : commons.getTimeConstraint(date, time, 2, 4,options.userTimezone),
          isOrganizerOptional: isOrganizerInRequest
        };
        //The request to microsoft 365 is executed here:
        request.postData('graph.microsoft.com','/beta/me/findMeetingTimes', options.access_token, JSON.stringify(postBody), (error, response) => {
          if (error){
            errorHandler.actionError(error);
          }
          var meetings = response.meetingTimeSuggestions;
          if (meetings.length > 0){
            //Found open meeting times in the requested TimeConstrain
            meetings.forEach((meeting) => {
              let timeSet = commons.parseDate(meeting.meetingTimeSlot.start.dateTime,options.userTimezone) + ' to ' +
                            commons.parseDate(meeting.meetingTimeSlot.end.dateTime,options.userTimezone)+"." + '\n';
              if(!options.message.includes(timeSet)){
                options.message += timeSet
              }
            });
            callback(options);
          }
        })
      }
      else{
        callback(options);
      }
}

/**
 * this function is in charge of taking two different dates and show the events between them.
 * @param {JSON} options.parameters contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.message this value contains the return message that will be send to dialog flow
 */
async function showEventsOnDate(options){
  let promise = new Promise((resolve, reject) => {
    var parameters = options.parameters;
    var date = parameters.date;
    var filter = '';
    var url = '';
    console.log(options.userTimezone.time)

    console.log(date+('T00:00:00.000'))
    console.log(moment((date+('T00:00:00.000')), 'YYYY-MM-DDTHH:mm:ss.SSS').format('YYYY-MM-DDThh:mm:ss.SSS'))
    console.log(moment((date+('T00:00:00.000')), 'YYYY-MM-DDTHH:mm:ss.SSS').add(parseFloat(options.userTimezone.time), 'hours'))
    console.log("------------")
    console.log((date+('T23:59:59.000')))
    console.log(moment((date+('T23:59:59.000')), 'YYYY-MM-DDTHH:mm:ss.SSS').format('YYYY-MM-DDTHH:mm:ss.SSS'))
    console.log(moment((date+('T23:59:59.000')), 'YYYY-MM-DDTHH:mm:ss.SSS').add(parseFloat(options.userTimezone.time), 'hours').format('YYYY-MM-DDTHH:mm:ss.SSS'))
    console.log("------------")

    var startDate=moment((date+('T00:00:00.000')), 'YYYY-MM-DDThh:mm:ss.SSS').add(parseFloat(options.userTimezone.time), 'hours').format('YYYY-MM-DDTHH:mm:ss.SSS');
    console.log(startDate)

    var endDate=moment((date+('T23:59:59.000')), 'YYYY-MM-DDThh:mm:ss.SSS').add(parseFloat(options.userTimezone.time), 'hours').format('YYYY-MM-DDTHH:mm:ss.SSS');
    console.log(starendDatetDate)

    filter = 'startdatetime=' + startDate+ 'Z' +
              '&enddatetime=' + endDate+ 'Z';
    url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
    console.log(url + filter)
    axios.get(url + filter, {
      headers : {
        'Content-Type':
        'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + options.access_token }
    })
    .then((response) => {
      var events = response.data.value;
      if (events.length > 0){
        options.message = options.speech = 'Found these events:\n';
        events.forEach((event) => {
          options.message += '\n'+'¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯' +'\n';
          options.message += 'Subject        : '    + event.subject +'\n';
          options.message += 'Date           : '  + moment((date+('T00:00:00.000')), 'YYYY-MM-DDThh:mm:ss.SSS').add(options.userTimezone.time, 'hours').format('DD-MM-YYYY')+'\n';
          options.message += 'Starts at      : '  + commons.parseDate(event.start.dateTime,options.userTimezone) +'\n';
          options.message += 'Ends at        : '    + commons.parseDate(event.end.dateTime,options.userTimezone) +'\n';
          options.message += 'Location       : '   + ((event.location.displayName) ? event.location.displayName : ' to be announced') + '\n';
          options.message += 'Organizer      : '  + event.organizer.emailAddress.name;
        });
        resolve("Success");
      }else{
        options.message = options.speech = 'There is nothing on your agenda';
        resolve("Success");      }
    })
    .catch((error) => {
      reject('showEvents.error : ' + error);
      errorHandler.actionError(error);
    });
  });
  await promise;
}

/**
 * this function ask to microsoft graph for a list of all the current events of the user.
 * @param {JSON} options.parameters contains all the basic user information obtained from microsoft graph
 * @param {JSON} options.message this value contains the return message that will be send to dialog flow
 */
async function showEvents(options){
  var parameters = options.parameters;
  var name = parameters.name;
  var period = parameters.period;
  var filter = '';
  var url = '';
  let promise = new Promise((resolve, reject) => {
      if (name){
        filter = "$filter=startswith(subject,'" + name + "')";
        url = 'https://graph.microsoft.com/v1.0/me/events?';
      }else if (period){
        period = period.split("/");
        filter = 'startdatetime=' + moment(period[0], 'YYYY-MM-DD').format('YYYY-MM-DDT00:00:00.000') + 'Z' +
                '&enddatetime=' + moment(period[1], 'YYYY-MM-DD').add((24+parseFloat(options.userTimezone.time)),'hours').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z'; // Here are added 30 hours to get end of the day 23:59 in UTC format
        url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
      }else{
        console.log((parseFloat(options.userTimezone.time)))
        console.log(moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss.000'))
        console.log(moment().startOf('day').add((parseFloat(options.userTimezone.time)),'hours').format('YYYY-MM-DDTHH:mm:ss.000'))

        console.log(moment().endOf('day').format('YYYY-MM-DDTHH:mm:ss.000'))
        console.log(moment().endOf('day').add((parseInt(options.userTimezone.time)),'hours').format('YYYY-MM-DDTHH:mm:ss.000'))
        
        filter = 'startdatetime=' + moment().startOf('day').add((parseFloat(options.userTimezone.time)),'hours').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' +
                '&enddatetime=' + moment().startOf('day').add(24+(parseFloat(options.userTimezone.time)),'hours').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z';
        url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
      }
      console.log(url +filter)
      axios.get(url + filter, {
        headers : {
          'Content-Type':
          'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + options.access_token }
      })
      .then((response) => {
        var events = response.data.value;
        if (events.length > 0){
          options.message = options.speech = 'Found these events:\n';
          events.forEach((event) => {
            options.message += '\n'+'¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯' +'\n';
            options.message += 'Subject        : '    + event.subject +'\n';
            options.message += 'Date           : '  + moment().format('YYYY-MM-DD')+'\n';
            options.message += 'Starts at      : '  + commons.parseDate(event.start.dateTime,options.userTimezone) +'\n';
            options.message += 'Ends at        : '    + commons.parseDate(event.end.dateTime,options.userTimezone) +'\n';
            options.message += 'Location       : '   + ((event.location.displayName) ? event.location.displayName : ' to be announced') + '\n';
            options.message += 'Organizer      : '  + event.organizer.emailAddress.name;
          });
          resolve("Success");
        }else{
          options.message = options.speech = 'There is nothing on your agenda';
          resolve("Success");
        }
      })
      .catch((error) => {
        reject("error")
        errorHandler.actionError(error);      
      });
  });
  await promise;
}

exports.showEventsOnDate = showEventsOnDate;
exports.userData = userData;
exports.checkMeetingTimes = checkMeetingTimes;
exports.scheduleMeeting = scheduleMeeting;
exports.showEvents = showEvents;
exports.PrefindMeetingTimes = PrefindMeetingTimes;
exports.showEventDetails = showEventDetails;
