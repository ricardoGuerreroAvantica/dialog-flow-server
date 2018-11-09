var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');

function showLocations(options, callback){
  axios.get('https://graph.microsoft.com/beta/me/findRooms', {
    headers : {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + options.access_token
    }
  })
  .then((response) => {
    if (response.data.value.length > 0){
      var locations = response.data.value;
      options.message = options.speech = "Found these locations: \n\n";
      options.message += '¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯' + '\n\n';
      locations.forEach((location) => {
        message += location.name + '\n\n';
      });
      callback(options);
    }else{
      options.message = options.speech = "There aren't any location available \n\n";
      callback(options);
    }
  })
  .catch((error) => {
    //console.log('showLocations.error : ' + error);
    errorHandler.actionError(error);
  });

}



exports.showLocations = showLocations;
