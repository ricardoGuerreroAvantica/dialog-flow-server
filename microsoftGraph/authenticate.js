var errorHandler = require('../handlers/errorHandler.js');
var commons = require('../utils/commons.js');
var OAuth = require('oauth');

var credentials = {
  authority: 'https://login.microsoftonline.com/common',
  authorize_endpoint: '/oauth2/authorize',
  token_endpoint: '/oauth2/token',
  logout_endpoint: '/oauth2/logout',
  client_id: '9cdaac8d-e575-4b5e-a2ce-bfb911710bae',
  client_secret: 'bixkJN105!;gxeROFFV83+-',
  scope : 'Calendars.Read.Shared%20Calendars.ReadWrite%20User.Read%20User.ReadBasicAll',
  redirect_uri: 'https://dialog-flow-server-testing.herokuapp.com/signIn',
  resouce: 'https://graph.microsoft.com/'
};
var tokens = {};


//CHECK FOR VALID DEVICES
function validSession(next, req, res, callback){
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
  next(req, res, callback);
}


//CHECK IF USER LOGED IN
function validUser(next, req, res, callback){
  var sessionId = this.options.sessionId;
  this.options.sessionTokens = tokens[sessionId];

  if (!this.options.sessionTokens){
    return res.json({ speech: 'Please login ' + getAuthUrl(sessionId), displayText: 'Please login', source: "dialog-server-flow" });
  }
  console.log('validUser.options : ' + JSON.stringify(this.options));
  next(req, res, callback);
}


function refreshToken(next, options, callback) {
  console.log('refreshToken.options.pre.httpCall : ' + JSON.stringify(options));
  var OAuth2 = OAuth.OAuth2;
  var oauth2 = new OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.authority,
    credentials.authorize_endpoint,
    credentials.token_endpoint
  );
  oauth2.getOAuthAccessToken(
    options.sessionTokens.REFRESH_TOKEN_CACHE_KEY,
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
      console.log('refreshToken.options : ' + JSON.stringify(options));
      options.access_token = access_token;
      options.refresh_token = refresh_token;
      next(options, callback);

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
