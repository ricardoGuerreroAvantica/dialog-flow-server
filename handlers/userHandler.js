var axios = require('axios');
/**
 * This function is in charge of searching for the user and check if it exists in the (avantica) microsoft graph database
 * @param {JSON} options.parameters this value contains all the information from the user obtained from dialog flow.
 * @param {JSON} options.message this value contains the return message that will be send to dialog flow
 */
async function preSearchUser(options){
  console.log("the options: "+JSON.stringify(options))
  let promise = new Promise((resolve, reject) => {
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
      filter= filter.replace("   "," ").replace("  "," ");
      var url = 'https://graph.microsoft.com/v1.0/users?$filter=';
      axios.get(url + filter, {
        headers : {
          'Content-Type': 
          'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + options.access_token
        }
      })
      .then((response) => {
        console.log("response.data" + JSON.stringify(response.data))
        options.message = "";
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
          resolve("Success");
        }

        if (response.data.value.length === 0){
          options.message = ("Sorry I couldn't find any user with this description: ") + (userData.name ? (("\nName: ") + userData.name) : "") 
          +(userData.secondName ? (" "+userData.secondName)  : "") + (userData.lastname ? (" "+userData.lastname)  : "")+(userData.secondLastname ? (" " + userData.secondLastname)  : "") + (userData.email ? (("\nEmail: ") + (userData.email)) : "");
          resolve("Success");
        }
        else{
          options.user = {
          displayName : response.data.value[0].displayName,
          givenName : response.data.value[0].givenName,
          mail : response.data.value[0].mail,
          surname : response.data.value[0].surname
          }
        }
        resolve("Success");
        })
      }
      else{
        resolve("Success");
      }
    }
    catch(err){
      console.log(err)
      reject("error")
    }
  });
  await promise;
  return options
}

/**
 * This function checks if the user is register in the options.
 * If the username send was found and store, it will change the message to Ask for the next parameter(Date)
 * @param {JSON} options.user contains the user information obtained after the authentication.
 * @param {JSON} options.message contains the return message that will be send to dialog flow
 */
function checkUser(options, callback){
  if(options.user){
    options.message = "What is the date?"
    callback(options);
  }
  callback(options);
}

/**
 * This functions create and send all the helper messages according to "options.parameters.helperId"
 * @param {JSON} options.parameters.helperId this variable is defined in dialog flow and defines what kind of helper
 * the user is asking for.
 * @param {JSON} options.message contains the return message that will be send to dialog flow
 */
function helper(options, callback){
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