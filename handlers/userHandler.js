var axios = require('axios');

function searchUser(next, options, callback){
  console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(options));
  var parameters = options.parameters;
  var userData = { name : parameters.name,
    lastname : parameters.lastname,
    email : parameters.email }

  var filter = ((userData.name) ? "startswith(displayName,'" + userData.name + "')" : '') +
      ((userData.lastname) ? ((userData.name) ? ' and ' : '') + "startswith(surname,'" + userData.lastname + "')" : '') +
      ((userData.email) ? ((userData.lastname || userData.name) ? ' and ' : '') + "startswith(mail,'" + userData.email + "')" : '');
  console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(options));
  console.log('searchUser.filter.pre.httpCall : ' + filter);
  console.log('searchUser.filter.pre.httpCall : ' + 'https://graph.microsoft.com/v1.0/users?$filter=' + filter);

  axios.get('https://graph.microsoft.com/v1.0/users?$filter=' + filter, {
    headers : {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + options.access_token
    }
  })
  .then((response) => {
    console.log('searchUser.response : ' + JSON.stringify(response.data));
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
    console.log('searchUser.error : ' + error);
    next(new Error());
  });

}

exports.searchUser = searchUser;
