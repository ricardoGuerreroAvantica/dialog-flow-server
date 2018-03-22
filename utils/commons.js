var moment = require('moment');

function getContext(contexts, name){
  for (var i in contexts){
    if (contexts[i].name === name){
      return contexts[i];
    }
  }
  return {};
}

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

  /** CONVERT TO UTC
  moment.utc('2018-03-23T06:00:00.016Z', 'YYYY-MM-DDThh:mm:ss.SSS').utcOffset("+05:00").format('YYYY MMM DD - HH : mm : ss')
  */
  return moment.utc(date, 'YYYY-MM-DDThh:mm:ss.SSS').utcOffset("-05:00").format('MMM DD') + ' at ' +
    moment.utc(date, 'YYYY-MM-DDThh:mm:ss.SSS').utcOffset("-05:00").format('kk:mm');
}


exports.getContext = getContext;
exports.parseDate = parseDate;
exports.getAttendees = getAttendees;
exports.getTimeConstraint = getTimeConstraint;
