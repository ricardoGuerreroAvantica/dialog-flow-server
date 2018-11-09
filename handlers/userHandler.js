var axios = require('axios');
var users = "";
var commons = require('../utils/commons.js');


function preSearchUser(next, options, callback){

  try{
    var parameters = options.parameters;
  console.log("preSearchUser.parameters: " + JSON.stringify(parameters))
  var userData = { name : parameters.name,
    lastname : parameters.lastname,
    secondName : parameters.secondName,
    secondLastname : parameters.secondLastname,
    email : parameters.email }
  if( userData.lastname || userData.name){
    console.log("Name :" + (parameters.name) ? (unescape(encodeURIComponent(String(userData.name)))) : '')
    console.log("secondName :" + (parameters.secondName) ? (" " + unescape(encodeURIComponent(userData.secondName))) : '')
    console.log("lastname :" + (parameters.lastname) ? (" " + unescape(encodeURIComponent(userData.lastname))) : '')
    console.log("secondLastname :" + (parameters.secondLastname) ? (" " + unescape(encodeURIComponent(userData.secondLastname))) : '')
    var filter =  ("startswith(displayName,'" +
                  ((parameters.name) ? (unescape(encodeURIComponent(String(userData.name)))) : '')+
                  ((parameters.secondName) ? (" " + unescape(encodeURIComponent(userData.secondName))) : '')+
                  ((parameters.lastname) ? (" " + unescape(encodeURIComponent(userData.lastname))) : '')+
                  ((parameters.secondLastname) ? (" " + unescape(encodeURIComponent(userData.secondLastname))) : '')
                  + "')")

    console.log("The token"+ JSON.stringify(options.access_token))
    var url = 'https://graph.microsoft.com/v1.0/users?$filter=';
    console.log("preSearchUser.graph:  "+url+filter)
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
      console.log('preSearchUser.response : ' + JSON.stringify(response.data));
      if (response.data.value.length === 0){
        next(options, callback);
      }
      if (response.data.value.length > 1){
        options.message = "There is more than one employee with this description, maybe you are searching for:\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\n"
        for(i = 0; i < response.data.value.length; i++ ){
          console.log(response.data.value[i])
          if ( i!= response.data.value.length-1){
            console.log("The response data" + response.data.value[i].displayName)
            options.message += response.data.value[i].displayName + '.\n'+'Email:'+response.data.value[i].mail+ '.\n\n';
          }
          else{
            console.log("The response data" + response.data.value[i].displayName)
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
        console.log("The user: " +JSON.stringify(options.user))
      }
        next(options, callback);
      })
    }
    else{
      next(options, callback);
    }
  }
  catch(err){
    console.log(err)
  }
}

//If the user exists, it will change the message to Ask for the next parameter(Date)
function checkUser(options, callback){
  if(options.user){
    options.message = "What is the date?"
    callback(options);
  }
  callback(options);
}


function searchUser(next, options, callback){
  var parameters = options.parameters;
  console.log("searchUser.user: " + JSON.stringify(options.user))
  console.log("searchUserParameters: " + JSON.stringify(parameters))
  if(!options.user){
    console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(options));
    var userData = { name : parameters.name,
      lastname : parameters.lastname,
      secondName : parameters.secondName,
      secondLastname : parameters.secondLastname,
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
        console.log("Sorry I couldn't find any user with this description: \n");
        console.log(JSON.stringify(userData));
        options.message = ("Sorry I couldn't find any user with this description: ") + (userData.name ? (("\nName: ") + userData.name) : "") 
        +(userData.secondName ? (" "+userData.secondName)  : "") + (userData.lastname ? (" "+userData.lastname)  : "")+(userData.secondLastname ? (" " + userData.secondLastname)  : "") + (userData.email ? (("\nEmail: ") + (userData.email)) : "");
        callback(options);
      }
      if (response.data.value.length > 1){
        console.log("Evaluating the new message")
        options.message = "There is more than one employee with this description, maybe you are searching for:\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\n"
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
  }
  else{
    next(options, callback);
  }

}


function helper(options, callback){
  console.log(JSON.stringify(options));
  let space = commons.getChangeLine(options.source);
  if (options.parameters.helperId == "basic"){
    options.message = "Can you tell me how I can help you?"
                      +space+space+"▶ How to create an event?"
                      +space+space+"▶ How to check if someone is available?"
                      +space+space+"▶ How to check my events?"
                      +space+space+"▶ How can I invite someone?"
                      +space+space+"▶ How can I see my event information?"
                      +space+space+"▶ How can I change my event information?";
  }
  if (options.parameters.helperId == "event"){
    options.message = "Here are some examples of how can you create a event:"
                      +space+space+"▶ Create new event example today at 3:00pm for 40 minutes."
                      +space+space+"▶ Create a new event."
                      +space+space+"▶ Create new event testing on 4 sep at 14:00."
                      +space+space+"____________________"
                      +space+space+"To complete the creation only say \"Done\"";
  }
  if (options.parameters.helperId == "available"){
    options.message = "To check someone availability you can use their first name or their email:"
                      +space+space+"▶ Is Ricardo Guerrrero Available today at now?"
                      +space+space+"▶ Is Ricardo guerrero Available"
                      +space+space+"▶ Is ricardo.guerero@avantica.net is available in 20 oct at 7am";   
  }
  if (options.parameters.helperId == "invite"){
    options.message = "To invite or Uninvite someone to the event you can just write this:"
                      +space+space+"▶ Add Ricardo Guerrero"  
                      +space+space+"▶ remove Ricardo Guerrero"                
                      +space+space+"▶ Invite ricardo.guerrero@avantica.net"
                      +space+space+"▶ Uninvite ricardo.guerrero@avantica.net";  
  }
  if (options.parameters.helperId == "myEvents"){
    options.message = "You can see your events from a date or a period using this:"
                      +space+space+"▶ My events"
                      +space+space+"▶ Show me my events"
                      +space+space+"▶ Show me my events from monday to friday"
                      +space+space+"▶ Show any events called wellness program";  
  }
  if (options.parameters.helperId == "eventInfo"){
    options.message = "After you start the event creation you can see your event information using this:"
                      +space+space+"▶ Show my event body"
                      +space+space+"▶ Show Information"
                      +space+space+"▶ How does my event look?"
                      +space+space+"▶ My event information";  
  }
  if (options.parameters.helperId == "updateEventInfo"){
    options.message = "After you start the event creation, you can change your event information using this:"
                      +space+space+"▶ Change the name to [new name]"
                      +space+space+"▶ Change the date to [new date]"
                      +space+space+"▶ Change the time to [new time]"
                      +space+space+"▶ Change the duration to [new duration]";  
  }
  callback(options);
}

exports.preSearchUser = preSearchUser;
exports.searchUser = searchUser;
exports.helper = helper;
exports.checkUser = checkUser;