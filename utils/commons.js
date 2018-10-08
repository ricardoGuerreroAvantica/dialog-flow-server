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


function getDate(date, time, extraTime,isSubstraction){
  try {
      var times= time.split(':');
      var format = 'LLL';
      console.log('Used time = '+date + time);
      if (isSubstraction){
        var extraValue = 6 - extraTime;
        console.log("extraValue = "+extraValue);
        newDate = moment(date+' '+time).add(extraValue,"hours").format(format);
        console.log('Getted time 2 = '+ newDate);
      }
      else{
        var extraValue =  6 +  extraTime;
        console.log("extraValue = "+extraValue);
        newDate = moment(date+' '+time).add(extraValue,"hours").format(format);
        console.log('Getted time 2 = '+ newDate);
      }
  }
  catch(err) {
      console.log(err);
  }
}


function getTimeConstraint(date, time, startTimeMargin, endTimeMargin){

  console.log('getdatemetod'+date + time);
  console.log('START DATE : ');
  getDate(date, time,startTimeMargin,true);
  console.log('END DATE : ');
  getDate(date, time,endTimeMargin,false);
  var times = time.split(':');
  var endTime;
  var startTime;
  if(parseInt(times[0]) + endTimeMargin <10){
    endTime = ("0" + (parseInt(times[0]) + endTimeMargin).toString() ) + ':00:00.000Z';
  }
  else{
    endTime = ((parseInt(times[0]) + endTimeMargin).toString() ) + ':00:00.000Z';
  }
  if(parseInt(times[0]) - startTimeMargin <10){
    startTime   = ("0" + (parseInt(times[0]) - startTimeMargin).toString())+ ':' + times[1] + ':' + times[2] + '.000Z';
  }
  else{
    startTime   = ((parseInt(times[0]) - startTimeMargin).toString()) + ':' + times[1] + ':' + times[2] + '.000Z';
  }
  


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
