const express = require('express');
const router = express.Router();
const graphHelper = require('../utils/graphHelper.js');
const eventHelper = require('../utils/eventHelper.js');
const passport = require('passport');


/**
 * Dialog flow web hook
//  */
router.post("/botSpeak", (req, res) => {
  var action = req.body.result && req.body.result.action ? req.body.result.action : '';
  console.log('Action : ' + action);
  //CHECK FOR LOGIN
  // if (!req.isAuthenticated()) {
  //   res.redirect('login');
  // }
  switch (action) {
    case 'checkUserAvailable':
      checkUserAvailable(req, res);
      break;
    case 'createEventInvite':
      inviteUser(req, res);
      break;
    default:
      return res.json({
        speech: 'Could you repeat that?',
        displayText: 'Could you repeat that?',
        source: "dialog-server-flow"
      });
  }
});


router.get('/', (req, res) => {
  // check if user is authenticated
  if (!req.isAuthenticated()) {
    res.redirect('login');
  } else {
    return res.json({
      displayName: req.user.profile.displayName,
      emailAddress: req.user.profile.emails[0].address
    });
  }
});

router.get('/login', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/');
    }
);

router.get('/token',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    (req, res) => {
      graphHelper.getUserData(req.user.accessToken, (err, user) => {
        if (!err) {
          req.user.profile.displayName = user.body.displayName;
          req.user.profile.emails = [{ address: user.body.mail || user.body.userPrincipalName }];
          res.redirect('/');
        } else {
          renderError(err, res);
        }
      });
    }
);



router.get('/test', (req, res) => {

  checkUserAvailable(req, res);

});

function checkUserAvailable(req, res) {
  // var userData = {
  //   name : req.body.result && req.body.result.parameters.name ? req.body.result.parameters.name : '',
  //   lastname : req.body.result && req.body.result.parameters.lastname ? req.body.result.parameters.lastname : '',
  //   email : req.body.result && req.body.result.parameters.email ? req.body.result.parameters.email : ''
  // }
  // //2018-03-07
  // var date = req.body.result && req.body.result.parameters.date ? req.body.result.parameters.date : '';
  // //21:00:00
  // var time = req.body.result && req.body.result.parameters.time ? req.body.result.parameters.time : '';

  var userData = {
    name : '',
    lastname : '',
    email : 'didier.cerdas@avantica.net'
  }
  var date = '2018-03-07';
  var time = '07:00:00';
  var duration = '';

  searchUser(req, res, userData, (err, response) => {

    var body = {
      "attendees": eventHelper.getAttendees([userData]),
      "timeConstraint": eventHelper.getTimeConstraint(date, time),
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
      "meetingDuration": eventHelper.getDuration(duration)
    }

    graphHelper.checkUserAvailable(req.user.accessToken, body, (err, response) => {
      var message = '';

      if (!response.meetingTimeSuggestions.length){
        message = "Couldn't find any space\n";
      }else{
        message = 'I found space:\n';
        for (var i in response.meetingTimeSuggestions){
          var slot = response.meetingTimeSuggestions[i];
          var start = slot.meetingTimeSlot.start.dateTime.replace('T', ' ') + ' UTC';
          var end = slot.meetingTimeSlot.end.dateTime.replace('T', ' ') + ' UTC';
          var newStartDate = new Date(start);
          var newEndDate = new Date(end);
          message += newStartDate.toString() + ' - ' + newEndDate.toString() + '\n';
        }
      }
      return res.json({
        speech: message,
        displayText: message,
        source: "dialog-flow-server"
      });
    });

  });

}




function inviteUser(req, res){
  var userData = {
    name : req.body.result && req.body.result.parameters.name ? req.body.result.parameters.name : '',
    lastname : req.body.result && req.body.result.parameters.lastname ? req.body.result.parameters.lastname : '',
    email : req.body.result && req.body.result.parameters.email ? req.body.result.parameters.email : ''
  }
  console.log(JSON.stringify(req.body));

  return res.json({
    speech: 'invited',
    displayText: 'invited',
    outputContexts: [
      {
        invites : []
      }
    ],
    source: "dialog-flow-server"
  });
}


function createEvent(req, res){
  var name = req.body.result && req.body.result.parameters.name ? req.body.result.parameters.name : '';
  var date = req.body.result && req.body.result.parameters.date ? req.body.result.parameters.date : '';
  var time = req.body.result && req.body.result.parameters.time ? req.body.result.parameters.time : '';
  var invites = req.body.result && req.body.result.parameters.time ? req.body.result.parameters.time : '';

  graphHelper.createEvent(name, date, time, invites, (err, res) => {


    return res.json({
      speech: speech,
      displayText: speech,
      source: "dialog-flow-server"
    });
  });

}


function searchUser(req, res, userData, callback){
  graphHelper.searchUser(req.user.accessToken, userData, (err, response) => {
    if (response.value.length > 1){
      var message = "I found these users with that name \n \n";
      for (var i in response.value){
        message += response.value[i].displayName + " " + response.value[i].surname + "\n";
        message += "Email: " + response.value[i].mail + "\n \n";
      }
      return res.json({
        speech: message,
        displayText: message,
        source: "dialog-server-flow"
      });
    }else if (!response.value.length){
      return res.json({
        speech: "Can't find someone with that name",
        displayText: "Can't find someone with that name",
        source: "dialog-server-flow"
      });
    }else {
      callback(err, {
          displayName : response.value[0].displayName,
          givenName : response.value[0].givenName,
          mail : response.value[0].mail,
          surname : response.value[0].surname,
        })
    }
  });
}


router.get('/disconnect', (req, res) => {
  req.session.destroy(() => {
    req.logOut();
    res.clearCookie('graphNodeCookie');
    res.status(200);
    res.redirect('/');
  });
});



// helpers
function hasAccessTokenExpired(e) {
  let expired;
  if (!e.innerError) {
    expired = false;
  } else {
    expired = e.forbidden &&
      e.message === 'InvalidAuthenticationToken' &&
      e.response.error.message === 'Access token has expired.';
  }
  return expired;
}


module.exports = router;
