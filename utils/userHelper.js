var authHelper = require('../authHelper.js');
var commons = require('./commons.js');
var moment = require('moment');
var axios = require('axios');

function showAllEvents(req, res, sessionContext, token){

  authHelper.wrapRequestAsCallback(token.REFRESH_TOKEN_CACHE_KEY, {
    onSuccess: function (results) {
      axios.get('https://graph.microsoft.com/v1.0/me/events?$select=subject,body,bodyPreview,organizer,attendees,start,end,location', {
        headers : { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + results.access_token }
      })
      .then((response) => {
        return res.json(parseEvent(response));
      })
      .catch((error) => {
        return res.json({ speech: 'An error ocurred finding all events',
          displayText: 'An error ocurred finding all events', source: "dialog-server-flow" });
      });

    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
    }
  });
}

function showPeriodEvents(req, res, sessionContext, token){

  authHelper.wrapRequestAsCallback(token.REFRESH_TOKEN_CACHE_KEY, {
    onSuccess: function (results) {
      //	2018-03-19/2018-03-25
      var periods = req.body.result.parameters.period.split("/");

      var startDate = moment(periods[0], 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z';
      var endDate = moment(periods[1], 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ss.000') + 'Z';

      axios.get('https://graph.microsoft.com/v1.0/me/calendarview?startdatetime=' + startDate + '&enddatetime='+ endDate, {
        headers : { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + results.access_token }
      })
      .then((response) => {
        return res.json(parseEvent(response));
      })
      .catch((error) => {
        return res.json({ speech: 'An error ocurred finding events',
          displayText: 'An error ocurred finding events', source: "dialog-server-flow" });
      });

    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
    }
  });
}


function showEventsByName(req, res, sessionContext, token){

  authHelper.wrapRequestAsCallback(token.REFRESH_TOKEN_CACHE_KEY, {
    onSuccess: function (results) {
      var name = req.body.result.parameters.name;
      axios.get("https://graph.microsoft.com/v1.0/me/events?$filter=startswith(subject,'" + name +"')", {
        headers : { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + results.access_token }
      })
      .then((response) => {
        return res.json(parseEvent(response));
      })
      .catch((error) => {
        return res.json({ speech: 'An error ocurred finding events called ' + name,
          displayText: 'An error ocurred finding events called ' + name, source: "dialog-server-flow" });
      });

    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
    }
  });
}


function parseEvent(response){
  var message = 'Found these events \n';
  for (var i in response.data.value){
    message += 'Subject: ' + response.data.value[i].subject + '\n';
    //2018-03-16T13:00:00.0000000
    message += 'Starts at: ' + commons.parseDate(response.data.value[i].start.dateTime) + '\n';
    message += 'Ends at: ' + commons.parseDate(response.data.value[i].end.dateTime) + '\n';
    if (response.data.value[i].location.displayName)
      message += 'Location: ' + response.data.value[i].location.displayName + '\n';
    else
      message += 'Location: to be announced' + '\n';
    message += 'Organizer: ' + response.data.value[i].organizer.emailAddress.name + '\n';
    message += '\n';
  }
  return {
    speech: (response.data.value.length > 0) ? 'Found these events for next week' : 'There is nothing on your agenda',
    displayText: (response.data.value.length > 0) ? message : 'There is nothing on your agenda',
    source: "dialog-server-flow"
  };
}


function GetNextWeekStart() {
    var today = moment();
    //edited part
    var daystoMonday = 0 - (today.isoWeekday() - 1) + 7;
    var nextMonday = today.subtract(daystoMonday, 'days');

    return nextMonday;
}

function GetNextWeekEnd() {
    var nextMonday = GetNextWeekStart();
    var nextSunday = nextMonday.add(6, 'days');

    return nextSunday;
}



exports.showPeriodEvents = showPeriodEvents;
exports.showAllEvents = showAllEvents;
exports.showEventsByName = showEventsByName;
