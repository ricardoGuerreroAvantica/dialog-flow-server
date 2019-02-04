var timezones = require('./../constants/Timezones.js');
var commons = require('../utils/commons.js');
var axios = require('axios');



/**
 * This function checks if the user is register in the options.
 * If the username send was found and store, it will change the message to Ask for the next parameter(Date)
 * @param {JSON} options.user contains the user information obtained after the authentication.
 * @param {JSON} options.access_token contains the access token used to make request to microsoft graph
 * @param {JSON} options.userTimezone contains the current user timezone in a JSON {timezone, time}
 */
function getTimeZone(next, options, callback){
    console.log("getTimeZone start")
    if (!commons.getContext(options.contexts, 'invites')){
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
            if (response.data.value.length != 0){
                for (i = 0; i < timezones.timezones.length; i++) {
                    if(timezones.timezones[i].name == response.data.value){
                        var selectedTimeZone = {timezone:timezones.timezones[i].name,time:parseInt(timezones.timezones[i].time)};
                        options.contexts.push({ "name": "timezone", "parameters":  { "timezone" : selectedTimeZone }, "lifespan": 60 });
                        options.userTimezone= selectedTimeZone;
                        console.log("getTimeZone end: "+ JSON.stringify(options.contexts))

                        break;
                    }
                }
            }
            })
          }
          catch(err) {
            console.log(err);
          }
    }
    next(options, callback);
  }



  async function setTimeZone(token){
      console.log("Start")
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
                    console.log('the timezone:' + JSON.stringify(response.data))
                    for (i = 0; i < timezones.timezones.length; i++) {
                        console.log(`timezones.timezones[${i}]:` + JSON.stringify(timezones.timezones[i]))
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
                console.log(err);
                }
            });
    let result = await timezonePromise;
    console.log("-------------------")
    console.log(selectedTimeZone)
    console.log(result)
    console.log("-------------------")
    return result;
  }

  exports.getTimeZone = getTimeZone;
  exports.setTimeZone = setTimeZone;

