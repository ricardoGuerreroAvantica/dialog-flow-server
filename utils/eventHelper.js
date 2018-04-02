var requestUtil = require('../requestUtil.js');
var authHelper = require('../authHelper.js');
var commons = require('./commons.js');

var axios = require('axios');
var moment = require('moment');

function createEvent(req, res, sessionTokens) {
  var invitesContext = commons.getContext(req.body.result.contexts, 'invites');
  var eventContext = commons.getContext(req.body.result.contexts, 'createevent');
  var name = eventContext.parameters.eventName;
  var invites = invitesContext.parameters.invites;
  var duration = eventContext.parameters.duration;
  var date = eventContext.parameters.date;
  var time = eventContext.parameters.time;

  var startDate = startDate = moment.utc(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss');
  var endDate;

  if (duration.unit === 'h')
    endDate = moment.utc(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss').add(duration.amount, 'hours').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss');
  else if (duration.unit === 'min')
    endDate = moment.utc(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss').add(duration.amount, 'minutes').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss');
  else
    endDate = moment.utc(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss').add('30', 'minutes').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss');

  authHelper.wrapRequestAsCallback(sessionTokens.REFRESH_TOKEN_CACHE_KEY, {
    onSuccess: function (results) {
      var body = {
        "subject": name, "attendees": invites,
        "start": { "dateTime": startDate + '.000Z', "timeZone": "UTC" },
        "end": { "dateTime": endDate + '.000Z', "timeZone": "UTC" }
      }
      console.log(JSON.stringify(body, null, 2));

      requestUtil.postData('graph.microsoft.com','/v1.0/me/events', results.access_token, JSON.stringify(body), (e, response) => {
        var message = response.subject + 'created\n';
        var speech = 'Subject: ' + response.subject + '\n';
        speech += 'Starts at: ' + commons.parseDate(response.start.dateTime) + '\n';
        speech += 'Ends at: ' + commons.parseDate(response.end.dateTime) + '\n';
        if (response.location.displayName)
          speech += 'Location: ' + response.location.displayName + '\n';
        else
          speech += 'Location: to be announced' + '\n';
        speech += 'Organizer: ' + response.organizer.emailAddress.name + '\n';

        return res.json({
          speech: speech,
          displayText: message,
          source: "dialog-server-flow"
        });
      });
    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
      return res.json({
        error : {
          name : 'State error',
          description : err.message,
        }
      });
    }
  });

}



function invitePerson(req, res, sessionTokens) {
  var userData = { name : req.body.result.parameters.name, lastname : req.body.result.parameters.lastname, email : req.body.result.parameters.email }

  searchUser(req, res, sessionTokens, userData, (user) => {

    authHelper.wrapRequestAsCallback(sessionTokens.REFRESH_TOKEN_CACHE_KEY, {
      onSuccess: function (results) {
        var invitesContext = commons.getContext(req.body.result.contexts, 'invites');
        var invite = { "emailAddress": { "address":user.mail, "name": user.displayName }, "type": "required" }

        if (!invitesContext){
          invitesContext = { "name": "invites", "parameters": { "invites" : [] }, "lifespan": 10 }
        }
        invitesContext.parameters.invites.push(invite);

        return res.json({
          speech: user.displayName + ' was invited', displayText: user.displayName + ' was invited', source: "dialog-server-flow",
          contextOut : [invitesContext]
        });

      },
      onFailure: function (err) {
        res.status(err.code);
        console.log(err.message);
        return res.json({
          error : {
            name : 'State error',
            description : err.message,
          }
        });
      }
    });
  });

}


function checkUserAvailable(req, res, sessionTokens) {
  var userData = { name : req.body.result.parameters.name, lastname : req.body.result.parameters.lastname, email : req.body.result.parameters.email }
  var duration = req.body.result.parameters.duration;
  var date = req.body.result.parameters.date;
  var time = req.body.result.parameters.time;

  searchUser(req, res, sessionTokens, userData, (user) => {

    authHelper.wrapRequestAsCallback(sessionTokens.REFRESH_TOKEN_CACHE_KEY, {
      onSuccess: function (results) {
        var postBody = {
          attendees: commons.getAttendees([user]),
          timeConstraint : commons.getTimeConstraint(date, time),
          meetingDuration : 'PT1H'
        };

        requestUtil.postData('graph.microsoft.com','/v1.0/me/findMeetingTimes', results.access_token, JSON.stringify(postBody), (e, response) => {
            var message, speech = '';
            if (response.meetingTimeSuggestions.length == 0){
              message, speech = "Sorry couldn't find any space";
            }else {
              speech = user.displayName + " is available at: \n";
              message = "I found some space, look at these";
              for (var i in response.meetingTimeSuggestions){
                var slot = response.meetingTimeSuggestions[i].meetingTimeSlot;
                speech += commons.parseDate(slot.start.dateTime) + ' - ' + commons.parseDate(slot.end.dateTime) + '\n';
              }
            }
            return res.json({
              speech: speech,
              displayText: message,
              source: "dialog-server-flow"
            });
          }
        );

      },
      onFailure: function (err) {
        res.status(err.code);
        console.log(err.message);
        return res.json({
          error : {
            name : 'State error',
            description : err.message,
          }
        });
      }
    });

  });
}



function searchUser(req, res, sessionTokens, userData, callback){

  authHelper.wrapRequestAsCallback(sessionTokens.REFRESH_TOKEN_CACHE_KEY, {
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
        return res.json({
          error : {
            name : 'State error',
            description : err.message,
          }
        });
      });
    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
      return res.json({
        error : {
          name : 'State error',
          description : err.message,
        }
      });
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
