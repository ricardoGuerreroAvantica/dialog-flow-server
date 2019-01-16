var OAuth = require('oauth');
var commons = require('../utils/commons.js');

var credentials = {
  authority: 'https://login.microsoftonline.com/common',
  authorize_endpoint: '/oauth2/authorize',
  token_endpoint: '/oauth2/token',
  logout_endpoint: '/oauth2/logout',
  client_id: 'f9c030a5-9a75-4ae7-add2-55330dc196c4',
  client_secret: 'ckgoMKCP65ilpGDY960[;?@',
  scope : 'Calendars.ReadWrite.Shared'+
          '%20Calendars.ReadWrite'+
          '%20User.ReadBasicAll'+
          '%20MailboxSettings.ReadWrite'+
          '%20User.ReadWrite',
  redirect_uri: 'https://sjo-calendar-bot.azurewebsites.net/signIn',
  resouce: 'https://graph.microsoft.com/'
};
var tokens = {};

//CHECK FOR VALID DEVICES
function validSession(next, req, res, callback){
  //var session = commons.getContext(req.body.result.contexts, 'session');
  var reqJSONBody= JSON.parse(JSON.stringify(req.body));
  this.options = {};
  console.log("The Body:"+JSON.stringify(reqJSONBody));
  if (req.body.originalRequest && req.body.originalRequest.source === 'skype'){
    this.options.sessionId = req.body.originalRequest.data.data.user.id;
    this.options.source = 'skype';

  }else {
    //LOGIN IN IOS
    var IOSId = reqJSONBody.result.contexts;

    IOSFiltered = IOSId.filter(filter)
    var IOSName=IOSFiltered[0].name;
    if (IOSName && IOSName != "session"){
    this.options.sessionId = IOSName;
    this.options.source = 'ios';

    }
  }
  next(req, res, callback);
}

function filter(jsonObject) {
  return jsonObject.name != "createevent" && jsonObject.name != "invites"&& jsonObject.name != "helperhandler" && jsonObject.name != "check_available_context";
}

//CHECK IF USER LOGED IN
function validUser(next, req, res, callback){
  var sessionId = this.options.sessionId;
  this.options.sessionTokens = tokens[sessionId];
  if (!this.options.sessionTokens){
    if(this.options.source == "ios"){
      return res.json({ speech: 'Your access token is invalid, please go back and re-enter the chat', displayText: 'Confirmation', source: "dialog-server-flow" });
    }
    else{
      return res.json({ speech: 'Please login ' + getAuthUrl(sessionId), displayText: 'Please login', source: "dialog-server-flow" });
    }
    
  }
  //console.log('validUser.options : ' + JSON.stringify(this.options));
  next(req, res, callback);
}


function refreshToken(next, options, callback) {
  if(options.sessionTokens.REFRESH_TOKEN_CACHE_KEY ==""){
    //console.log("IOS dont need refresh token");
    options.access_token = options.sessionTokens.ACCESS_TOKEN_CACHE_KEY;
    options.refresh_token = options.sessionTokens.REFRESH_TOKEN_CACHE_KEY;
    next(options, callback);
  }
  else{
    //console.log('refreshToken.options.pre.httpCall : ' + JSON.stringify(options));
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
          //console.log('refreshToken.error : ' + JSON.stringify(error));
          next(new Error());
        }
        //console.log('refreshToken.options : ' + JSON.stringify(options));
        options.access_token = access_token;
        options.refresh_token = refresh_token;
        next(options, callback);
      }
    );
  }
  
}


function signIn(req, res){
  var state = req.query.state;
  var code = req.query.code;
  try{
    var reqJSONBody = JSON.parse(JSON.stringify(req.body));
  }
  catch(error){
    console.log("Error" + error)
  }
  if (reqJSONBody.state=="IOS"){
    UserTimezone=commons.getTimeZone(access_token);
    tokens[reqJSONBody.session_state] = { TIMEZONE:UserTimezone, ACCESS_TOKEN_CACHE_KEY : reqJSONBody.token_body, REFRESH_TOKEN_CACHE_KEY : ""}
    console.log(JSON.stringify("IOS session: is " + json.stringify(tokens[reqJSONBody.session_state].TIMEZONE)))

    return res.json({ response : { description : "Login Successful in ios mobile" } });
  }
  else{
    if (!code) {
      //console.log('signIn.error : Missing code');
      return res.json({ error : { name : "Code error", description : "An error ocurred login to Microsoft Graph" } });
    }
    if (!state) {
      //console.log('signIn.error : Missing state');
      return res.json({ error : { name : 'State error', description : "Can't find a unique key for the user" } });
    }
    getTokenFromCode(code, (error, access_token, refresh_token, sessionId) => {
      if (!error) {
        UserTimezone=commons.getTimeZone(access_token);
        tokens[state] = {TIMEZONE:UserTimezone, ACCESS_TOKEN_CACHE_KEY : access_token, REFRESH_TOKEN_CACHE_KEY : refresh_token}
        console.log(JSON.stringify("skype session: is " + JSON.stringify(tokens[state].TIMEZONE)))
        return res.sendFile(__dirname + '/signIn.html');
      }else{
        //console.log(JSON.parse(error.data).error_description);
        res.status(500);
        return res.json({ error : { name : 'State error', description : error.data } });
      }
    });
  }
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
