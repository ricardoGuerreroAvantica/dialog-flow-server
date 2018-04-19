var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');

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
  console.log('findMeetingTimes.options.pre.httpCall : ' + JSON.stringify(options));
  request.postData('graph.microsoft.com','/v1.0/me/findMeetingTimes', options.access_token, JSON.stringify(postBody), (error, response) => {
    if (error){
      console.log('findMeetingTimes.options : ' + JSON.stringify(error));
      errorHandler.actionError(error);
    }
    var meetings = response.meetingTimeSuggestions;
    if (meetings.length === 0){
      options.message, options.speech = "Sorry couldn't find any space";
      console.log('findMeetingTimes.options : ' + JSON.stringify(options, null, 2));
      callback(options);
    }else{
      options.message = `
        I found some space, look at these \n\n
        --------------------------------- \n\n
        ${meetings.map(meeting => `${commons.parseDate(meeting.start.dateTime)} - ${commons.parseDate(meeting.end.dateTime)} \n\n`)}
        `;

      options.speech = 'I found some space, look at these';
      console.log('findMeetingTimes.options : ' + JSON.stringify(options, null, 2));
      callback(options);
    }

  });

}

exports.findMeetingTimes = findMeetingTimes;
