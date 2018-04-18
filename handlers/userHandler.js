var axios = require('axios');

function searchUser(req, res, x){
  console.log('searchUser.req.pre.http : ' + req);
  console.log('searchUser.req.pre.http : ' + JSON.stringify(req));
  console.log('searchUser.res.pre.http : ' + res);
  console.log('searchUser.res.pre.http : ' + x);
  console.log('searchUser.req.pre.http : ' + JSON.stringify(req.body));
  var parameters = req.body.result.parameters;
  var userData = { name : parameters.name,
    lastname : parameters.lastname,
    email : parameters.email }

  var filter = ((userData.name) ? "startswith(displayName,'" + userData.name + "')" : '') +
      ((userData.lastname) ? ((filter) ? ' and ' : '') + "startswith(surname,'" + userData.lastname + "')" : '') +
      ((userData.email) ? ((filter) ? ' and ' : '') + "startswith(mail,'" + userData.email + "')" : '');
  console.log('searchUser.options.pre.httpCall : ' + JSON.stringify(this));
  axios.get('https://graph.microsoft.com/v1.0/users?$filter=' + filter, {
    headers : {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + this.options.access_token
    }
  })
  .then((response) => {
    console.log('searchUser.response : ' + JSON.stringify(response));
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
    console.log('searchUser.options : ' + JSON.stringify(this.options));
    next(req, res);
  })
  .catch((error) => {
    console.log('searchUser.error : ' + JSON.stringify(error));
    next(new Error());
  });

}

exports.searchUser = searchUser;
