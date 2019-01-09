var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');

//This function is in charge of adding a user to the invites inside the dialogflow contexts.
function inviteUser(options, callback){
  if (options.message == ""){
    var user = options.user;
    var invite = { "emailAddress": { "address":user.mail, "name": user.displayName }, "type": "required" }
    if (!commons.getContext(options.contexts, 'invites')){
      options.contexts.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 60 });
    }
    options.contexts.forEach((context) => {
      if (context.name === 'invites'){
        options.message = options.speech = 'Current invitation list:\n';
        context.parameters.invites.forEach((invite) => {

          let userEntry = new String(user.mail);
          let userStored = new String(invite.emailAddress.address);
          options.message = options.speech += invite.emailAddress.name+", email: "+invite.emailAddress.address+'\n'
          var isEquel = JSON.stringify(userEntry) === JSON.stringify(userStored);
          if (isEquel){
            options.message = options.speech = user.displayName + ' is already invited';
            callback(options);
          }
        })
        options.message = options.speech += user.displayName +", email: "+ user.mail;
        context.parameters.invites.push(invite);

        callback(options);
      }
    });
    options.message = options.speech = " Couldn't uninvite " + user.displayName;
    callback(options);
  }
  callback(options);
}

//this function is in charge of showing to the user all the current invites stored in dialogflow contexts.
function showInvites(options, callback){
  var invitesContext = commons.getContext(options.contexts, 'invites');
  if (!invitesContext){
    options.message = options.speech = `There are no invitations yet.`;
    callback(options);
  }
  var invites = invitesContext.parameters.invites;
  options.message = options.speech = `These are your current attendees:\n`;
  invites.forEach((invite) => {
    options.message += invite.emailAddress.name + " Email: " + invite.emailAddress.address + '\n';
  });
  callback(options);
}

//This function will delete a invite from the dialogflow temporal contexts
function deleteInvite(options, callback){
  var parameters = options.parameters;
  var userData = { name : parameters.name, lastname : parameters.lastname, email : parameters.email }
  if (!commons.getContext(options.contexts, 'invites')){
    options.contexts.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 10 });
    options.message = options.speech = 'Couldnt find ' + ((userData.name) ? userData.name: userData.email);
    callback(options);
  }
  var invitesContext = commons.getContext(options.contexts, 'invites');
  var invites = invitesContext.parameters.invites;
  for (var i in invites){
    if (userData.name && userData.lastname && invites[i].emailAddress.name.toLowerCase().includes(userData.name.toLowerCase())
      && invites[i].emailAddress.name.toLowerCase().includes(userData.lastname.toLowerCase())){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited ';
      invites.splice(i, 1);
      callback(options);
    }else if (userData.email && invites[i].emailAddress.address === userData.email){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited ';
      invites.splice(i, 1);
      callback(options);
    }else if (userData.lastname && invites[i].emailAddress.name.toLowerCase().includes(userData.lastname.toLowerCase())){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited ';
      invites.splice(i, 1);
      callback(options);
    }else if (userData.name && invites[i].emailAddress.name.toLowerCase().includes(userData.name.toLowerCase())){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited ';
      invites.splice(i, 1);
      callback(options);
    }
  }
  options.message = options.speech = userData.email + 'Couldnt find ' + ((userData.name) ? userData.name: userData.email);
  callback(options);
}


exports.deleteInvite = deleteInvite;
exports.showInvites = showInvites;
exports.inviteUser = inviteUser;
