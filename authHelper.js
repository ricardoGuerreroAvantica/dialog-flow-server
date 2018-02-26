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
    tokenPath: '/oauth2/v2.0/token',
    authorizePath: '/login/oauth/authorize',
  },
});


const tokenConfig = {
  username: 'juan.guerrero@avantica.net',
  password: 'JjGg135#'
};


module.exports = {

  getTokenFromCode: (request, response, callback) => {
    oauth2.ownerPassword
      .getToken(tokenConfig)
      .then((result) => {
        const accessToken = oauth2.accessToken.create(result);

        return accessToken;
      });
  }


};
