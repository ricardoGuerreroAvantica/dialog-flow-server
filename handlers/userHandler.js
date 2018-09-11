var axios = require('axios');
var users = ""
function searchUser(next, options, callback){
  console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(options));
  var parameters = options.parameters;
  var userData = { name : parameters.name,
    lastname : parameters.lastname,
    email : parameters.email }

  var filter = ((userData.name) ? "startswith(displayName,'" + userData.name + "')" : '') +
  ((userData.lastname) ? ((unescape(encodeURIComponent(userData.name))) ? ' and ' : '') + "startswith(surname,'" + unescape(encodeURIComponent(userData.lastname)) + "')" : '') +
  ((userData.email) ? ((unescape(encodeURIComponent(userData.lastname)) || unescape(encodeURIComponent(userData.name))) ? ' and ' : '') + "startswith(mail,'" + unescape(encodeURIComponent(userData.email)) + "')" : '');
      
  var url = 'https://graph.microsoft.com/v1.0/users?$filter=';
  
  //console.log('searchUser.filter.pre.httpCall : ' + filter);
  console.log('searchUser.filter.pre.httpCall : ' + url + filter);
  
  console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(url + filter, {    headers : { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + options.access_token}}));

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
    options.message = "";
    console.log('searchUser.response : ' + JSON.stringify(response.data));
    if (response.data.value.length === 0){
      next(new Error());
    }
    if (response.data.value.length > 1){
      console.log("Evaluating the new message")
      options.message = "There is more than one employee with this description, maybe you are searching for:\n"
      
      console.log("New Message = " + options.message)
      next(options, callback);
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
