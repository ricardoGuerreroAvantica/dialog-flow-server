
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
          "timeZone": "Central Standard Time"
        },
        "end": {
          "dateTime": date + 'T23:59:59.000Z',
          "timeZone": "Central Standard Time"
        }
      }
    ]
  }
  return result;
}

function getDuration(duration){
  return 'PT1H';

}


exports.getDuration = getDuration;
exports.getAttendees = getAttendees;
exports.getTimeConstraint = getTimeConstraint;
