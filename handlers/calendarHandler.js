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

  request.postData('graph.microsoft.com','/v1.0/me/findMeetingTimes', options.access_token, JSON.stringify(postBody), (error, response) => {
    if (error){
      console.log('findMeetingTimes.options : ' + JSON.stringify(error));
      errorHandler.actionError(error);
    }

    var meetings = response.meetingTimeSuggestions;
    console.log('findMeetingTimes.meetings : ' + JSON.stringify(meetings, null, 2));
    if (meetings.length === 0){
      options.message, options.speech = "Sorry couldn't find any space";
      callback(options);
    }else{
      options.message = `I found some space, look at these: \n\n`;
      meetings.forEach((meeting) => {
        options.message += commons.parseDate(meeting.meetingTimeSlot.start.dateTime) + ' - ' +
                commons.parseDate(meeting.meetingTimeSlot.end.dateTime) + '\n\n';
      });
      options.speech = 'I found some space, look at these';
      console.log('findMeetingTimes.options : ' + JSON.stringify(options, null, 2));
      callback(options);
    }
    
  });
}

exports.findMeetingTimes = findMeetingTimes;
