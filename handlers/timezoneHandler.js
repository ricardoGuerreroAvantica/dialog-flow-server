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
    if (!commons.getContext(options.contexts, 'invites')){
        console.log("Start#1")

        let data = new Promise((resolve, reject) => {
            var selectedTimeZone;
            try {
                console.log("Start#2")

                axios.get("https://graph.microsoft.com/v1.0/me/mailboxSettings/timeZone", {
                headers : {
                    'Content-Type': 
                    'application/json',
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + token
                }
                })
                .then((response) => {
                    console.log("Start#3")

                if (response.data.value.length != 0){
                    for (i = 0; i < timezones.timezones.length; i++) {
                        console.log("Start#4:" + JSON.stringify(timezones.timezones[i]))

                        if(timezones.timezones[i].name == response.data.value){//cambiar por find
                            selectedTimeZone = {timezone:timezones.timezones[i].name,time:parseInt(timezones.timezones[i].time)};
                            return selectedTimeZone;
                        }
                    }
                }
                })
              }
              catch(err) {
                console.log(err);
              }
          });
          resolve(selectedTimeZone)
    }
    await data;
  }

  exports.getTimeZone = getTimeZone;
  exports.setTimeZone = setTimeZone;

