var timezones = require("./../constants/Timezones.js")
var textResponses =require("./../constants/TextResponses")
var axios = require("axios")



/**
 * This function checks if the user is register in the options.
 * If the username send was found and store, it will change the message to Ask for the next parameter(Date)
 * @param {JSON} token contains the access token used to make request to microsoft graph
 */
async function setTimeZone(token){
      var selectedTimeZone
      let timezonePromise = new Promise((resolve, reject) => {
            try {
                axios.get(textResponses.graphRequests.timezone, {
                headers : {
                    "Content-Type": 
                    "application/json",
                    Accept: "application/json",
                    Authorization: "Bearer " + token
                }
                })
                .then((response) => {
                if (response.data.value.length != 0){
                    selectedTimeZone = timezones.timezones.find(function(element) {
                        return element.name == response.data.value
                      })
                    resolve(selectedTimeZone)
                }
                })
                }
                catch(err) {
                console.log(err)
                reject(JSON.stringify(err))
                }
            })
    let result = await timezonePromise
    console.log("setTimeZone: "+result)
    return result
  }

  exports.setTimeZone = setTimeZone

