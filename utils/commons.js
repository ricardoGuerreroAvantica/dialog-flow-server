var moment = require('moment');

function getContext(contexts, name){
  console.log("IgetContext: ")
  for (var i in contexts){
    console.log("is "+name+" equal to "+contexts[i].name + (contexts[i].name === name).toString());
    if (contexts[i].name === name){
      console.log("Selected:  "+contexts[i])
      return contexts[i];
    }
  }
  console.log("notfound")
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


function getDate(date, time, extraTime,isSubstraction,timezoneTime){
  try {
    
      var format = 'YYYY-MM-DDTHH:mm:ss.SSS';
      if (isSubstraction){
        newDate = moment(date+' '+time).utcOffset(-parseInt(timezoneTime)-extraTime).format(format);
        return newDate
      }
      else{
        newDate = moment(date+' '+time).utcOffset(-parseInt(timezoneTime)+extraTime).format(format);
        return newDate
      }
  }
  catch(err) {
      console.log(err);
  }
}


function getTimeConstraint(date, time, startTimeMargin, endTimeMargin,timezone){
  console.log("timezone is here="+JSON.stringify(timezone))
  var startDate = getDate(date, time,startTimeMargin,true,parseInt(timezone.time));
  var endDate = getDate(date, time,endTimeMargin,false,parseInt(timezone.time));

  console.log("STARTX " +startDate+ " ENDX " +endDate)
  var result = {
    "timeslots": [
      {
        "start": {
          "dateTime": startDate+"Z",
          "timeZone": "UTC"
        },
        "end": {
          "dateTime": endDate+"Z",
          "timeZone": "UTC"
        }
      }
    ]
  }
  return result;


}

function parseDate(date,timezone){
  console.log("time is timezone="+JSON.stringify(timezone))
  var time = timezone.time;
  console.log("time is here="+time)
  console.log("Date is here"+moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').format('LT'))
  console.log("Date plus is here"+ moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').add(parseInt(time), 'hours').format('LT'))


  var newDate = moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').add(parseInt(time), 'hours') 
  return moment(newDate, 'YYYY-MM-DDThh:mm:ss.SSS').format('LT');
}


exports.getChangeLine = getChangeLine;
exports.getContext = getContext;
exports.parseDate = parseDate;
exports.getAttendees = getAttendees;
exports.getTimeConstraint = getTimeConstraint;
