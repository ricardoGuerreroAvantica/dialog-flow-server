var requestUtil = require('../requestUtil.js');
var authHelper = require('../authHelper.js');
var commons = require('./commons.js');

var axios = require('axios');
var moment = require('moment');

function createEvent(req, res, sessionContext, token) {
  var invitesContext = getContext(req.body.result.contexts, 'invites');
  var eventContext = getContext(req.body.result.contexts, 'createevent');
  var name = eventContext.parameters.eventName ? eventContext.parameters.eventName : '';
  var date = eventContext.parameters.date ? eventContext.parameters.date : '';
  var startTime = eventContext.parameters.time ? eventContext.parameters.time : '';
  var duration = eventContext.parameters.duration ? eventContext.parameters.duration : '';
  var invites = invitesContext.parameters.invites ? invitesContext.parameters.invites : [];
  //30 MINUTES PER REUNION
  var endTime;

  if (duration.unit === 'h'){
    endTime = moment(startTime, 'HH:mm:ss').add( duration.amount, 'hours').format('HH:mm:ss');
  }
  else if (duration.unit === 'min'){
    endTime = moment(startTime, 'HH:mm:ss').add( duration.amount, 'minutes').format('HH:mm:ss'); 
  }
  else {
    endTime = moment(startTime, 'HH:mm:ss').add('30', 'minutes').format('HH:mm:ss');
  }
  authHelper.wrapRequestAsCallback(token.REFRESH_TOKEN_CACHE_KEY, {
    onSuccess: function (results) {
      var body = {
        "subject": name, "attendees": invites,
        "start": { "dateTime": date + 'T' + startTime + '.000Z', "timeZone": "Central Standard Time" },
        "end": { "dateTime": date + 'T' + endTime + '.000Z', "timeZone": "Central Standard Time" }
      }
      requestUtil.postData('graph.microsoft.com','/v1.0/me/events', results.access_token, JSON.stringify(body),
        (e, response) => {
          var message = JSON.stringify(response);
          var speech = '';

          return res.json({
            speech: speech, displayText: message, source: "dialog-server-flow", contextOut : [ sessionContext ]
          });
        }
      );

    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
    }

  });

}



function invitePerson(req, res, sessionContext, token) {
  var userData = {
    name : req.body.result && req.body.result.parameters.name ? req.body.result.parameters.name : '',
    lastname : req.body.result && req.body.result.parameters.lastname ? req.body.result.parameters.lastname : '',
    email : req.body.result && req.body.result.parameters.email ? req.body.result.parameters.email : ''
  }

  searchUser(req, res, token, userData, (user) => {
    authHelper.wrapRequestAsCallback(token.REFRESH_TOKEN_CACHE_KEY, {
      onSuccess: function (results) {

        var invitesContext = getContext(req.body.result.contexts, 'invites');
        var invite = { "emailAddress": { "address":user.mail, "name": user.displayName }, "type": "required" }
        if (Object.keys(invitesContext).length === 0){
          invitesContext = { "name": "invites", "parameters": { "invites" : [] }, "lifespan": 10 }
        }
        invitesContext.parameters.invites.push(invite);

        return res.json({
          speech: user.displayName + ' was invited', displayText: user.displayName + ' was invited', source: "dialog-server-flow",
          contextOut : [ sessionContext, invitesContext]
        });

      },
      onFailure: function (err) {
        res.status(err.code);
        console.log(err.message);
      }
    });

  });
}


function checkUserAvailable(req, res, sessionContext, token) {
  var userData = {
    name : req.body.result && req.body.result.parameters.name ? req.body.result.parameters.name : '',
    lastname : req.body.result && req.body.result.parameters.lastname ? req.body.result.parameters.lastname : '',
    email : req.body.result && req.body.result.parameters.email ? req.body.result.parameters.email : ''
  }
  var duration = req.body.result && req.body.result.parameters.duration ? req.body.result.parameters.duration : '';
  var date = req.body.result.parameters.date;
  var time = req.body.result.parameters.time;

  searchUser(req, res, token, userData, (user) => {

    authHelper.wrapRequestAsCallback(token.REFRESH_TOKEN_CACHE_KEY, {
      onSuccess: function (results) {
        var postBody = {
          attendees: commons.getAttendees([user]),
          timeConstraint : commons.getTimeConstraint(date, time),
          meetingDuration : 'PT1H'
        };

        requestUtil.postData('graph.microsoft.com','/v1.0/me/findMeetingTimes', results.access_token, JSON.stringify(postBody),
          (e, response) => {
            var message, speech = '';
            if (response.meetingTimeSuggestions.length == 0){
              message, speech = "Sorry couldn't find any space";
            }else {
              message = user.displayName + " is available at: \n";
              speech = "I found some space, look at these";
              for (var i in response.meetingTimeSuggestions){
                var slot = response.meetingTimeSuggestions[i].meetingTimeSlot;
                message += commons.parseDate(slot.start.dateTime) + ' - ' + commons.parseDate(slot.end.dateTime) + '\n';
              }
            }

            return res.json({
              speech: speech, displayText: message, source: "dialog-server-flow", contextOut : [ sessionContext ]
            });
          }
        );

      },
      onFailure: function (err) {
        res.status(err.code);
        console.log(err.message);
      }
    });

  });
}



function searchUser(req, res, token, userData, callback){
  authHelper.wrapRequestAsCallback(token.REFRESH_TOKEN_CACHE_KEY, {

    onSuccess: function (results) {
      var name = (userData.name) ? userData.name : ''
      var filter = '$filter=';
      if (userData.email){
        filter += "startswith(mail,'" + userData.email + "')";
      }else {
        filter += (userData.name) ? "startswith(displayName,'" + userData.name + "')" : '';
        filter += (userData.lastname) ? " and startswith(surname,'" + userData.lastname + "')" : '';
      }

      axios.get('https://graph.microsoft.com/v1.0/users?' + filter, {
        headers : {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + results.access_token
        }
      })

      .then((response) => {
        if (response.data.value.length > 1){
        var message = "I found these users with that name \n \n";
        for (var i in response.data .value){
          message += response.data.value[i].displayName + " " + response.data.value[i].surname + "\n";
          message += "Email: " + response.data.value[i].mail + "\n \n";
        }
        return res.json({
          speech: message,
          displayText: message,
          source: "dialog-server-flow"
        });
        }else if (!response.data.value.length){
          return res.json({
            speech: "Can't find someone with that name",
            displayText: "Can't find someone with that name",
            source: "dialog-server-flow"
          });
        }else {
          callback({
              displayName : response.data.value[0].displayName,
              givenName : response.data.value[0].givenName,
              mail : response.data.value[0].mail,
              surname : response.data.value[0].surname,
            });
        }
      })
      .catch((error) => {
        console.log("Search user error " + error);
        console.log(error);
      });
    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
    }
  });
}


function addMinutes(time, minsToAdd) {
  function D(J){ return (J<10? '0':'') + J;};
  var piece = time.split(':');
  var mins = piece[0]*60 + +piece[1] + +minsToAdd;

  return D(mins%(24*60)/60 | 0) + ':' + D(mins%60);
}


exports.invitePerson = invitePerson;
exports.checkUserAvailable = checkUserAvailable;
exports.createEvent = createEvent;
