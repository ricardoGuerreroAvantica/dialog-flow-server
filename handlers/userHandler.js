var axios = require('axios');

function searchUser(next, options, callback){
  console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(options));
  var parameters = options.parameters;
  var userData = { name : parameters.name,
    lastname : parameters.lastname,
    email : parameters.email }

  var filter = ((userData.name) ? "startswith(displayName,'" + userData.name + "')" : '') +
      ((userData.lastname) ? ((filter) ? ' and ' : '') + "startswith(surname,'" + userData.lastname + "')" : '') +
      ((userData.email) ? ((filter) ? ' and ' : '') + "startswith(mail,'" + userData.email + "')" : '');
  console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(options));
  axios.get('https://graph.microsoft.com/v1.0/users?$filter=' + filter, {
    headers : {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + options.access_token
    }
  })
  .then((response) => {
    console.log('searchUser.response : ' + JSON.stringify(response));
    if (response.data.value.length > 1){
      next(new Error());
    }
    if (response.data.value.length === 0){
      next(new Error());
    }
    options.user = {
      displayName : response.data.value[0].displayName,
      givenName : response.data.value[0].givenName,
      mail : response.data.value[0].mail,
      surname : response.data.value[0].surname,
    }
    console.log('searchUser.options : ' + JSON.stringify(options));
    next(options, callback);
  })
  .catch((error) => {
    console.log('searchUser.error : ' + JSON.stringify(error));
    next(new Error());
  });

}

exports.searchUser = searchUser;
