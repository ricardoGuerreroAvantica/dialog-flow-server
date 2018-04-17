var axios = require('axios');

function searchUser(req, res){
  var parameters = req.body.result.parameters;
  var userData = { name : parameters.name,
    lastname : parameters.lastname,
    email : parameters.email }

  var filter = ((userData.name) ? "startswith(displayName,'" + userData.name + "')" : '') +
      ((userData.lastname) ? ((filter) ? ' and ' : '') + "startswith(surname,'" + userData.lastname + "')" : '') +
      ((userData.email) ? ((filter) ? ' and ' : '') + "startswith(mail,'" + userData.email + "')" : '');

  axios.get('https://graph.microsoft.com/v1.0/users?$filter=' + filter, {
    headers : {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + this.options.access_token
    }
  })
  .then((response) => {
    if (response.data.value.length > 1){
      next(new Error());
    }
    if (response.data.value.length === 0){
      next(new Error());
    }
    this.options.user = {
      displayName : response.data.value[0].displayName,
      givenName : response.data.value[0].givenName,
      mail : response.data.value[0].mail,
      surname : response.data.value[0].surname,
    }
    next(req, res);
  })
  .catch((error) => {
    next(new Error());
  });

}
