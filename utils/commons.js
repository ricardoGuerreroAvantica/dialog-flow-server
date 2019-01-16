var moment = require('moment');
var axios = require('axios');

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


function getDate(date, time, extraTime,isSubstraction){
  try {
      var format = 'YYYY-MM-DDTHH:mm:ss.SSS';
      if (isSubstraction){
        var extraValue = 6 - extraTime;
        newDate = moment(date+' '+time).add(extraValue,"hours").format(format);
        return newDate
      }
      else{
        var extraValue =  6 +  extraTime;
        newDate = moment(date+' '+time).add(extraValue,"hours").format(format);
        return newDate
      }
  }
  catch(err) {
      console.log(err);
  }
}


function getTimeConstraint(date, time, startTimeMargin, endTimeMargin){
  var startDate = getDate(date, time,startTimeMargin,true);
  var endDate = getDate(date, time,endTimeMargin,false);
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

function parseDate(date){
 var newDate = moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').subtract(6, 'hours')  
 return moment(newDate, 'YYYY-MM-DDThh:mm:ss.SSS').format('LT');
}

function getTimeZone(access_token){
  axios.get("https://graph.microsoft.com/v1.0/me/mailboxSettings/timeZone", {
    headers : {
      'Content-Type': 
      'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + access_token
    }
  })
  .then((response) => {
  
    console.log("TIMEZONE RESPONSES"+JSON.stringify(response))
    if (response.data.value.length === 0){
      
    }
    })
}

exports.getTimeZone = getTimeZone;
exports.getChangeLine = getChangeLine;
exports.getContext = getContext;
exports.parseDate = parseDate;
exports.getAttendees = getAttendees;
exports.getTimeConstraint = getTimeConstraint;
