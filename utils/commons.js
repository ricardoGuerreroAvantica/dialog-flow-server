var moment = require('moment');

function getContext(contexts, name){
  console.log("Inside context function: "+ JSON.stringify(contexts))
  for (var i in contexts){
    if (contexts[i].name === name){
      return contexts[i];
    }
  }
  return undefined;
}

function getChangeLine(source){
  if (source == "ios"){
    return '\n';
  }
  else{
    return "\n\n"
  }
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


function getTimeConstraint(date, time, startTimeMargin, endTimeMargin){
  console.log("DATES")

  var newDate = moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').subtract(6, 'hours');
  console.log("UTC_DATE: "+newDate)

  var startDate = moment(newDate, 'YYYY-MM-DDThh:mm:ss.SSS').subtract(startTimeMargin, 'hours');
  console.log("START_MEETINGDATE :" + startDate)

  var endDate = moment(newDate, 'YYYY-MM-DDThh:mm:ss.SSS').subtract(startTimeMargin, 'hours');
  console.log("START_MEETINGDATE :" + endDate)

  console.log("START TIMER: " + date + 'T' + startTime);
  console.log("END TIMER: " + date + 'T' + endTime);

  var startDate = date + 'T' + startTime ;
  var endDate = date + 'T' + endTime ;

  var result = {
    "timeslots": [
      {
        "start": {
          "dateTime": startDate,
          "timeZone": "UTC"
        },
        "end": {
          "dateTime": endDate,
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
 //

 
 console.log("NEW DATE");
 console.log(date)
 var newDate = moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').subtract(6, 'hours')
 console.log(newDate)
 var time = moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').subtract(6, 'hours').format('kk:mm')
 console.log(time);
  return moment(newDate, 'YYYY-MM-DDThh:mm:ss.SSS').format('MMM DD') + ' at ' +
    moment(newDate, 'YYYY-MM-DDThh:mm:ss.SSS').format('kk:mm');
}

exports.getChangeLine = getChangeLine;
exports.getContext = getContext;
exports.parseDate = parseDate;
exports.getAttendees = getAttendees;
exports.getTimeConstraint = getTimeConstraint;
