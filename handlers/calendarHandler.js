var request = require('../microsoftGraph/request.js');
var moment = require('moment');
var axios = require('axios');
var commons = require('../utils/commons.js');


function scheduleMeeting(options, callback){
  var invitesContext = commons.getContext(options.contexts, 'invites');
  var eventContext = commons.getContext(options.contexts, 'createevent');
  var invites = (invitesContext && invitesContext.parameters && invitesContext.parameters.invites) || [];
  var name = eventContext.parameters.eventName;
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
    options.message = options.speech = response.subject + ' created' + '\n\n';
    options.message += '-----------------------' + '\n\n';
    options.message += 'Starts at: ' + commons.parseDate(response.start.dateTime) + '\n\n' +
          'Ends at: ' + commons.parseDate(response.end.dateTime) + '\n\n' +
          ((response.location && response.location.displayName) ? ('Location: ' + response.location.displayName) : 'Location: to be announced') + '\n\n' +
          'Organizer: ' + response.organizer.emailAddress.name + '\n\n';
    if (response.attendees && response.attendees.length > 0){
      options.message += '\n\n';
      options.message += 'Invites: \n\n';
      options.message += '-----------------' + '\n\n';
      response.attendees.forEach((attendee) => {
        options.message += attendee.emailAddress.name + " Email: " + attendee.emailAddress.address + '\n\n';
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
    console.log("_________________________________________________")
    console.log(JSON.stringify(response.data));
    console.log("_________________________________________________")

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
    options.message += options.speech = "Is available at: "+space+"-----------------------"+space;
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
            let timeSet = commons.parseDate(meeting.meetingTimeSlot.start.dateTime) + ' - ' +
                        commons.parseDate(meeting.meetingTimeSlot.end.dateTime) + space;
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
      let space = commons.getChangeLine(options.source);
      if (options.message == "Is available at: "+space+"-----------------------"+space){
        //if FiindingMeetingTimes didnt find any meeting the system will proceed to make another search
        //with more extense time margin:
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
                            commons.parseDate(meeting.meetingTimeSlot.end.dateTime) + space;
              console.log(!options.message.includes(timeSet) +"New message =" + timeSet)       
              if(!options.message.includes(timeSet)){
                options.message += timeSet
              }
            });
            console.log("Meeetings: " + JSON.stringify(meetings));
            callback(options);
          }else{
            console.log("Didnt find any available time at:" + time);
              options.message += "Didn't find any available slot in the calendar, can you try again with other time?"
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
  filter = 'startdatetime=' + date+('T00:00:00.000Z') +
            '&enddatetime=' + date+('T23:59:59.000Z');
  url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
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
      options.message = options.speech = 'Found these events:'+space;
      events.forEach((event) => {
        options.message += '-----------------------' +space;
        options.message += 'Subject        : '    + event.subject +space;
        options.message += 'Starts at      : '  + commons.parseDate(event.start.dateTime) +space;
        options.message += 'Ends at        : '    + commons.parseDate(event.end.dateTime) +space;
        options.message += 'Location       : '   + ((event.location.displayName) ? event.location.displayName : 'Location: to be announced') + '\n\n';
        options.message += 'Organizer      : '  + event.organizer.emailAddress.name +space;
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
    filter = 'startdatetime=' + moment(period[0], 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' +
            '&enddatetime=' + moment(period[1], 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z';
    url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
  }else{
    filter = 'startdatetime=' + moment().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' +
            '&enddatetime=' + moment().endOf('week').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z';
    url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
  }
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
      options.message = options.speech = 'Found these events:'+space;
      events.forEach((event) => {
        options.message += '-----------------------' +space;
        options.message += 'Subject        : '    + event.subject +space;
        options.message += 'Starts at      : '  + commons.parseDate(event.start.dateTime) +space;
        options.message += 'Ends at        : '    + commons.parseDate(event.end.dateTime) +space;
        options.message += 'Location       : '   + ((event.location.displayName) ? event.location.displayName : 'Location: to be announced') + '\n\n';
        options.message += 'Organizer      : '  + event.organizer.emailAddress.name +space;
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
