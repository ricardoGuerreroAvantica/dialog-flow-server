var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');


function inviteUser(options, callback){
  var user = options.user;
  var invite = { "emailAddress": { "address":user.mail, "name": user.displayName }, "type": "required" }
  if (!commons.getContext(options.contexts, 'invites'))
    options.context.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 10 });

  options.contexts.forEach((context) => {
    if (context.name === 'invites')
      context.parameters.invites.push(invite);
  });

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
  var userData = { name : parameters.name, lastname : parameters.lastname, email : parameters.email }
  if (!commons.getContext(options.contexts, 'invites')){
    options.context.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 10 });
    options.message = options.speech = 'Couldnt find ' + ((userData.name) ? userData.name: userData.email);
    callback(options);
  }
  var invitesContext = commons.getContext(options.contexts, 'invites');
  var invites = invitesContext.parameters.invites;

  invites.forEach((invite) => {
    if (invite.emailAddress.name.includes(userData.name + ' ' + userData.lastname)){
      invites.splice(i, 1);
      options.message = options.speech = userData.email + ' was uninvited ' + '\n\n';
      callback(options);
    }else if (invite.emailAddress.address === userData.email){
      invites.splice(i, 1);
      options.message = options.speech = userData.email + ' was uninvited ' + '\n\n';
      callback(options);
    }
  })

  options.message = options.speech = userData.email + 'Couldnt find ' + ((userData.name) ? userData.name: userData.email);
  callback(options);
}


exports.deleteInvite = deleteInvite;
exports.showInvites = showInvites;
exports.inviteUser = inviteUser;
