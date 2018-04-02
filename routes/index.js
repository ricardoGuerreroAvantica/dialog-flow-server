var express = require('express');
var router = express.Router();
var authHelper = require('../authHelper.js');
var commons = require('../utils/commons.js');
var eventHelper = require('../utils/eventHelper.js');
var userHelper = require('../utils/userHelper.js');
var uid = require('uid');

var tokens = {};

router.post("/request", (req, res) => {
  var session = commons.getContext(req.body.result.contexts, 'session');
  console.log('Session :' + JSON.stringify(session));
  //Native app android
  if (session && session.parameters && session.parameters.id){
    var nativeId = session.parameters.id;
    parseAction(req, res, nativeId);
  //Non native app
  }else{
    return res.json({
      error : {
        name : 'Non supported device',
        description : "The current device is not integrated with calendar-bot.",
      }
    });
  }
});


router.get('/signIn', function (req, res) {
  var sessionId = req.query.state;
  var code = req.query.code;

  if (!code) {
    console.log("Code error");
    return res.json({
      error : {
        name : "Code error",
        description : "An error ocurred login to Microsoft Graph",
      }
    });
  }
  if (!sessionId) {
    console.log("Id error");
    return res.json({
      error : {
        name : 'State error',
        description : "Can't find a unique key for the user",
      }
    });
  }
  authHelper.getTokenFromCode(code, (error, access_token, refresh_token, sessionId) => {
    if (!error) {
      console.log("Access token by login : " + access_token);
      console.log("Refresh token by login : " + refresh_token);
      tokens[sessionId] = {
        ACCESS_TOKEN_CACHE_KEY : access_token,
        REFRESH_TOKEN_CACHE_KEY : refresh_token
      }
      //tokens[sessionId].ACCESS_TOKEN_CACHE_KEY = access_token;
      //tokens[sessionId].REFRESH_TOKEN_CACHE_KEY = refresh_token;
      return res.json({
        response : {
          description : "Login Successful",
        }
      });
    } else {
      console.log(JSON.parse(error.data).error_description);
      res.status(500);
      return res.json({
        error : {
          name : 'State error',
          description : error.data,
        }
      });
    }
  });

});


/**
 @sessionId Device unique key
*/
function parseAction(req, res, sessionId) {
  verifyUser(req, res, sessionId, (sessionTokens) => {
    var action = req.body.result && req.body.result.action;
    switch (action) {
      case 'disconnect':
        disconnect(req, res, sessionId);
      case 'checkUserAvailable':
        eventHelper.checkUserAvailable(req, res, sessionTokens);
      case 'createEventInvite':
        eventHelper.invitePerson(req, res, sessionTokens);
      case 'createEvent':
        eventHelper.createEvent(req, res, sessionTokens);
      case 'showEvents':
        userHelper.showAllEvents(req, res, sessionTokens);
      case 'showPeriodEvents':
        userHelper.showPeriodEvents(req, res, sessionTokens);
      case 'showEventsByName':
        userHelper.showEventsByName(req, res, sessionTokens);
      default:
        return res.json({
          speech: 'Could you repeat that?',
          displayText: 'Could you repeat that?',
          source: "dialog-server-flow"
        });
    }
  });
}

/**
 @sessionId Device unique key
*/
function verifyUser(req, res, sessionId, callback) {
  var sessionTokens = tokens[sessionId];
  console.log('tokens : ' + JSON.stringify(tokens));
  console.log('sessionTokens : ' + sessionTokens);
  //not logged in
  if (!sessionTokens){
    return res.json({
      speech: 'Please login ' + authHelper.getAuthUrl(sessionId),
      displayText: 'Please login',
      source: "dialog-server-flow"
    });
  }else{
    callback(sessionTokens);
  }
}


function disconnect(req, res, sessionId) {
  delete tokens[sessionId]
  return res.json({
    speech: 'Disconnected',
    displayText: 'Disconnected',
    source: "dialog-server-flow"
  });
}


router.get('/privacy', (req, res) => {

  res.json({info : 'soon'});
});


router.get('/terms', (req, res) => {

  res.json({info : 'soon'});
});




module.exports = router;
