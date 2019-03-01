var OAuth = require("oauth")

var credentials = {
  authority: "https://login.microsoftonline.com/common",
  authorize_endpoint: "/oauth2/authorize",
  token_endpoint: "/oauth2/token",
  logout_endpoint: "/oauth2/logout",
  client_id: "f9c030a5-9a75-4ae7-add2-55330dc196c4",
  client_secret: "ckgoMKCP65ilpGDY960[;?@",
  scope : "Calendars.ReadWrite.Shared"+
          "%20Calendars.ReadWrite"+
          "%20User.ReadBasicAll"+
          "%20MailboxSettings.ReadWrite"+
          "%20User.ReadWrite",
  redirect_uri: "https://sjo-calendar-bot.azurewebsites.net/signIn",
  resouce: "https://graph.microsoft.com/"
}
var tokens = {}


/**
 * This function check from where the information comes "Skype" or "Mobile"
 * and proceed to save all the basic information from the user in the options property.
 * @param {JSON} req.body this part of request contains the access token to microsoft graph, 
 * source of the request (skype or mobile) and the Id to identify the device
 */
function validSession(next, req, res, callback){
  var reqJSONBody= JSON.parse(JSON.stringify(req.body))
  this.options = {}  
  if (req.body.originalRequest && req.body.originalRequest.source === "skype"){
    //LOGIN SKYPE
    if(reqJSONBody.originalRequest.data.user){
      this.options.sessionId = reqJSONBody.originalRequest.data.user.id
    }
    else{
      this.options.sessionId = reqJSONBody.originalRequest.data.data.user.id
    }
    
    this.options.source = "skype"

  }else {
    //LOGIN MOBILE
    var IOSId = reqJSONBody.result.contexts

    IOSFiltered = IOSId.filter(filter)
    var IOSName=IOSFiltered[0].name
    if (IOSName && IOSName != "session"){
    this.options.sessionId = IOSName
    this.options.source = "ios"

    }
  }
  next(req, res, callback)
}


/**
 * This is a helper function is a helper to filter all the context to find the token send 
 * by the mobile application 
 * @param {JSON} jsonObject contains all the context send by dialogflow.
 */
function filter(jsonObject) {
  return jsonObject.name != "createevent" && 
         jsonObject.name != "invites" && 
         jsonObject.name != "helperhandler" && 
         jsonObject.name != "check_available_context"
}

/**
 * This function checks if the access token of the user is saved in memory
 * if not, return the link access to log in the app. 
 * @param {string} options.sessionId The identifier of the device used by the user.
 * @param {JSON} options.sessionTokens this json is a dictionary that contains all the tokens store in memory 
 * {Key: options.sessionId, Value: Token}.
 */
function validUser(next, req, res, callback){
  var sessionId = this.options.sessionId
  this.options.sessionTokens = tokens[sessionId]
  console.log("validUser.options.tokens"+JSON.stringify(this.options.sessionTokens))

  if (!this.options.sessionTokens){
    if(this.options.source == "ios"){
      return res.json({ speech: "Your access token is invalid, please go back and re-enter the chat", displayText: "Confirmation", source: "dialog-server-flow" })
    }
    else{
      return res.json({ speech: "Please login " + getAuthUrl(sessionId), displayText: "Please login", source: "dialog-server-flow" })
    }
    
  }
  next(req, res, callback)
}

/**
 * Checks if the user token is expired and proceed to refresh it.
 * @param {string} options.access_token The token to access microsoft graph services.
 * @param {string} options.refresh_token The token to refresh the access_token.
 * @param {JSON} options.sessionTokens this json is a dictionary that contains all the tokens store in memory 
 * {Key: options.sessionId, Value: Token}.
 */
function refreshToken(next, options, callback) {
  if(options.sessionTokens.REFRESH_TOKEN_CACHE_KEY ==""){
    options.access_token = options.sessionTokens.ACCESS_TOKEN_CACHE_KEY
    options.refresh_token = options.sessionTokens.REFRESH_TOKEN_CACHE_KEY
    next(options, callback)
  }
  else{
    var OAuth2 = OAuth.OAuth2
    var oauth2 = new OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.authority,
      credentials.authorize_endpoint,
      credentials.token_endpoint
    )
    oauth2.getOAuthAccessToken(
      options.sessionTokens.REFRESH_TOKEN_CACHE_KEY,
      {
        grant_type: "refresh_token",
        redirect_uri: credentials.redirect_uri,
        resource: credentials.resouce
      },
      function(error, access_token, refresh_token, results){
        if (error){
          next(new Error())
        }
        options.access_token = access_token
        options.refresh_token = refresh_token
        next(options, callback)
      }
    )
  }
}


/**
 * Checks if the user token is expired and proceed to refresh it.
 * @param {string} options.access_token The token to access microsoft graph services.
 * @param {string} options.refresh_token The token to refresh the access_token.
 * @param {JSON} options.sessionTokens this json is a dictionary that contains all the tokens store in memory 
 * {Key: options.sessionId, Value: Token}.
 */
async function promiseRefreshToken(options) {
  let refreshTokenPromise = new Promise((resolve, reject) => {
      if(options.sessionTokens.REFRESH_TOKEN_CACHE_KEY ==""){
        options.access_token = options.sessionTokens.ACCESS_TOKEN_CACHE_KEY
        options.refresh_token = options.sessionTokens.REFRESH_TOKEN_CACHE_KEY
        resolve("Success")
      }
      else{
        var OAuth2 = OAuth.OAuth2
        var oauth2 = new OAuth2(
          credentials.client_id,
          credentials.client_secret,
          credentials.authority,
          credentials.authorize_endpoint,
          credentials.token_endpoint
        )
        oauth2.getOAuthAccessToken(
          options.sessionTokens.REFRESH_TOKEN_CACHE_KEY,
          {
            grant_type: "refresh_token",
            redirect_uri: credentials.redirect_uri,
            resource: credentials.resouce
          },
          function(error, access_token, refresh_token, results){
            if (error){
              reject("Error")
            }
            options.access_token = access_token
            options.refresh_token = refresh_token
            resolve("Success")
          }
        )
      }
    })
  let result = await refreshTokenPromise

  console.log("refreshTokenPromise: "+result)
  return options

}



/**
 * This function receive the tokens form the user and save the credentials of the user
 * in the memory of the app.
 * @param {string} req.query.state This variable only specifies if the request come from Mobile or Skype 
 */
function signIn(req, res){
  var state = req.query.state
  var code = req.query.code
  console.log("Check: "+JSON.stringify(req.body))
  try{
    var reqJSONBody = JSON.parse(JSON.stringify(req.body))
  }
  catch(error){
    console.log("Error" + error)
  }
  if (reqJSONBody.state=="IOS"){
    tokens[reqJSONBody.session_state] = {ACCESS_TOKEN_CACHE_KEY : reqJSONBody.token_body
                                        , REFRESH_TOKEN_CACHE_KEY : ""}
    console.log("!! Successful log in")
    return res.json({ response : { description : "Login Successful in ios mobile" } })
  }
  else{
    console.log("!! Failed log in")
    if (!code) {
      console.log("!! Code error")
      return res.json({ error : { name : "Code error", description : "An error ocurred login to Microsoft Graph" } })
    }
    if (!state) {
      console.log("!! State error")
      return res.json({ error : { name : "State error", description : "Can't find a unique key for the user" } })
    }
    getTokenFromCode(code, (error, access_token, refresh_token, sessionId) => {
      if (!error) {
        tokens[state] = {ACCESS_TOKEN_CACHE_KEY : access_token, REFRESH_TOKEN_CACHE_KEY : refresh_token}


        return res.sendFile(__dirname + "/signIn.html")
      }else{
        res.status(500)
        return res.json({ error : { name : "State error", description : error.data } })
      }
    })
  }
}

/**
 * this function contact azure to get the token form a Auth 
 * request to microsoft graph
 */
function getTokenFromCode(code, callback) {
  var OAuth2 = OAuth.OAuth2
  var oauth2 = new OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.authority,
    credentials.authorize_endpoint,
    credentials.token_endpoint
  )

  oauth2.getOAuthAccessToken(
    code,
    {
      grant_type: "authorization_code",
      redirect_uri: credentials.redirect_uri,
      resource: credentials.resouce
    },
    function(e, access_token, refresh_token, results){
      callback(e, access_token, refresh_token)
    }
  )
}


/**
 * returns the access link to microsoft graph authentication 
 * this link will be send to the skype user so they can access get
 * the access token and send it to be registered.
 */
function getAuthUrl(state) {
  return credentials.authority + credentials.authorize_endpoint +
    "?client_id=" + credentials.client_id +
    "&response_type=code" +
    "&scope=" + credentials.scope +
    "&redirect_uri=" + credentials.redirect_uri +
    "&state=" + state
}


exports.promiseRefreshToken = promiseRefreshToken
exports.refreshToken = refreshToken
exports.validSession = validSession
exports.validUser = validUser
exports.signIn = signIn
