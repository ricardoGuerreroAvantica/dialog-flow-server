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

  //Native app android
  console.log('source : ' + req.source);
  if (session && session.parameters && session.parameters.id){
    var nativeId = session.parameters.id;
    parseAction(req, res, nativeId);
  //Non native app
  }else if (req.body.originalRequest && req.body.originalRequest.source === 'skype'){
    var skypeId = req.body.originalRequest.data.user.id;
    parseAction(req, res, skypeId);
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
  var state = req.query.state;
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
  if (!state) {
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
      console.log("SessionId : " + state);
      tokens[state] = {
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
  console.log('sessionId : ' + sessionId);

  verifyUser(req, res, sessionId, (sessionTokens) => {
    var action = req.body.result && req.body.result.action;
    switch (action) {
      case 'disconnect':
        disconnect(req, res, sessionId);
      //CREATE EVENT ACTIONS
      case 'createEventInvite':
        eventHelper.invite(req, res, sessionTokens);
        break;
      case 'createEventDeleteInvite':
        eventHelper.deleteInvite(req, res, sessionTokens);
        break;
      case 'createEventFinish':
        eventHelper.createEventFinish(req, res, sessionTokens);
        break;
      case 'createEventDeleteInvite' :
        eventHelper.deleteInvite(req, res, sessionTokens);
        break;
      case 'createEventShowInvites' :
        eventHelper.showInvites(req, res, sessionTokens);
        break;


      case 'checkUserAvailable':
        eventHelper.checkUserAvailable(req, res, sessionTokens);
        break;
      //SHOW MY PERSONAL INFROMATION
      case 'showEvents':
        userHelper.showAllEvents(req, res, sessionTokens);
        break;
      case 'showPeriodEvents':
        userHelper.showPeriodEvents(req, res, sessionTokens);
        break;
      case 'showEventsByName':
        userHelper.showEventsByName(req, res, sessionTokens);
        break;
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
  console.log('sessionId : ' + sessionId);
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


router.get('/successful', (req, res) => {
  res.render('../views/successfulLogIn');
});


router.get('/privacy', (req, res) => {

  res.json({info : 'soon'});
});


router.get('/terms', (req, res) => {

  res.json({info : 'soon'});
});




module.exports = router;
