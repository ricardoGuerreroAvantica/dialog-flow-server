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
  var startDate = moment.utc(date, 'YYYY-MM-DD HH:mm:ss').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss');

  if (duration.unit === 'h') duration.unit = 'hours';
  else if(duration.unit === 'min') duration.unit = 'minutes';
  var endDate = moment.utc(date, 'YYYY-MM-DD HH:mm:ss').add(duration.amount, duration.unit)
      .utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss');
  var body = {
    "subject": name,
    "attendees": invites,
    "start": { "dateTime": startDate + '.000Z', "timeZone": "UTC" },
    "end": { "dateTime": endDate + '.000Z', "timeZone": "UTC" }
  }
  //console.log('scheduleMeeting.body :' + JSON.stringify(body, null, 2));

  request.postData('graph.microsoft.com','/v1.0/me/events', options.access_token, JSON.stringify(body), (error, response) => {
    if (error){
      //console.log('scheduleMeeting.error : ' + JSON.stringify(error));
      errorHandler.actionError(error);
    }

    //console.log('scheduleMeeting.response : ' + response);
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



function findMeetingTimes(options, callback){
  var parameters = options.parameters;
  var duration = parameters.duration;
  var date = parameters.date;
  var time = parameters.time;
  var user = options.user;
  var postBody = {
    attendees: commons.getAttendees([user]),
    timeConstraint : commons.getTimeConstraint(date, time),
    meetingDuration : 'PT1H'
  };

  request.postData('graph.microsoft.com','/v1.0/me/findMeetingTimes', options.access_token, JSON.stringify(postBody), (error, response) => {
    if (error){
      console.log('findMeetingTimes.error : ' + JSON.stringify(error));
      errorHandler.actionError(error);
    }
    console.log("RESPONSE :" + JSON.stringify(response))
    var meetings = response.meetingTimeSuggestions;
    console.log('findMeetingTimes.meetings : ' + JSON.stringify(meetings, null, 2));
    if (meetings.length > 0){
      options.message = options.speech = `I found some space, look at these: \n\n`;
      options.message += '-----------------------' + '\n\n';
      meetings.forEach((meeting) => {
        options.message += commons.parseDate(meeting.meetingTimeSlot.start.dateTime) + ' - ' +
                commons.parseDate(meeting.meetingTimeSlot.end.dateTime) + '\n\n';
      });
      console.log('findMeetingTimes.options : ' + JSON.stringify(options, null, 2));
      callback(options);
    }else{
      if (options.message != ""){
        callback(options);
      }
      else{
        console.log('findMeetingTimes.meetings : empty response' );
        options.message = options.speech = "Sorry couldn't find any space";
        callback(options);
      }
    }

  });
}


function showEvents(options, callback){
  var parameters = options.parameters;
  var name = parameters.name;
  var period = parameters.period;
  var filter = '';
  var url = '';

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
            '&enddatetime=' + moment().endOf('month').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z';
    url = 'https://graph.microsoft.com/v1.0/me/calendarview?';
  }
  //console.log('showEvents.filter : ' + 'https://graph.microsoft.com/v1.0/me/calendarview?' + filter);
  //console.log("SHOW EVENT TOKEN: " + options.access_token);
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
      options.message = options.speech = 'Found these events: \n\n';
      events.forEach((event) => {
        options.message += '-----------------------' + '\n\n';
        options.message += 'Subject        : '    + event.subject + '\n\n';
        options.message += 'Starts at      : '  + commons.parseDate(event.start.dateTime) + '\n\n';
        options.message += 'Ends at        : '    + commons.parseDate(event.end.dateTime) + '\n\n';
        options.message += 'Location       : '   + ((event.location.displayName) ? event.location.displayName : 'Location: to be announced') + '\n\n';
        options.message += 'Organizer      : '  + event.organizer.emailAddress.name + '\n\n';
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

exports.findMeetingTimes = findMeetingTimes;
exports.scheduleMeeting = scheduleMeeting;
exports.showEvents = showEvents;
