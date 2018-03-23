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
  //GENERATE TOKEN CONTEXT FOR LOGIN
  getTokenContext(req, res, (sessionContext) => {
    var action = req.body.result && req.body.result.action ? req.body.result.action : '';
    var token = tokens[sessionContext.parameters.key];

    if (!token.REFRESH_TOKEN_CACHE_KEY) {
      return res.json({
        speech: 'Please login ' + authHelper.getAuthUrl(sessionContext.parameters.key),
        displayText: 'Please login ' + authHelper.getAuthUrl(sessionContext.parameters.key),
        source: "dialog-server-flow",
        contextOut : [
            sessionContext
        ]
      });
    }
    switch (action) {
      case 'checkUserAvailable':
        eventHelper.checkUserAvailable(req, res, sessionContext, token);
        break;
      case 'createEventInvite':
        eventHelper.invitePerson(req, res, sessionContext, token);
        break;
      case 'createEvent':
        eventHelper.createEvent(req, res, sessionContext, token);
        break;
      case 'showEvents':
        userHelper.showAllEvents(req, res, sessionContext, token);
        break;
      case 'showPeriodEvents':
        userHelper.showPeriodEvents(req, res, sessionContext, token);
        break;
      case 'showEventsByName':
        userHelper.showEventsByName(req, res, sessionContext, token);
        break;
      default:
        return res.json({
          speech: 'Could you repeat that?', displayText: 'Could you repeat that?',
          source: "dialog-server-flow", contextOut : [ sessionContext ]
        });
    }

  });
});

var moment = require('moment');
router.get('/checkDate', (req, res) => {
  var date = '2018-03-26';
  var time = '08:00:00';
  console.log(moment.utc(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss'));
  var date2 = '2018-03-27';
  var time2 = '13:00:00';
  console.log(moment.utc(date2 + ' ' + time2, 'YYYY-MM-DD HH:mm:ss').utcOffset("-05:00").format('YYYY-MM-DDTHH:mm:ss'));
  //var date = '2018-03-26';
  //var time = '18:30:00';
  //console.log(moment(date + ' ' + time, 'YYYY-MM-DD HH:mm:ss').utcOffset("+05:00").format('YYYY-MM-DDTHH:mm:ss'));
  res.json({data : 'hi'});
});


router.get('/privacy', (req, res) => {

  res.json({info : 'soon'});
});


router.get('/terms', (req, res) => {

  res.json({info : 'soon'});
});





function getTokenContext(req, res, callback){
  var tokenContext = commons.getContext(req.body.result.contexts, 'token');
  if (Object.keys(tokenContext).length === 0){
    var key = uid(25);
    tokens[key] = {
      ACCESS_TOKEN_CACHE_KEY : '',
      REFRESH_TOKEN_CACHE_KEY : ''
    }
    tokenContext = {
      "name": "token", "parameters": { "key" : key }, "lifespan": 10 }
  }else{
    tokenContext.lifespan = 10;
  }
  callback(tokenContext);
}




/* GET home page. */
router.get('/login', function (req, res) {
  if (req.query.state !== undefined && req.query.code !== undefined) {
    var token = req.query.state;
    authHelper.getTokenFromCode(req.query.code, function (e, access_token, refresh_token, state) {
      if (e === null) {

        tokens[token].ACCESS_TOKEN_CACHE_KEY = access_token;
        tokens[token].REFRESH_TOKEN_CACHE_KEY = refresh_token;

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
