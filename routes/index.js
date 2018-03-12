var express = require('express');
var router = express.Router();
var authHelper = require('../authHelper.js');
var requestUtil = require('../requestUtil.js');
var eventHelper = require('../utils/eventHelper.js');
var axios = require('axios');
var uid = require('uid');

var tokens = {};

/**
 * Dialog flow web hook
 https://dialog-flow-service.herokuapp.com/login
//  */
router.post("/botSpeak", (req, res) => {
  console.log(tokens);
  //GENERATE TOKEN CONTEXT FOR LOGIN
  getTokenContext(req, res, (sessionContext) => {
    var action = req.body.result && req.body.result.action ? req.body.result.action : '';
    var token = tokens[sessionContext.parameters.key];

    if (!token.REFRESH_TOKEN_CACHE_KEY) {

      // return res.json({
      //   "fulfillmentText": 'Please login',
      //   "fulfillmentMessages": [
      //     {
      //       text: 'Please login ' + authHelper.getAuthUrl(sessionContext.parameters.key)
      //     }
      //   ],
      //   "source": "dialog-flow-server",
      //   "outputContexts": [
      //     {
      //       sessionContext
      //     }
      //   ],
      //   "followupEventInput": {
      //     object(EventInput)
      //   },
      // });

      return res.json({
        speech: 'Please login',
        displayText: 'Please login ' + authHelper.getAuthUrl(sessionContext.parameters.key),
        source: "dialog-server-flow",
        "outputContexts" : [
          {
            sessionContext
          }
        ]
      });
    }else{
      switch (action) {
        case 'checkUserAvailable':
          checkUserAvailable(req, res);
          break;
        default:
          return res.json({
            speech: 'Could you repeat that?',
            displayText: 'Could you repeat that?',
            source: "dialog-server-flow"
          });
      }
    }

  });
});


function getTokenContext(req, res, callback){
  var tokenContext = getContext(req.body.result.contexts, 'token');
  if (Object.keys(tokenContext).length === 0){
    var key = uid(25);
    tokens[key] = {
      ACCESS_TOKEN_CACHE_KEY : '',
      REFRESH_TOKEN_CACHE_KEY : ''
    }
    tokenContext = {
      "name": "token",
      "parameters": {
        "key" : key
      },
      "lifespan": 5
    }
  }
  callback(tokenContext);
}

function getContext(contexts, name){
  for (var i in contexts){
    if (contexts[i].name === name){
      return contexts[i];
    }
  }
  return {};
}


/* GET home page. */
router.get('/login', function (req, res) {
  console.log('--- LOGIN ---');
  console.log('CODE :: ' + req.query.code);
  console.log('STATE :: ' + req.query.state);
  if (req.query.state !== undefined && req.query.code !== undefined) {
    var token = req.query.state;
    authHelper.getTokenFromCode(req.query.code, function (e, access_token, refresh_token, state) {
      if (e === null) {

        tokens[token].ACCESS_TOKEN_CACHE_KEY = access_token;
        tokens[token].REFRESH_TOKEN_CACHE_KEY = refresh_token;
        console.log(tokens);

        return res.send('Login successfull');
      } else {
        console.log(JSON.parse(e.data).error_description);
        res.status(500);
        return res.send(e.data);
      }
    });
  }
});


function checkUserAvailable(req, res) {
  wrapRequestAsCallback(req.cookies.REFRESH_TOKEN_CACHE_KEY, {

    onSuccess: function (results) {
      //GET REQUEST PARAMETERS
      var userData = {
        name : req.body.result && req.body.result.parameters.name ? req.body.result.parameters.name : '',
        lastname : req.body.result && req.body.result.parameters.lastname ? req.body.result.parameters.lastname : '',
        email : req.body.result && req.body.result.parameters.email ? req.body.result.parameters.email : ''
      }
      var date = req.body.result.parameters.date;
      var time = req.body.result.parameters.time;

      console.log("parameters");
      console.log(userData);
      console.log(date);
      console.log(time);

      searchUser(req, res, userData, (err, response) => {
        console.log(userData);

        axios.post('https://graph.microsoft.com/v1.0/me/findMeetingTimes', {
          headers : {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + results.access_token
          },
          body : {
            attendees: eventHelper.getAttendees([userData]),
            timeConstraint: eventHelper.getTimeConstraint(date, time),
            meetingDuration: eventHelper.getDuration(duration)
          }
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
      });

    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
    }
  });
}

function searchUser(req, res, userData, callback){
  wrapRequestAsCallback(req.cookies.REFRESH_TOKEN_CACHE_KEY, {

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
        callback(err, {
            displayName : response.data.value[0].displayName,
            givenName : response.data.value[0].givenName,
            mail : response.data.value[0].mail,
            surname : response.data.value[0].surname,
          })
      }

      })
      .catch((error) => {
        console.log(error);
      });
    },
    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
    }
  });
}


function wrapRequestAsCallback(tokenKey, callback) {
  authHelper.getTokenFromRefreshToken(tokenKey, function (e, results) {
    if (results !== null) {
      callback.onSuccess(results);
    } else {
      callback.onFailure({
        code: 500,
        message: 'An unexpected error was encountered acquiring access token from refresh token'
      });
    }
  });
}

module.exports = router;
