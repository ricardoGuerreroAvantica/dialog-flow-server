var request = require('../microsoftGraph/request.js');
var moment = require('moment');
var axios = require('axios');
var commons = require('../utils/commons.js');

function replaceSpecialCharacteres(name){
  name = name.replace("&quot;","\"");
  name = name.replace("quot;","\"");
  name = name.replace("&quot","\"");
  name = name.replace("&apos;","\'");
  name = name.replace("apos;","\'");
  name = name.replace("&apos","\'");
  return name
}




function showEventDetails(options,callback){
  let space = commons.getChangeLine(options.source);
  var eventContext = commons.getContext(options.contexts, 'createevent');
  console.log(JSON.stringify(eventContext));
  console.log("NAME ORIGINAL: " + name)
  var name = eventContext.parameters.eventName;
  name = replaceSpecialCharacteres(name)
  console.log(replaceSpecialCharacteres(name))
  var duration = eventContext.parameters.duration || {amount : 1, unit : 'hours'};
  var date = eventContext.parameters.date + ' ' + eventContext.parameters.time;
  console.log("date: "+date)

  var startDate = moment.utc(date, 'YYYY-MM-DD HH:mm:ss').format('L');
  var startTime = moment.utc(date, 'YYYY-MM-DD HH:mm:ss').format('h:mm a');
  console.log("start: "+startDate)
  if(options.source== 'ios'){
    var message = "The event : "+name + ', will be created on ' +startDate+ '\nAt: ' + startTime  + " with a duration of: "+  duration.amount +" "+ duration.unit+"."+ '\n';
    Console.log(message);
  }
  else{
    var message = "The event : *"+name + '*, will be created on *' +startDate+ '*\nAt: *' + startTime  + "* with a duration of: *"+  duration.amount +" "+ duration.unit+"*."+ '\n';
    console.log(message)
  }
  if (options.simpleInfo==true){
    message += '¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯'+'\n' +"Remember You can:"+'\n'+"▶ Change the name, date, time or duration of the event."+'\n'+"▶ Make some invites."+'\n\n'+"If you want to finish the creation, say \"Done\" or ask me for \"Help\" for more information."
  }
  else{
    message += '\n' +'¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯'+'\n';
    message += "Your invites:"+'\n';
    var invitesContext = commons.getContext(options.contexts, 'invites');
    if (!invitesContext){
      message += "There are no invitations yet.";
      options.message = message;
      callback(options);
    }
    var invites = invitesContext.parameters.invites;
    invites.forEach((invite) => {
      message += invite.emailAddress.name + " Email: " + invite.emailAddress.address + space;
    });
  }
  console.log(message)
  options.message = message;
  callback(options)
}

function scheduleMeeting(options, callback){
  let space = commons.getChangeLine(options.source);
  var invitesContext = commons.getContext(options.contexts, 'invites');
  var eventContext = commons.getContext(options.contexts, 'createevent');
  var invites = (invitesContext && invitesContext.parameters && invitesContext.parameters.invites) || [];
  console.log("NAME ORIGINAL: " + name)
  var name = eventContext.parameters.eventName;
  name = replaceSpecialCharacteres(name)
  console.log(replaceSpecialCharacteres(name))
  var duration = eventContext.parameters.duration || {amount : 1, unit : 'hours'};
  var date = eventContext.parameters.date + ' ' + eventContext.parameters.time;
  var startDate = moment.utc(date, 'YYYY-MM-DD HH:mm:ss').add(6, 'hours').format('YYYY-MM-DDTHH:mm:ss');

  console.log("START DATE" + startDate);
  if (duration.unit === 'h') duration.unit = 'hours';
  else if(duration.unit === 'min') duration.unit = 'minutes';
  var endDate = moment.utc(date, 'YYYY-MM-DD HH:mm:ss').add(6, 'hours').add(duration.amount, duration.unit).format('YYYY-MM-DDTHH:mm:ss');
    console.log("END DATE" + endDate);   
  var body = {
    "subject": name,
    "attendees": invites,
    "start": { "dateTime": startDate + '.000Z', "timeZone": "UTC" },
    "end": { "dateTime": endDate + '.000Z', "timeZone": "UTC" }
  }
  console.log('scheduleMeeting.body :' + JSON.stringify(body));

  request.postData('graph.microsoft.com','/v1.0/me/events', options.access_token, JSON.stringify(body), (error, response) => {
    if (error){
      console.log('scheduleMeeting.error : ' + JSON.stringify(error));
      errorHandler.actionError(error);
    }

    console.log('scheduleMeeting.response : ' + response);
    options.message = options.speech = response.subject + ' created' + '\n';
    options.message += '¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯' + '\n';
    options.message += 'Starts at: ' + commons.parseDate(response.start.dateTime) + '\n' +
          'Ends at: ' + commons.parseDate(response.end.dateTime) + '\n' +
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
    callback(options);
  });
}

//This function is in charge of geeting the basic information of the user
function userData(next,options, callback){
  console.log("START the user autentification:")
  axios.get('https://graph.microsoft.com/v1.0/me', {
    headers : {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + options.access_token
    }
  })
  .then((response) => {
    options.userName = response.data.displayName;
    next(options, callback);
  })
  .catch((error) => {
    console.log('showLocations.error : ' + error);
    next(options, callback);
  });;
}

function PrefindMeetingTimes(next, options, callback){
  let space = commons.getChangeLine(options.source);
  console.log("START FINDING MEETING FUNCTION:")
  console.log(JSON.stringify(options));
  console.log(JSON.stringify(options.parameters));
    //If the function didnt find the requested data-time as available, it will execute the function again with diferent times/
    var parameters = options.parameters;
    var date = parameters.date;
    var user = options.user;
    var time = options.parameters.time;
    console.log("FIRST RUN");
    options.message += options.speech = "I found some space at: "+'\n'+"¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯"+'\n'+"From:"+'\n';
    
    time = options.parameters.time;

    
    console.log("THE TIME USED IS :" + time);
    // The postBody is created with the new timerConstraing
    let isOrganizerInRequest = options.user.displayName != options.userName; //Compares if the current user is asking for their availability
    console.log("PrefindMeetingTimes.isOrganizerInRequest : = " +options.user.displayName +" != "+options.userName)
    var postBody = {
      attendees: commons.getAttendees([user]),
      timeConstraint : commons.getTimeConstraint(date, time, 0, 2),
      isOrganizerOptional: isOrganizerInRequest
    };
    console.log("POST BODY: " + JSON.stringify(postBody))

    //The request to microsoft 365 is executed here:
      request.postData('graph.microsoft.com','/beta/me/findMeetingTimes', options.access_token, JSON.stringify(postBody), (error, response) => {
        if (error){
          errorHandler.actionError(error);
        }
        var meetings = response.meetingTimeSuggestions;
        console.log("MEETINGS: "+ JSON.stringify(meetings));
        if (meetings.length > 0){
          
          //Found open meeting times in the requested TimeConstrain
          meetings.forEach((meeting) => {
            console.log("THE MEETING: " + JSON.stringify(meeting));
            console.log(meeting.meetingTimeSlot.start.dateTime);
            console.log(meeting.meetingTimeSlot.end.dateTime);
            let timeSet = commons.parseDate(meeting.meetingTimeSlot.start.dateTime) + ' to ' +
                        commons.parseDate(meeting.meetingTimeSlot.end.dateTime) + '\n';
            console.log(!options.message.includes(timeSet) +"New message =" + timeSet)        
            if(!options.message.includes(timeSet)){
              options.message += timeSet
            }
          });
          console.log("Meeetings: " + JSON.stringify(meetings));
          next(options,callback);
        }else{
          console.log("Didnt find any available time at:" + time);
          //If didnt find any meeting time at this time just skip to the next time.
            next(options, callback);
        }
      })
    }

function checkMeetingTimes(options, callback){
      if (options.message == "I found some space at: "+'\n'+"¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯"+'\n'+"From:"+'\n'){
        //if FiindingMeetingTimes didnt find any meeting the system will proceed to make another search
        //with more extense time margin:
        options.message = options.speech = "I didn't found space at the requested time, but I found some space at: "+'\n'+"¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯"+'\n';
        
        var parameters = options.parameters;
        var date = parameters.date;
        var user = options.user;
        var time = options.parameters.time;
        time = options.parameters.time;
        console.log("SECOND RUN");
        console.log("THE TIME USED IS :" + time);
        // The postBody is created with the new timerConstraing
        let isOrganizerInRequest = options.user.displayName != options.userName; //Compares if the current user is asking for their availability
        console.log("checkMeetingTimes.isOrganizerInRequest : = " +options.user.displayName +" != "+options.userName)
        var postBody = {
          attendees: commons.getAttendees([user]),
          timeConstraint : commons.getTimeConstraint(date, time, 2, 4),
          isOrganizerOptional: isOrganizerInRequest
        };
        console.log("POST BODY: " + JSON.stringify(postBody))

        //The request to microsoft 365 is executed here:
        request.postData('graph.microsoft.com','/beta/me/findMeetingTimes', options.access_token, JSON.stringify(postBody), (error, response) => {
          if (error){
            errorHandler.actionError(error);
          }
          var meetings = response.meetingTimeSuggestions;
          console.log("MEETINGS: "+ JSON.stringify(meetings));
          if (meetings.length > 0){
            //Found open meeting times in the requested TimeConstrain
            meetings.forEach((meeting) => {
              console.log("THE MEETING: " + JSON.stringify(meeting));
              let timeSet = commons.parseDate(meeting.meetingTimeSlot.start.dateTime) + ' - ' +
                            commons.parseDate(meeting.meetingTimeSlot.end.dateTime) + '\n';
              console.log(!options.message.includes(timeSet) +"New message =" + timeSet)       
              if(!options.message.includes(timeSet)){
                options.message += timeSet
              }
            });
            console.log("Meeetings: " + JSON.stringify(meetings));
            callback(options);
          }else{
            if(response.emptySuggestionsReason == "Unknown"){
              options.message = "Couldn't access to " + options.user.displayName + " calendar, the calendar of this employee may be restricted."
            }
            else{
              console.log("Didnt find any available time at:" + response.emptySuggestionsReason);
              options.message = "Didn't find any available slot in the calendar of "+ options.user.displayName +"."
            }
              callback(options);
          }
        })
      }
      else{
        callback(options);
      }
}


function showEventsOnDate(options, callback){
  var space = commons.getChangeLine();
  var parameters = options.parameters;
  var date = parameters.date;
  var filter = '';
  var url = '';
  var startDate=moment((date+('T00:00:00.000')), 'YYYY-MM-DDThh:mm:ss.SSS').add(6, 'hours').format('YYYY-MM-DDThh:mm:ss.SSS');
  var endDate=moment((date+('T23:59:59.000')), 'YYYY-MM-DDThh:mm:ss.SSS').add(6, 'hours').format('YYYY-MM-DDThh:mm:ss.SSS');
  console.log("Date Start: " +startDate);
  console.log("Date End: " + endDate)
  filter = 'startdatetime=' + startDate+ 'Z' +
            '&enddatetime=' + endDate+ 'Z';
  url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
  console.log(url+filter)
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
        options.message += 'Date           : '  + moment((date+('T00:00:00.000')), 'YYYY-MM-DDThh:mm:ss.SSS').add(6, 'hours').format('DD-MM-YYYY')+'\n';
        options.message += 'Starts at      : '  + commons.parseDate(event.start.dateTime) +'\n';
        options.message += 'Ends at        : '    + commons.parseDate(event.end.dateTime) +'\n';
        options.message += 'Location       : '   + ((event.location.displayName) ? event.location.displayName : ' to be announced') + '\n';
        options.message += 'Organizer      : '  + event.organizer.emailAddress.name;
      });
      console.log('findMeetingTimes.options : ' + JSON.stringify(options, null, 2));
      callback(options);
    }else{
      options.message = options.speech = 'There is nothing on your agenda';
      callback(options);
    }
  })
  .catch((error) => {
    console.log('showEvents.error : ' + error);
    errorHandler.actionError(error);
  });

}


function showEvents(options, callback){
  var space = commons.getChangeLine();
  var parameters = options.parameters;
  var name = parameters.name;
  var period = parameters.period;
  var filter = '';
  var url = '';

  console.log("THE NAME" + name);
  if (name){
    filter = "$filter=startswith(subject,'" + name + "')";
    url = 'https://graph.microsoft.com/v1.0/me/events?';
  }else if (period){
    period = period.split("/");
    filter = 'startdatetime=' + moment(period[0], 'YYYY-MM-DD').format('YYYY-MM-DDT06:mm:ss.000') + 'Z' +
            '&enddatetime=' + moment(period[1], 'YYYY-MM-DD').add(30,'hours').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z'; // Here are added 30 hours to get end of the day 23:59 in UTC format
    url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
  }else{
    filter = 'startdatetime=' + moment().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' +
            '&enddatetime=' + moment().endOf('day').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z';
    url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
  }

  console.log("period" + period);
  console.log('showEvents.filter : ' + 'https://graph.microsoft.com/v1.0/me/calendarview?' + filter);
  console.log("SHOW EVENT TOKEN: " + options.access_token);
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
        options.message += 'Starts at      : '  + commons.parseDate(event.start.dateTime) +'\n';
        options.message += 'Ends at        : '    + commons.parseDate(event.end.dateTime) +'\n';
        options.message += 'Location       : '   + ((event.location.displayName) ? event.location.displayName : ' to be announced') + '\n';
        options.message += 'Organizer      : '  + event.organizer.emailAddress.name;
      });
      //console.log('findMeetingTimes.options : ' + JSON.stringify(options, null, 2));
      callback(options);
    }else{
      options.message = options.speech = 'There is nothing on your agenda';
      callback(options);
    }
  })
  .catch((error) => {
    //console.log('showEvents.error : ' + error);
    errorHandler.actionError(error);
  });
}

exports.showEventsOnDate = showEventsOnDate;
exports.userData = userData;
exports.checkMeetingTimes = checkMeetingTimes;
exports.scheduleMeeting = scheduleMeeting;
exports.showEvents = showEvents;
exports.PrefindMeetingTimes = PrefindMeetingTimes;
exports.showEventDetails = showEventDetails;
