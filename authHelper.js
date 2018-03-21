var OAuth = require('oauth');

//https://dialog-flow-service.herokuapp.com/login
//http://localhost:3000/login
// The application registration (must match Azure AD config)
var credentials = {
  authority: 'https://login.microsoftonline.com/common',
  authorize_endpoint: '/oauth2/authorize',
  token_endpoint: '/oauth2/token',
  logout_endpoint: '/oauth2/logout',
  client_id: '2e1f2117-632c-43e6-a7d8-a4f4d4fbf1d0',
  client_secret: 'vzqWUXQ0625%:zfeuHYJ4%:',
  redirect_uri: 'http://localhost:3000/login',
  resouce: 'https://graph.microsoft.com/'
};

/**
 * Generate a fully formed uri to use for authentication based on the supplied resource argument
 * @return {string} a fully formed uri with which authentication can be completed
 */
function getAuthUrl(state) {
  return credentials.authority + credentials.authorize_endpoint +
    '?client_id=' + credentials.client_id +
    '&response_type=code' +
    '&redirect_uri=' + credentials.redirect_uri +
    '&state=' + state;
}

/**
 * Gets a token for a given resource.
 * @param {string} code An authorization code returned from a client.
 * @param {AcquireTokenCallback} callback The callback function.
 */
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


/**
 * Gets a new access token via a previously issued refresh token.
 * @param {string} res The OAuth resource for which a token is being request.
 *                     This parameter is optional and can be set to null.
 * @param {string} refreshToken A refresh token returned in a token response
 *                       from a previous result of an authentication flow.
 * @param {AcquireTokenCallback} callback The callback function.
 */
function getTokenFromRefreshToken(refreshToken, callback) {
  var OAuth2 = OAuth.OAuth2;
  var oauth2 = new OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.authority,
    credentials.authorize_endpoint,
    credentials.token_endpoint
  );

  oauth2.getOAuthAccessToken(
    refreshToken,
    {
      grant_type: 'refresh_token',
      redirect_uri: credentials.redirect_uri,
      resource: credentials.resouce
    },
    function(e, access_token, refresh_token, results){
      callback(e, results);
    }
  );
}


function wrapRequestAsCallback(tokenKey, callback) {
  getTokenFromRefreshToken(tokenKey, function (e, results) {
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


exports.credentials = credentials;
exports.getAuthUrl = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode;
exports.getTokenFromRefreshToken = getTokenFromRefreshToken;
exports.wrapRequestAsCallback = wrapRequestAsCallback;
exports.ACCESS_TOKEN_CACHE_KEY = 'ACCESS_TOKEN_CACHE_KEY';
exports.REFRESH_TOKEN_CACHE_KEY = 'REFRESH_TOKEN_CACHE_KEY';
