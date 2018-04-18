var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');

function findMeetingTimes(req, res){
  var parameters = req.body.result.parameters;
  var duration = parameters.duration;
  var date = parameters.date;
  var time = parameters.time;
  var user = this.options.user;

  var postBody = {
    attendees: commons.getAttendees([user]),
    timeConstraint : commons.getTimeConstraint(date, time),
    meetingDuration : 'PT1H'
  };
  console.log('findMeetingTimes.options.pre : ' + JSON.stirngify(this));
  request.postData('graph.microsoft.com','/v1.0/me/findMeetingTimes', this.options.access_token, JSON.stringify(postBody), (error, response) => {
    if (error){
      console.log('findMeetingTimes.options : ' + JSON.stirngify(error));
      errorHandler.actionError(error);
    }
    var options = {
      response : response,
      source : this.options.source
    }
    this.message = `
      I found some space, look at these \n\n
      --------------------------------- \n\n
      ${meetings.map(meeting => `${meeting.start.dateTime} - ${meeting.end.dateTime} \n\n`)}
      `;
    this.speech = 'I found some space, look at these';
    console.log('findMeetingTimes.options : ' + JSON.stirngify(this));
  });

}

exports.findMeetingTimes = findMeetingTimes;
