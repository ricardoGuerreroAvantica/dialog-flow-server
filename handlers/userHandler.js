var axios = require('axios');
var users = "";

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
  
  console.log('searchUser.filter.pre.httpCall : ' + filter);
  console.log('searchUser.filter.pre.httpCall : ' + url + filter);
  
  console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(url + filter, {    headers : { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + options.access_token}}));

  console.log("NEW USER TOKEN: " + 'Bearer ' + options.access_token +'  end ');
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
    if (filter = ""){
      options.message = ("can you change the format of your answer please?");
      callback(options);
    }

    if (response.data.value.length === 0){
      console.log("No user found");
      console.log("Sorry i couldn't find any user with this discription: \n");
      console.log(JSON.stringify(userData));
      options.message = ("Sorry i couldn't find any user with this discription: ") + (userData.name ? (("\nName: ") + userData.name) : "") 
      + " " +(userData.lastname ? (userData.lastname)  : "") +(userData.email ? (("\nEmail: ") + (userData.email)) : "");
      callback(options);
    }
    if (response.data.value.length > 1){
      console.log("Evaluating the new message")
      options.message = "There is more than one employee with this description, maybe you are searching for:\n-----------------\n"
      for(i = 0; i < response.data.value.length; i++ ){
        console.log(response.data.value[i])
        if ( i!= response.data.value.length-1){
          options.message += response.data.value[i].displayName + '.\n'+'Email:'+response.data.value[i].mail+ '.\n\n';
        }
        else{
          options.message += response.data.value[i].displayName + '.\n'+'Email:'+response.data.value[i].mail+ '.';
        }
      }
      console.log("New Message = " + options.message)
      callback(options);
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


function helper(options, callback){
  console.log(JSON.stringify(options));
  options.message = "HELP HERE!"
  callback(options);
}


exports.searchUser = searchUser;
exports.helper = helper;
