var express = require('express');
var router = express.Router();
var authHelper = require('../authHelper.js');
var requestUtil = require('../requestUtil.js');
var eventHelper = require('../utils/eventHelper.js');
var axios = require('axios');

/**
 * Dialog flow web hook
//  */
router.post("/botSpeak", (req, res) => {
  var action = req.body.result && req.body.result.action ? req.body.result.action : '';
  //sessionID: 'FL5BuwbxMl1OYaqm7oE7-0eD09zDjZWL',
  console.log(req.body.sessionId);
  console.log('Action : ' + action);
  //CHECK FOR LOGIN
  if (req.cookies.REFRESH_TOKEN_CACHE_KEY === undefined) {
    return res.json({
      speech : 'Please sign in to ' + authHelper.getAuthUrl(),
      text : 'Please sign in to ' + authHelper.getAuthUrl(),
      source : 'dialog-flow-server'
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

router.get('/', function (req, res) {
  var action = req.body.result && req.body.result.action ? req.body.result.action : '';
  console.log('Action : ' + action);
  //CHECK FOR LOGIN
  if (req.cookies.REFRESH_TOKEN_CACHE_KEY === undefined) {
    res.redirect('login');
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


router.get('/disconnect', function (req, res) {
  var redirectUri = 'http://localhost:3000';
  // check for token
  req.session.destroy();
  res.clearCookie('nodecookie');
  res.clearCookie(authHelper.ACCESS_TOKEN_CACHE_KEY);
  res.clearCookie(authHelper.REFRESH_TOKEN_CACHE_KEY);
  res.status(200);
  console.log('Disconnect redirect uri: ' + redirectUri);
  res.redirect(
    authHelper.credentials.authority +
    authHelper.credentials.logout_endpoint +
    '?post_logout_redirect_uri=' + redirectUri
  );
});

/* GET home page. */
router.get('/login', function (req, res) {
  if (req.query.code !== undefined) {
    authHelper.getTokenFromCode(req.query.code, function (e, access_token, refresh_token, state) {
      if (e === null) {
        console.log("-- REQ LOGIN --");
        console.log(req);
        console.log("-- LOG --");
        console.log(access_token);
        console.log(refreshToken);
        console.log(state);
        // cache the refresh token in a cookie and go back to index
        res.cookie(authHelper.ACCESS_TOKEN_CACHE_KEY, access_token);
        res.cookie(authHelper.REFRESH_TOKEN_CACHE_KEY, refresh_token);

        res.send('Wolfs');
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
