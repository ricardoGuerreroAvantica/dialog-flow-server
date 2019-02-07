var timezones = require('./../constants/Timezones.js');
var axios = require('axios');



/**
 * This function checks if the user is register in the options.
 * If the username send was found and store, it will change the message to Ask for the next parameter(Date)
 * @param {JSON} token contains the access token used to make request to microsoft graph
 */
async function setTimeZone(token){
      var selectedTimeZone;
      let timezonePromise = new Promise((resolve, reject) => {
            try {
                axios.get("https://graph.microsoft.com/v1.0/me/mailboxSettings/timeZone", {
                headers : {
                    'Content-Type': 
                    'application/json',
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + token
                }
                })
                .then((response) => {
                if (response.data.value.length != 0){
                    for (i = 0; i < timezones.timezones.length; i++) {
                        if(timezones.timezones[i].name == response.data.value){//cambiar por find
                            selectedTimeZone = {timezone:timezones.timezones[i].name,time:parseFloat(timezones.timezones[i].time)};
                            resolve(selectedTimeZone);
                            break;
                        }
                    }
                }
                })
                }
                catch(err) {
                reject(JSON.stringify(err))
                console.log(err);
                }
            });
    let result = await timezonePromise;

    return result;
  }

  exports.getTimeZone = getTimeZone;
  exports.setTimeZone = setTimeZone;

