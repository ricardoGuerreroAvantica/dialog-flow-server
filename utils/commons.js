var moment = require('moment');

function getAttendees(invites){
  var result = [];

  for (var i in invites){
    result.push({
      "emailAddress": {
        "address": invites[i].mail,
        "name": invites[i].displayName
      },
      "type": "Required"
    });
  }

  return result;

}

function getTimeConstraint(date, time){

  var result = {
    "timeslots": [
      {
        "start": {
          "dateTime": date + 'T' + time + '.000Z',
          "timeZone": "Central America Standard Time"
        },
        "end": {
          "dateTime": date + 'T23:59:59.000Z',
          "timeZone": "Central America Standard Time"
        }
      }
    ]
  }
  return result;
}

function parseDate(date){
  return moment.utc(date, 'YYYY-MM-DDThh:mm:ss.SSS').local().format('MMM DD') + ' at ' +
    moment.utc(date, 'YYYY-MM-DDThh:mm:ss.SSS').local().format('kk:mm');
}


exports.parseDate = parseDate;
exports.getAttendees = getAttendees;
exports.getTimeConstraint = getTimeConstraint;
