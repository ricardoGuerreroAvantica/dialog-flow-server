var axios = require('axios');
var users = ""
function searchUser(next, options, callback){
  ////console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(options));
  var parameters = options.parameters;
  var userData = { name : parameters.name,
    lastname : parameters.lastname,
    email : parameters.email }

  var filter = ((userData.name) ? "startswith(displayName,'" + userData.name + "')" : '') +
  ((userData.lastname) ? ((userData.name) ? ' and ' : '') + "startswith(surname,'" + userData.lastname + "')" : '') +
  ((userData.email) ? ((userData.lastname || userData.name) ? ' and ' : '') + "startswith(mail,'" + userData.email + "')" : '');
      
  var url = 'https://graph.microsoft.com/v1.0/users?$filter=';
  //console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(options));
  //console.log('searchUser.filter.pre.httpCall : ' + filter);
  //console.log('searchUser.filter.pre.httpCall : ' + url + filter);
  
  //console.log("NEW USER TOKEN: " + 'Bearer ' + options.access_token);
  axios.get(url + filter, {
    headers : {
      'Content-Type': 
      'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + options.access_token
    }
  })
  .then((response) => {
    console.log('searchUser.response : ' + JSON.stringify(response.data));
    if (response.data.value.length === 0){
      next(new Error());
    }
    if (response.data.value.length > 1){
      console.log("JSON VALUE = " + JSON.stringify(response.data.value))
      for(i = 0; i < response.data.value.length; i++ ){
        console.log(response.data.value[i])
        options.message += response.data.value[i].displayName + '\n';
      }
      console.log(options.message)
    }
    else{
      options.user = {
      displayName : response.data.value[0].displayName,
      givenName : response.data.value[0].givenName,
      mail : response.data.value[0].mail,
      surname : response.data.value[0].surname,
      }
    }
    //console.log('searchUser.options : ' + JSON.stringify(options));
    next(options, callback);
  })
  .catch((error) => {
    //console.log('searchUser.error : ' + error);
    next(new Error());
  });
}

exports.searchUser = searchUser;
