var commons = require('../utils/commons.js')

/**
 * This function is in charge of adding a user to the invites inside the dialogflow contexts.
 * @param {JSON} options.invites contains all the current invitations of the event.
 * @param {JSON} options.user contains the user information obtained after the authentication.
 * @param {JSON} options.message contains the return message that will be send to dialog flow
 */
async function inviteUser(options){
  let promise = new Promise((resolve, reject) => {
  if (options.message == ""){
      var user = options.user
      var invite = { "emailAddress": { "address":user.mail, "name": user.displayName }, "type": "required" }
      if (!commons.getContext(options.contexts, 'invites')){
        options.contexts.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 60 })
      }

      options.contexts.forEach((context) => {
        if (context.name === 'invites'){
          options.message = options.speech = 'Current invitation list:\n'
          context.parameters.invites.forEach((invite) => {
            let userEntry = new String(user.mail)
            let userStored = new String(invite.emailAddress.address)
            options.message = options.speech += invite.emailAddress.name+", email: "+invite.emailAddress.address+'\n'
            var isEqual = JSON.stringify(userEntry) === JSON.stringify(userStored)

            if (isEqual){
              options.message = options.speech = user.displayName + ' is already invited'
              resolve("Success")
            }
          })
          options.message = options.speech += user.displayName +", email: "+ user.mail
          context.parameters.invites.push(invite)
          resolve("Success")
        }
      })
      if (options.speech==''){
        options.message = options.speech = " Couldn't uninvite " + user.displayName
        resolve("Success")
      }

    }
    resolve("Success")
  })
  await promise
  return options
}

/**
 * this function is in charge of showing to the user all the current invites stored in dialogflow contexts.
 * @param {JSON} options.invites contains all the current invitations of the event.
 * @param {JSON} options.user contains the user information obtained after the authentication.
 * @param {JSON} options.message contains the return message that will be send to dialog flow
 */

function showInvites(options, callback){
  var invitesContext = commons.getContext(options.contexts, 'invites')
  if (!invitesContext){
    options.message = options.speech = `There are no invitations yet.`
    callback(options)
  }
  var invites = invitesContext.parameters.invites
  options.message = options.speech = `These are your current attendees:\n`
  invites.forEach((invite) => {
    options.message += invite.emailAddress.name + " Email: " + invite.emailAddress.address + '\n'
  })
  callback(options)
}

/**
 * This function will delete a invite from the dialogflow temporal contexts
 * @param {JSON} options.invites contains all the current invitations of the event.
 * @param {JSON} options.parameters this value contains all the information from the user obtained from dialog flow.
 * @param {JSON} options.message contains the return message that will be send to dialog flow
 */
function deleteInvite(options, callback){
  var parameters = options.parameters
  var userData = { name : parameters.name, lastname : parameters.lastname, email : parameters.email }
  if (!commons.getContext(options.contexts, 'invites')){
    options.contexts.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 10 })
    options.message = options.speech = 'Couldnt find ' + ((userData.name) ? userData.name: userData.email)
    callback(options)
  }
  var invitesContext = commons.getContext(options.contexts, 'invites')
  var invites = invitesContext.parameters.invites
  for (var i in invites){
    if (userData.name && userData.lastname && invites[i].emailAddress.name.toLowerCase().includes(userData.name.toLowerCase())
      && invites[i].emailAddress.name.toLowerCase().includes(userData.lastname.toLowerCase())){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited '
      invites.splice(i, 1)
      callback(options)
    }else if (userData.email && invites[i].emailAddress.address === userData.email){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited '
      invites.splice(i, 1)
      callback(options)
    }else if (userData.lastname && invites[i].emailAddress.name.toLowerCase().includes(userData.lastname.toLowerCase())){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited '
      invites.splice(i, 1)
      callback(options)
    }else if (userData.name && invites[i].emailAddress.name.toLowerCase().includes(userData.name.toLowerCase())){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited '
      invites.splice(i, 1)
      callback(options)
    }
  }
  options.message = options.speech = userData.email + 'Couldnt find ' + ((userData.name) ? userData.name: userData.email)
  callback(options)
}


exports.deleteInvite = deleteInvite
exports.showInvites = showInvites
exports.inviteUser = inviteUser
