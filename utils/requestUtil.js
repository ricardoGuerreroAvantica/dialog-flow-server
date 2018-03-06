/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
var https = require('https');

const request = require('superagent');

var defaultCheck = {
  "attendees": [
    {
      "emailAddress": {
        "address": "didier.cerdas@avantica.net",
        "name": "Didier Cerdas"
      },
      "type": "Required"
    }
  ],
  "timeConstraint": {
    "timeslots": [
      {
        "start": {
          "dateTime": "2018-03-02T07:00:00.166Z",
          "timeZone": "Central Standard Time"
        },
        "end": {
          "dateTime": "2018-03-02T12:00:00.167Z",
          "timeZone": "Central Standard Time"
        }
      }
    ]
  },
  "locationConstraint": {
    "isRequired": "false",
    "suggestLocation": "true",
    "locations": [
      {
        "displayName": "Conf Room 32/1368",
        "locationEmailAddress": "conf32room1368@imgeek.onmicrosoft.com"
      }
    ]
  },
  "meetingDuration": "PT1H"
};

/**
 * Generates a GET request the user endpoint.
 * @param {string} accessToken The access token to send with the request.
 * @param {Function} callback
 */
function getUserData(accessToken, callback) {
  request
   .get('https://graph.microsoft.com/beta/me')
   .set('Authorization', 'Bearer ' + accessToken)
   .end((err, res) => {
     callback(err, res);
   });
}


function checkUserAvailable(accessToken, callback){
  request
    .post('https://graph.microsoft.com/v1.0/me/findMeetingTimes')
    .set('Authorization', 'Bearer ' + accessToken)
    .send(defaultCheck)
    .end((err, res) => {
      callback(err, res.body);
    });
}


function searchUser(accessToken, userData, callback){
  var name = (userData.name) ? userData.name : ''

  var filter = '$filter=' +
    (userData.mail) ? 'startswith(' + userData.mail + ')' :
      ((userData.name) ? 'startswith(' + userData.name + ')' : '' +
      (userData.lastname) ? 'and startswith(' + userData.lastname + ')' : '');

  request
    .get('https://graph.microsoft.com/v1.0/users')
    .set('Authorization', 'Bearer ' + accessToken)
    .end((err, res) => {
      callback(err, res.body);
    });
}

exports.getUserData = getUserData;
exports.checkUserAvailable = checkUserAvailable;
exports.searchUser = searchUser;
