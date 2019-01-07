var request = require('../microsoftGraph/request.js');
var commons = require('../utils/commons.js');


function inviteUser(options, callback){
  var data = commons.getContext(options.contexts, 'createevent');
  console.log("data.parameters ="+JSON.stringify(data))
  console.log("data.parameters.invitationList ="+JSON.stringify(data.parameters.invitationList))

  if (options.message == ""){
    var user = options.user;
    var invite = { "emailAddress": { "address":user.mail, "name": user.displayName }, "type": "required" }
    if (!commons.getContext(options.contexts, 'invites')){
      options.contexts.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 60 });
    }
      

    options.contexts.forEach((context) => {
      console.log('inviteUser.context : ' + JSON.stringify(context, null, 2) );
      if (context.name === 'invites'){
        //console.log('inviteUser.Invite : Invite' );
        //console.log('inviteUser.Invite : ' + context.parameters.invites );
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
    //console.log("Couldn't uninvite " + user.displayName + ' \n\n');
    callback(options);
  }
  callback(options);
}

function showInvites(options, callback){
  console.log('showInvites.options : ' + JSON.stringify(options, null, 2) );
  var invitesContext = commons.getContext(options.contexts, 'invites');
  console.log("The contexts! here : "+ JSON.stringify(options.contexts));
  console.log(invitesContext +" print invites");
  if (!invitesContext){
    options.message = options.speech = `There are no invitations yet.`;
    callback(options);
  }
  var invites = invitesContext.parameters.invites;
  console.log("THE INVITES" + JSON.stringify(invites))
  options.message = options.speech = `These are your current attendees:\n`;
  invites.forEach((invite) => {
    options.message += invite.emailAddress.name + " Email: " + invite.emailAddress.address + '\n';
  });
  callback(options);
}

function deleteInvite(options, callback){
  var parameters = options.parameters;
  console.log('deleteInvite.options : ' + JSON.stringify(options, null, 2) );
  var userData = { name : parameters.name, lastname : parameters.lastname, email : parameters.email }
  if (!commons.getContext(options.contexts, 'invites')){
    console.log("No contexts found")
    options.contexts.push({ "name": "invites", "parameters":  { "invites" : [] }, "lifespan": 10 });
    options.message = options.speech = 'Couldnt find ' + ((userData.name) ? userData.name: userData.email);
    callback(options);
  }
  var invitesContext = commons.getContext(options.contexts, 'invites');
  var invites = invitesContext.parameters.invites;
  console.log("THE FULL INVITES : "+ JSON.stringify(invites));
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

  console.log("Remove.user.invitation: not found user in " + JSON.stringify(invites))
  options.message = options.speech = userData.email + 'Couldnt find ' + ((userData.name) ? userData.name: userData.email);
  callback(options);
}


exports.deleteInvite = deleteInvite;
exports.showInvites = showInvites;
exports.inviteUser = inviteUser;
