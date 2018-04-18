var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');

function findMeetingTimes(req, res, options, callback){
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
  console.log('findMeetingTimes.options.pre.httpCall : ' + JSON.stirngify(options));
  request.postData('graph.microsoft.com','/v1.0/me/findMeetingTimes', options.access_token, JSON.stringify(postBody), (error, response) => {
    if (error){
      console.log('findMeetingTimes.options : ' + JSON.stirngify(error));
      errorHandler.actionError(error);
    }

    options.message = `
      I found some space, look at these \n\n
      --------------------------------- \n\n
      ${meetings.map(meeting => `${meeting.start.dateTime} - ${meeting.end.dateTime} \n\n`)}
      `;
    options.speech = 'I found some space, look at these';

    callback(options);
  });

}

exports.findMeetingTimes = findMeetingTimes;
