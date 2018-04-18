var errorHandler = require('../handlers/errorHandler.js');
var commons = require('../utils/commons.js');
var OAuth = require('oauth');

var credentials = {
  authority: 'https://login.microsoftonline.com/common',
  authorize_endpoint: '/oauth2/authorize',
  token_endpoint: '/oauth2/token',
  logout_endpoint: '/oauth2/logout',
  client_id: '2e1f2117-632c-43e6-a7d8-a4f4d4fbf1d0',
  client_secret: 'vzqWUXQ0625%:zfeuHYJ4%:',
  scope : 'Calendars.Read.Shared%20Calendars.ReadWrite%20User.Read%20User.ReadBasicAll',
  redirect_uri: 'https://dialog-flow-service.herokuapp.com/signIn',
  resouce: 'https://graph.microsoft.com/'
};
var tokens = {};


//CHECK FOR VALID DEVICES
function validSession(next, req, res){
  var session = commons.getContext(req.body.result.contexts, 'session');
  this.options = {};
  if (session && session.parameters && session.parameters.id){
    this.options.sessionId = session.parameters.id;
    this.options.source = 'android';

  }else if (req.body.originalRequest && req.body.originalRequest.source === 'skype'){
    this.options.sessionId = req.body.originalRequest.data.user.id;
    this.options.source = 'skype';

  //NON SUPPORTED DEVICE
  }else{
    next(new Error());
  }
  console.log('validSession.options : ' + JSON.stringify(this.options));
  next(req, res);
}


//CHECK IF USER LOGED IN
function validUser(next, req, res){
  var sessionId = this.options.sessionId;
  this.options.sessionTokens = tokens[sessionId];

  if (!this.options.sessionTokens){
    return res.json({ speech: 'Please login ' + getAuthUrl(sessionId), displayText: 'Please login', source: "dialog-server-flow" });
  }
  console.log('validUser.options : ' + JSON.stringify(this.options));
  next(req, res);
}


async function refreshToken(next, req, res) {
  console.log('refreshToken.options.pre : ' + JSON.stringify(this));
  var OAuth2 = OAuth.OAuth2;
  var oauth2 = new OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.authority,
    credentials.authorize_endpoint,
    credentials.token_endpoint
  );
  await oauth2.getOAuthAccessToken(
    this.options.sessionTokens.REFRESH_TOKEN_CACHE_KEY,
    {
      grant_type: 'refresh_token',
      redirect_uri: credentials.redirect_uri,
      resource: credentials.resouce
    },
    function(error, access_token, refresh_token, results){
      if (error){
        console.log('refreshToken.error : ' + JSON.stringify(error));
        next(new Error());
      }
      this.options.access_token = results.access_token;
      this.options.refresh_token = results.refresh_token;
      console.log('refreshToken.options : ' + JSON.stringify(this));
      next(req, res);
    }
  );
}


function signIn(req, res){
  var state = req.query.state;
  var code = req.query.code;

  if (!code) {
    console.log('signIn.error : Missing code');
    return res.json({ error : { name : "Code error", description : "An error ocurred login to Microsoft Graph" } });
  }
  if (!state) {
    console.log('signIn.error : Missing state');
    return res.json({ error : { name : 'State error', description : "Can't find a unique key for the user" } });
  }
  getTokenFromCode(code, (error, access_token, refresh_token, sessionId) => {
    if (!error) {
      tokens[state] = { ACCESS_TOKEN_CACHE_KEY : access_token, REFRESH_TOKEN_CACHE_KEY : refresh_token }
      return res.json({ response : { description : "Login Successful" } });
    }else{
      console.log(JSON.parse(error.data).error_description);
      res.status(500);
      return res.json({ error : { name : 'State error', description : error.data } });
    }
  });

}


function getTokenFromCode(code, callback) {
  var OAuth2 = OAuth.OAuth2;
  var oauth2 = new OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.authority,
    credentials.authorize_endpoint,
    credentials.token_endpoint
  );

  oauth2.getOAuthAccessToken(
    code,
    {
      grant_type: 'authorization_code',
      redirect_uri: credentials.redirect_uri,
      resource: credentials.resouce
    },
    function(e, access_token, refresh_token, results){
      callback(e, access_token, refresh_token);
    }
  );
}


function getAuthUrl(state) {
  return credentials.authority + credentials.authorize_endpoint +
    '?client_id=' + credentials.client_id +
    '&response_type=code' +
    '&scope=' + credentials.scope +
    '&redirect_uri=' + credentials.redirect_uri +
    '&state=' + state;
}



exports.refreshToken = refreshToken;
exports.validSession = validSession;
exports.validUser = validUser;
exports.signIn = signIn;
