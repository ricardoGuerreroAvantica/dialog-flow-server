var errorHandler = require('../handlers/errorHandler.js');
var commons = require('../utils/commons.js');
var OAuth = require('oauth');

var credentials = {
  authority: 'https://login.microsoftonline.com/common',
  authorize_endpoint: '/oauth2/authorize',
  token_endpoint: '/oauth2/token',
  logout_endpoint: '/oauth2/logout',
  client_id: 'c93a93c8-e0bd-4066-8550-845bf844bea3',
  client_secret: 'iOGRYK9563+=orvbuiMM9?_',
  scope : 'Calendars.Read.Shared%20Calendars.ReadWrite%20User.Read%20User.ReadBasicAll',
  redirect_uri: 'https://blooming-lake-64865.herokuapp.com/signIn',
  resouce: 'https://graph.microsoft.com/'
};
var tokens = {};


//CHECK FOR VALID DEVICES
function validSession(next, req, res, callback){
  console.log("newSection:")
  var session = commons.getContext(req.body.result.contexts, 'session');
  var reqJSONBody= JSON.parse(JSON.stringify(req.body));

  console.log("valid.session: Options: "+JSON.stringify(this.options));
  this.options = {};
  console.log("#Empthy:"+ JSON.stringify(this.options));
  console.log("Body:" + JSON.stringify(req.body));
  if (req.body.originalRequest && req.body.originalRequest.source === 'skype'){
    //console.log("skype");
    this.options.sessionId = req.body.originalRequest.data.user.id;
    this.options.source = 'skype';

  }else {
    //LOGIN IN IOS
    console.log("Enter the IOS section: --------------------------------------");
    console.log(JSON.stringify(this.options));
    var IOSId = reqJSONBody.result.contexts;

    IOSFiltered = IOSId.filter(filter)
    console.log()
    console.log(IOSFiltered)
    var IOSName=IOSFiltered[0].name;
    if (IOSName && IOSName != "session"){
    this.options.sessionId = IOSName;
    this.options.source = 'ios';

    }
    //else if (IOSId.name == "session"){
        //console.log("Android");
        //console.log("Parameters :"+ session.parameters.id)
        //this.options.sessionId = session.parameters.id;
        //this.options.source = 'android';
    //}
    console.log("----------------end---------------------");

  }
  next(req, res, callback);
}

function filter(jsonObject) {
  console.log("Users_data: "+JSON.stringify(jsonObject))
  return jsonObject.name != "createevent" && jsonObject.name != "invites"&& jsonObject.name != "helperhandler" && jsonObject.name != "check_available_context";
}

//CHECK IF USER LOGED IN
function validUser(next, req, res, callback){
  var sessionId = this.options.sessionId;
  this.options.sessionTokens = tokens[sessionId];
  console.log("The OPTIONS: " + JSON.stringify(this.options))
  console.log('THE TOKENS: ' + JSON.stringify(tokens));
  console.log("SESSION_ID: " +sessionId)
  console.log("SESSION: " + !this.options.sessionTokens)
  console.log("options.source" + this.options.source)
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

  if (state=="IOS"){
    tokens[req.query.session_state] = { ACCESS_TOKEN_CACHE_KEY : req.query.token_body, REFRESH_TOKEN_CACHE_KEY : "" }
    console.log("---------------------TOKENS------------------------------")
    console.log(JSON.stringify(tokens))
    console.log("---------------------END------------------------------")

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
        tokens[state] = { ACCESS_TOKEN_CACHE_KEY : access_token, REFRESH_TOKEN_CACHE_KEY : refresh_token }
        console.log(__dirname + '/signIn.html')
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
