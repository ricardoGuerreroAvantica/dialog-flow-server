var axios = require('axios');
var commons = require('../utils/commons.js');

//This function is in charge of searching for the user and check if it exists in the microsoft graph database
function preSearchUser(next, options, callback){
  try{
    var parameters = options.parameters;
    var userData = { name : parameters.name,
    lastname : parameters.lastname,
    secondName : parameters.secondName,
    secondLastname : parameters.secondLastname,
    email : parameters.email }
  if( userData.secondName || userData.name){
    var filter =  ((("startswith(displayName,'" +
                  ((parameters.name) ? (unescape(encodeURIComponent(String(userData.name)))) : "")+
                  ((parameters.secondName) ? (unescape(encodeURIComponent(" " + userData.secondName))) : "")+
                  ((parameters.lastname) ? (unescape(encodeURIComponent(" " + userData.lastname))) : "")+
                  ((parameters.secondLastname) ? (unescape(encodeURIComponent(" " +userData.secondLastname))) : "")).trim()
                  +"')"));
    console.log("before"+filter);
    filter= filter.replace("   "," ").replace("  "," ");
    console.log("after"+filter);
    var url = 'https://graph.microsoft.com/v1.0/users?$filter=';
    console.log("preSearchUser.graph filter: "+url+filter)
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
      console.log(response.data.value.length === 0)
      console.log("response.data.value: "+JSON.stringify(response.data.value))
      if (response.data.value.length === 0){
        options.message = ("Sorry I couldn't find any user with this description: ") + (userData.name ? (("\nName: ") + userData.name) : "") 
        +(userData.secondName ? (" "+userData.secondName)  : "") + (userData.lastname ? (" "+userData.lastname)  : "")+(userData.secondLastname ? (" " + userData.secondLastname)  : "") + (userData.email ? (("\nEmail: ") + (userData.email)) : "");
        callback(options);
      }
      if (response.data.value.length > 1){
        options.message = "There is more than one employee with this description, maybe you are searching for:\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\n"
        for(i = 0; i < response.data.value.length; i++ ){
          if ( i!= response.data.value.length-1){
            options.message += response.data.value[i].displayName + '.\n'+'Email:'+response.data.value[i].mail+ '.\n\n';
          }
          else{
            options.message += response.data.value[i].displayName + '.\n'+'Email:'+response.data.value[i].mail+ '.';
          }
        }
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

//If the username sended was found and store, it will change the message to Ask for the next parameter(Date)
function checkUser(options, callback){
  if(options.user){
    options.message = "What is the date?"
    callback(options);
  }
  callback(options);
}


//This functions create and send all the helper messages
function helper(options, callback){
  console.log(JSON.stringify(options));
  if (options.parameters.helperId == "basic"){
    options.message = "Can you tell me how I can help you?"
                      +"\n▶ How to create an event?"
                      +"\n▶ How to check if someone is available?"
                      +"\n▶ How to check my events?"
                      +"\n▶ How can I invite someone?"
                      +"\n▶ How can I see my event information?"
                      +"\n▶ How can I change my event information?";
  }
  if (options.parameters.helperId == "event"){
    options.message = "Here are some examples of how can you create a event:"
                      +"\n▶ Create new event example today at 3:00pm for 40 minutes."
                      +"\n▶ Create a new event."
                      +"\n▶ Create new event testing on 4 sep at 14:00."
                      +"\n____________________"
                      +"\nTo complete the creation only say \"Done\"";
  }
  if (options.parameters.helperId == "available"){
    options.message = "To check someone availability you can use their first name or their email:"
                      +"\n▶ Is Ricardo Guerrrero Available today at now?"
                      +"\n▶ Is Ricardo guerrero Available"
                      +"\n▶ Is ricardo.guerero@avantica.net is available in 20 oct at 7am";   
  }
  if (options.parameters.helperId == "invite"){
    options.message = "To invite or Uninvite someone to the event you can just write this:"
                      +"\n▶ Add Ricardo Guerrero"  
                      +"\n▶ remove Ricardo Guerrero"                
                      +"\n▶ Invite ricardo.guerrero@avantica.net"
                      +"\n▶ Uninvite ricardo.guerrero@avantica.net";  
  }
  if (options.parameters.helperId == "myEvents"){
    options.message = "You can see your events from a date or a period using this:"
                      +"\n▶ My events"
                      +"\n▶ Show me my events"
                      +"\n▶ Show me my events from monday to friday"
                      +"\n▶ Show any events called wellness program";  
  }
  if (options.parameters.helperId == "eventInfo"){
    options.message = "After you start the event creation you can see your event information using this:"
                      +"\n▶ Show my event body"
                      +"\n▶ Show Information"
                      +"\n▶ How does my event look?"
                      +"\n▶ My event information";  
  }
  if (options.parameters.helperId == "updateEventInfo"){
    options.message = "After you start the event creation, you can change your event information using this:"
                      +"\n▶ Change the name to [new name]"
                      +"\n▶ Change the date to [new date]"
                      +"\n▶ Change the time to [new time]"
                      +"\n▶ Change the duration to [new duration]";  
  }
  callback(options);
}

exports.preSearchUser = preSearchUser;
exports.helper = helper;
exports.checkUser = checkUser;