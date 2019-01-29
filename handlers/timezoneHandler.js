var timezones = require('./../constants/Timezones.js');
var axios = require('axios');



/**
 * This function checks if the user is register in the options.
 * If the username send was found and store, it will change the message to Ask for the next parameter(Date)
 * @param {JSON} options.user contains the user information obtained after the authentication.
 * @param {JSON} options.access_token contains the access token used to make request to microsoft graph
 * @param {JSON} options.userTimezone contains the current user timezone in a JSON {timezone, time}
 */
function getTimeZone(next, options, callback){
    console.log("Esta entrando")
    try {
        axios.get("https://graph.microsoft.com/v1.0/me/mailboxSettings/timeZone", {
        headers : {
            'Content-Type': 
            'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + options.access_token
        }
        })
        .then((response) => {
            console.log("Esta dentro")

        if (response.data.value.length != 0){
            for (i = 0; i < timezones.timezones.length; i++) {
            if(timezones.timezones[i].name == response.data.value){
                options.userTimezone= {timezone:timezones.timezones[i].name,time:parseInt(timezones.timezones[i].time)};
                break;
            }
            }
        }
        })
      }
      catch(err) {
        console.log(err);
      }

    
      next(options, callback);
  }



  exports.getTimeZone = getTimeZone;
