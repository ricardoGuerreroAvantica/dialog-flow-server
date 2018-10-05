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


function getTimeConstraint(date, startTimeMargin, endTimeMargin){

  console.log( moment(date, 'YYYY-MM-DDThh:mm:ss.SSS'))
  var newdate   = moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').add(6, 'hours').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' ;
  var endDate   = moment(newdate, 'YYYY-MM-DDThh:mm:ss.SSS').add(startTimeMargin, 'hours').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' ;
  var startDate = moment(newdate, 'YYYY-MM-DDThh:mm:ss.SSS').subtract(endTimeMargin, 'hours').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' ;

  console.log(newdate + " start: "+ startTimeMargin + "End :" + endTimeMargin)
  console.log("START TIMER: " + startDate);
  console.log("END TIMER: " + endDate);

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
