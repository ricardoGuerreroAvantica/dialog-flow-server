const request = require('superagent');

/**
 * Generates a GET request the user endpoint.
 * @param {string} accessToken The access token to send with the request.
 * @param {Function} callback
 */
function getUserData(accessToken, callback) {
  request
   .get('https://graph.microsoft.com/beta/me')
   .set('Authorization', 'Bearer ' + accessToken)
   .end((err, res) => {
     callback(err, res);
   });
}


function checkUserAvailable(accessToken, body,  callback){
  request
    .post('https://graph.microsoft.com/v1.0/me/findMeetingTimes')
    .set('Authorization', 'Bearer ' + accessToken)
    .send(body)
    .end((err, res) => {
      callback(err, res.body);
    });
}


function searchUser(accessToken, userData, callback){
  var name = (userData.name) ? userData.name : ''
  var filter = '$filter=';

  if (userData.email){
    filter += "startswith(mail,'" + userData.email + "')";
  }else {
    filter += (userData.name) ? "startswith(displayName,'" + userData.name + "')" : '';
    filter += (userData.lastname) ? " and startswith(surname,'" + userData.lastname + "')" : '';
  }
  
  request
    .get('https://graph.microsoft.com/v1.0/users?' + filter)
    .set('Authorization', 'Bearer ' + accessToken)
    .end((err, res) => {
      callback(err, res.body);
    });
}

exports.getUserData = getUserData;
exports.checkUserAvailable = checkUserAvailable;
exports.searchUser = searchUser;
