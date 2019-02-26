var axios = require("axios")
var textResponses =require("./../constants/TextResponses")

/**
 * This function is in charge of searching for the user and check if it exists in the (avantica) microsoft graph database
 * @param {JSON} options.parameters this value contains all the information from the user obtained from dialog flow.
 * @param {JSON} options.message this value contains the return message that will be send to dialog flow
 */
async function preSearchUser(options){
  let promise = new Promise((resolve, reject) => {
    try{
      var parameters = options.parameters
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
                    +"')"))
      filter= filter.replace("   "," ").replace("  "," ")
      var url = textResponses.graphRequests.users
      axios.get(url + filter, {
        headers : {
          "Content-Type": 
          "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + options.access_token
        }
      })
      .then((response) => {
        console.log("response.data" + JSON.stringify(response.data))
        options.message = ""
        if (response.data.value.length > 1){
          options.message = textResponses.preSearchUserResponses.initialMessage
          
          for(i = 0; i < response.data.value.length; i++ ){
            if ( i!= response.data.value.length-1){
              options.message += response.data.value[i].displayName + ".\n"+"Email:"+response.data.value[i].mail+ ".\n\n"
            }
            else{
              options.message += response.data.value[i].displayName + ".\n"+"Email:"+response.data.value[i].mail+ "."
            }
          }
          resolve("Success")
        }
        if (response.data.value.length === 0){
          options.message = textResponses.preSearchUserResponses.failureMessage + (userData.name ? (("\nName: ") + userData.name) : "") 
          +(userData.secondName ? (" "+userData.secondName)  : "") + (userData.lastname ? (" "+userData.lastname)  : "")+(userData.secondLastname ? (" " + userData.secondLastname)  : "") + (userData.email ? (("\nEmail: ") + (userData.email)) : "")
          resolve("Success")
        }
        if (response.data.value.length == 1){
          options.user = {
          displayName : response.data.value[0].displayName,
          givenName : response.data.value[0].givenName,
          mail : response.data.value[0].mail,
          surname : response.data.value[0].surname
          }
        }
        resolve("Success")
        })
      }
      else{
        resolve("Success")
      }
    }
    catch(err){
      console.log(err)
      reject("error")
    }
  })
  await promise
  return options
}


/**
 * This functions create and send all the helper messages according to "options.parameters.helperId"
 * @param {JSON} options.parameters.helperId this variable is defined in dialog flow and defines what kind of helper
 * the user is asking for.
 * @param {JSON} options.message contains the return message that will be send to dialog flow
 */
function helper(options){
  if (options.parameters.helperId == "basic"){
    options.message = textResponses.helperResponses.helperBasic
  }
  if (options.parameters.helperId == "event"){
    options.message = textResponses.helperResponses.helperEvent
  }
  if (options.parameters.helperId == "available"){
    options.message = textResponses.helperResponses.helperAvailable
  }
  if (options.parameters.helperId == "invite"){
    options.message = textResponses.helperResponses.helperInvite
  }
  if (options.parameters.helperId == "myEvents"){
    options.message = textResponses.helperResponses.helperMyEvents
  }
  if (options.parameters.helperId == "eventInfo"){
    options.message = textResponses.helperResponses.helperEventInfo
  }
  if (options.parameters.helperId == "updateEventInfo"){
    options.message = textResponses.helperResponses.helperUpdateEvent
  }
  return options
}

exports.preSearchUser = preSearchUser
exports.helper = helper
