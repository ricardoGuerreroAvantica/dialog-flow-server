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
        console.log("-------"  )
        console.log("ORIGINAL " +moment(date+' '+time).format(format))
        newDate2 = moment(date+' '+time).add(timezoneTime,"hours").format(format);
        console.log("PLUS : "+timezoneTime+" EQUAL: " +newDate2 )
        newDate2 = moment(newDate2).subtract(extraTime,"hours").format(format);
        console.log("MINUS : " +extraTime+" EQUAL: " +newDate2 )


        var extraValue = 6 - extraTime;
        newDate = moment(date+' '+time).add(extraValue,"hours").format(format);
        return newDate
      }
      else{
        console.log("-------"  )
        console.log("ORIGINAL" +moment(date+' '+time).format(format))
        newDate2 = moment(date+' '+time).add(timezoneTime,"hours").format(format);
        console.log("PLUS : "+timezoneTime+" EQUAL: " +newDate2 )
        newDate2 = moment(newDate2).add(extraTime,"hours").format(format);
        console.log("PLUS : " +extraTime+" EQUAL: " +newDate2 )

        var extraValue =  6 +  extraTime;
        newDate = moment(date+' '+time).add(extraValue,"hours").format(format);
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
  console.log("timezone is here="+JSON.stringify(timezone)+"NEW TIMEZONE" + moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').add(parseInt(timezone.time), 'hours'))
  var newDate = moment(date, 'YYYY-MM-DDThh:mm:ss.SSS').add(parseInt(timezone.time), 'hours') 
  return moment(newDate, 'YYYY-MM-DDThh:mm:ss.SSS').format('LT');
}


exports.getChangeLine = getChangeLine;
exports.getContext = getContext;
exports.parseDate = parseDate;
exports.getAttendees = getAttendees;
exports.getTimeConstraint = getTimeConstraint;
