var moment = require('moment');

function getContext(contexts, name){
  for (var i in contexts){
    if (contexts[i].name === name){
      return contexts[i];
    }
  }
  return undefined;
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

  var startDate = moment.utc(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss');
  var endDate = moment.utc(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss').add('2', 'hours').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss');
  console.log("TIIIIMEEEE" + date + 'T' + time + '.000Z');
  var result = {
    "timeslots": [
      {
        "start": {
          "dateTime": startDate + '.000Z',
          "timeZone": "UTC"
        },
        "end": {
          "dateTime": endDate + '.000Z',
          "timeZone": "UTC"
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
