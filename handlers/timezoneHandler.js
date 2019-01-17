var timezones = require('./../constants/Timezones.js');
var axios = require('axios');

function getTimeZone(next, options, callback){
    axios.get("https://graph.microsoft.com/v1.0/me/mailboxSettings/timeZone", {
      headers : {
        'Content-Type': 
        'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + options.access_token
      }
    })
    .then((response) => {
    
      if (response.data.value.length != 0){
        for (i = 0; i < timezones.timezones.length; i++) {
          if(timezones.timezones[i].name == response.data.value){
            console.log("Selected : "+timezones.timezones[i].name+" "+timezones.timezones[i].time)
            console.log(JSON.stringify({timezone:timezones.timezones[i].name,time:parseInt(timezones.timezones[i].time)}))
            options.userTimezone= {timezone:timezones.timezones[i].name,time:parseInt(timezones.timezones[i].time)};
            next(options, callback);
          }
        }
      }
      })
      next(options, callback);
  }



  exports.getTimeZone = getTimeZone;
