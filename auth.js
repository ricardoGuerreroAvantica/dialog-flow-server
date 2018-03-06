var clientId = '2e1f2117-632c-43e6-a7d8-a4f4d4fbf1d0';
var clientSecret = 'vzqWUXQ0625%:zfeuHYJ4%:';
var redirectUri = 'http://localhost:3000/authorize';

var scopes = [
  'openid',
  'profile',
  'offline_access',
  'https://outlook.office.com/calendars.readwrite'
];


var credentials = {
  authority: 'https://login.microsoftonline.com/common',
  authorize_endpoint: '/oauth2/authorize',
  token_endpoint: '/oauth2/token',
  logout_endpoint: '/oauth2/logout',
  client_id: '2e1f2117-632c-43e6-a7d8-a4f4d4fbf1d0',
  client_secret: 'vzqWUXQ0625%:zfeuHYJ4%:',
  redirect_uri: 'http://localhost:8000/login',
  resouce: 'https://graph.microsoft.com/'
};

/**
 * Generate a fully formed uri to use for authentication based on the supplied resource argument
 * @return {string} a fully formed uri with which authentication can be completed
 */
function getAuthUrl() {
  return credentials.authority + credentials.authorize_endpoint +
    '?client_id=' + credentials.client_id +
    '&response_type=code' +
    '&redirect_uri=' + credentials.redirect_uri;
}




var clientId = '2e1f2117-632c-43e6-a7d8-a4f4d4fbf1d0';
var clientSecret = 'vzqWUXQ0625%:zfeuHYJ4%:';
var redirectUri = 'http://localhost:3000/authorize';

var scopes = [
  'openid',
  'profile',
  'offline_access',
  'https://outlook.office.com/calendars.readwrite'
];

// var credentials = {
//   clientID: clientId,
//   clientSecret: clientSecret,
//   site: 'https://login.microsoftonline.com/common',
//   authorizationPath: '/oauth2/v2.0/authorize',
//   tokenPath: '/oauth2/v2.0/token'
// }

//var oauth2 = require('simple-oauth2')(credentials)

const oauth2 = require('simple-oauth2').create({
  client: {
    id: clientId,
    secret: clientSecret,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com/common',
    //tokenPath: '/oauth2/v2.0/token',
    authorizePath: '/login/oauth/authorize',
  },
});


const tokenConfig = {
  username: 'juan.guerrero@avantica.net',
  password: 'JjGg135#'
};


module.exports = {

  getTokenFromCode: (request, response, callback) => {
    // Callbacks
    // Save the access token
    oauth2.ownerPassword.getToken(tokenConfig, (error, result) => {
      if (error) {
        return console.log('Access Token Error', error.message);
      }
      console.log("Check2");
      const accessToken = oauth2.accessToken.create(result);
    });

    // Promises
    // Save the access token
    oauth2.ownerPassword
      .getToken(tokenConfig)
      .then((result) => {
        console.log("Check3");
        const accessToken = oauth2.accessToken.create(result);

        return accessToken;
      });
  }


};


const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

var authHelper = require('./authHelper');

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());


app.post("/action", (req, res) => {
  var action =
    req.body.result &&
    req.body.result.action
      ? req.body.result.action
      : "Seems like some problem.";

  if (action == 'login'){

    return axios.get('http://localhost:8000/token')
      .then((response) => {
        console.log(response.data);
        res.json(response.data);
      }).catch(err =>{
        console.log(err);
      })

  }

});


app.get("/token", (req, res) => {
  return res.json({
    'hi' : 'hi'
  });
});




app.listen(8000, () => {
  console.log("Server up and listening");
})



var clientId = '2e1f2117-632c-43e6-a7d8-a4f4d4fbf1d0';
var clientSecret = 'vzqWUXQ0625%:zfeuHYJ4%:';
var redirectUri = 'http://localhost:3000/authorize';

var scopes = [
  'openid',
  'profile',
  'offline_access',
  'https://outlook.office.com/calendars.readwrite'
];

const credentials = {
  client: {
    id: clientId,
    secret: clientSecret,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};

const oauth2 = require('simple-oauth2').create(credentials);


function getAuthUrl() {
  const returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });
  console.log(`Generated auth url: ${returnVal}`);
  return returnVal;
}

exports.getAuthUrl = getAuthUrl;
