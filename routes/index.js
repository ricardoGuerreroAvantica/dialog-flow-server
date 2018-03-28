var express = require('express');
var router = express.Router();
var authHelper = require('../authHelper.js');
var commons = require('../utils/commons.js');
var eventHelper = require('../utils/eventHelper.js');
var userHelper = require('../utils/userHelper.js');
var uid = require('uid');

var tokens = {};


/**
 * Dialog flow web hook
 https://dialog-flow-service.herokuapp.com/login
//  */
router.post("/botSpeak", (req, res) => {
  var action = req.body.result && req.body.result.action;
  if (action === 'disconnect'){
    console.log('Disconnecting');
    disconnect(req, res);
  }

  setToken(req, res, (tokenContext) => {
    var key = tokenContext.parameters.key;
    var token = tokens[key];
    console.log("Token Context: " + JSON.stringify(tokenContext));
    console.log("Tokens : " + JSON.stringify(tokens));

    if (!token || !token.REFRESH_TOKEN_CACHE_KEY){
      return res.json({
        speech: 'Please login ' + authHelper.getAuthUrl(key), displayText: 'Please login',
        source: "dialog-server-flow", contextOut : [ tokenContext ]
      });
    }

    switch (action) {
      case 'checkUserAvailable':
        eventHelper.checkUserAvailable(req, res, tokenContext, token);
        break;
      case 'createEventInvite':
        eventHelper.invitePerson(req, res, tokenContext, token);
        break;
      case 'createEvent':
        eventHelper.createEvent(req, res, tokenContext, token);
        break;
      case 'showEvents':
        userHelper.showAllEvents(req, res, tokenContext, token);
        break;
      case 'showPeriodEvents':
        userHelper.showPeriodEvents(req, res, tokenContext, token);
        break;
      case 'showEventsByName':
        userHelper.showEventsByName(req, res, tokenContext, token);
        break;
      default:
        return res.json({
          speech: 'Could you repeat that?', displayText: 'Could you repeat that?',
          source: "dialog-server-flow", contextOut : [ tokenContext ]
        });
    }

  });
});


function setToken(req, res, callback){
  var context = commons.getContext(req.body.result.contexts, 'token');
  console.log("Context by setToken : " + JSON.stringify(context));
  if (!context || !context.parameters || !context.parameters.key){
    var key = uid(25);
    context = {
      "name": "token", "parameters": { "key" : key }
    }
    tokens[key] = {
      ACCESS_TOKEN_CACHE_KEY : '', REFRESH_TOKEN_CACHE_KEY : ''
    }
    console.log("Tokens by setToken : " + tokens);
  }else{
    var key = context.parameters.key;
    var token = tokens[key];
    if (!token || !token.REFRESH_TOKEN_CACHE_KEY){
      var key = uid(25);
      context = {
        "name": "token", "parameters": { "key" : key }
      }
      tokens[key] = {
        ACCESS_TOKEN_CACHE_KEY : '', REFRESH_TOKEN_CACHE_KEY : ''
      }
      console.log("Tokens by setToken : " + tokens);
    }
  }
  context.lifespan = 10;
  callback(context);
}



router.get('/privacy', (req, res) => {

  res.json({info : 'soon'});
});


router.get('/terms', (req, res) => {

  res.json({info : 'soon'});
});



function disconnect(req, res) {
  var tokenContext = {
    "name": "token", "parameters": {}, "lifespan": 10 }
  return res.json({
    speech: 'You are disconnected. Please login', displayText: 'You are disconnected. Please login',
    source: "dialog-server-flow", contextOut : [ tokenContext ]
  });
}


/* GET home page. */
router.get('/login', function (req, res) {
  if (req.query.state && req.query.code) {
    var key = req.query.state;
    console.log("Tokens by login : " + JSON.stringify(tokens));
    console.log("Tokens by login : " + key);
    authHelper.getTokenFromCode(req.query.code, function (e, access_token, refresh_token, state) {
      if (e === null) {
        console.log("Access token by login : " + access_token);
        console.log("Refresh token by login : " + refresh_token);
        tokens[key].ACCESS_TOKEN_CACHE_KEY = access_token;
        tokens[key].REFRESH_TOKEN_CACHE_KEY = refresh_token;

        return res.json({ result: 'Login successfull' });

      } else {
        console.log(JSON.parse(e.data).error_description);
        res.status(500);
        return res.json({ result: e.data });
      }
    });
  }
});



module.exports = router;
