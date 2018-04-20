var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');


function inviteUser(options, callback){
  var user = options.user;
  var invite = { "emailAddress": { "address":user.mail, "name": user.displayName }, "type": "required" }
  var originalContext = commons.getContext(options.contexts, 'invites');
  var invitesContext = { "name": "invites", "parameters":  { "invites" : (originalContext && originalContext.parameters.invites) ?
    originalContext.parameters.invites : [] }, "lifespan": 10 };

  invitesContext.parameters.invites.push(invite);
  options.message = options.speech = user.displayName + ' was invited \n\n';
  callback(options);
}

function showInvites(options, callback){
  var parameters = options.parameters;
  var invitesContext = commons.getContext(options.contexts, 'invites');
  var invites = invitesContext.parameters.invites;
  options.message = options.speech = `These are your current attendees \n\n`;
  options.message += '------------------------------------' + '\n\n';
  invites.forEach((invite) => {
    message += invite.emailAddress.name + " Email: " + invite.emailAddress.address + '\n\n';
  });
  callback(options);
}

function deleteInvite(options, callback){
  var parameters = options.parameters;
  var invitesContext = commons.getContext(options.contexts, 'invites');
  var userData = { name : parameters.name, lastname : parameters.parameters.lastname, email : parameters.parameters.email }
  var invites = invitesContext.parameters.invites;

  for (var i in invites){
    if (userData.name && userData.lastname && invites[i].emailAddress.name.includes(userData.name + ' ' + userData.lastname)){
      invites.splice(i, 1);
      options.message = options.speech = userData.name + userData.lastname + ' was uninvited ' + '\n\n';
      callback(options);
    }else if (userData.email && invites[i].emailAddress.address === userData.email){
      invites.splice(i, 1);
      options.message = options.speech = userData.email + ' was uninvited ' + '\n\n';
      callback(options);
    }
  }
  options.message = options.speech = userData.email + 'Couldnt find ' + ((userData.name) ? userData.name: userData.email);
  callback(options);
}


exports.deleteInvite = deleteInvite;
exports.showInvites = showInvites;
exports.inviteUser = inviteUser;
