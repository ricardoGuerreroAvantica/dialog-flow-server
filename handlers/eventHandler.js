var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');


function inviteUser(options, callback){
  if (options.message == ""){
    console.log("USER INVITED + " + options.user)
    var user = options.user;
    var invite = { "emailAddress": { "address":user.mail, "name": user.displayName }, "type": "required" }
    if (!commons.getContext(options.contexts, 'invites'))
      options.contexts.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 10 });

    options.contexts.forEach((context) => {
      console.log('inviteUser.context : ' + JSON.stringify(context, null, 2) );
      if (context.name === 'invites'){
        //console.log('inviteUser.Invite : Invite' );
        //console.log('inviteUser.Invite : ' + context.parameters.invites );
        context.parameters.invites.forEach((invite) => {
          if (user.email === invite.emailAddress.address){
            options.message = options.speech = user.displayName + ' is already invited \n\n';
            //console.log(user.displayName + ' is already invited \n\n');
            callback(options);
          }
        })

        options.message = options.speech = user.displayName + ' was invited \n\n';
        context.parameters.invites.push(invite);
        //console.log('inviteUser.invite : ' + user.displayName + ' was invited \n\n');
        callback(options);
      }
    });
    options.message = options.speech = " Couldn't uninvite " + user.displayName + ' \n\n';
    //console.log("Couldn't uninvite " + user.displayName + ' \n\n');
    callback(options);
  }
  callback(options);
}

function showInvites(options, callback){
  var parameters = options.parameters;
  //console.log('showInvites.options : ' + JSON.stringify(options, null, 2) );
  var invitesContext = commons.getContext(options.contexts, 'invites');
  if (!invitesContext){
    options.message = options.speech = `There are no invitations yet \n\n`;
    callback(options);
  }
  var invites = invitesContext.parameters.invites;
  options.message = options.speech = `These are your current attendees \n\n`;
  options.message += '-----------------------' + '\n\n';
  invites.forEach((invite) => {
    options.message += invite.emailAddress.name + " Email: " + invite.emailAddress.address + '\n\n';
  });
  callback(options);
}

function deleteInvite(options, callback){
  var parameters = options.parameters;
  //console.log('deleteInvite.options : ' + JSON.stringify(options, null, 2) );
  var userData = { name : parameters.name, lastname : parameters.lastname, email : parameters.email }
  if (!commons.getContext(options.contexts, 'invites')){
    options.contexts.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 10 });
    options.message = options.speech = 'Couldnt find ' + ((userData.name) ? userData.name: userData.email);
    callback(options);
  }
  var invitesContext = commons.getContext(options.contexts, 'invites');
  var invites = invitesContext.parameters.invites;

  for (var i in invites){
    if (userData.name && userData.lastname && invites[i].emailAddress.name.includes(userData.name)
      && invites[i].emailAddress.name.includes(userData.lastname)){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited ' + '\n\n';
      invites.splice(i, 1);
      callback(options);
    }else if (userData.email && invites[i].emailAddress.address === userData.email){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited ' + '\n\n';
      invites.splice(i, 1);
      callback(options);
    }else if (userData.lastname && invites[i].emailAddress.name.includes(userData.lastname)){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited ' + '\n\n';
      invites.splice(i, 1);
      callback(options);
    }else if (userData.name && invites[i].emailAddress.name.includes(userData.name)){
      options.message = options.speech = invites[i].emailAddress.name + ' was uninvited ' + '\n\n';
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
