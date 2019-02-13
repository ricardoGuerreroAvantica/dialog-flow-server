//this constant contains all the text responses for the information guide procedures in "Helper" case.
const helperResponses = {
    helperBasic : "Can you tell me how I can help you?\n▶ How to create an event?\n▶ How to check if someone is available?\n▶ How to check my events?\n▶ How can I invite someone?\n▶ How can I see my event information?\n▶ How can I change my event information?",
    helperEvent : "Here are some examples of how can you create a event:\n▶ Create new event example today at 3:00pm for 40 minutes.\n▶ Create a new event.\n▶ Create new event testing on 4 sep at 14:00.\n____________________\nTo complete the creation only say \"Done\"",
    helperAvailable : "To check someone availability you can use their first name or their email:\n▶ Is Ricardo Guerrero Available today at now?\n▶ Is Ricardo guerrero Available\n▶ Is ricardo.guerero@avantica.net is available in 20 oct at 7am",
    helperInvite : "To invite or Uninvite someone to the event you can just write this:\n▶ Add Ricardo Guerrero\n▶ remove Ricardo Guerrero\n▶ Invite ricardo.guerrero@avantica.net\n▶ Uninvite ricardo.guerrero@avantica.net",
    helperMyEvents : "You can see your events from a date or a period using this:\n▶ My events\n▶ Show me my events\n▶ Show me my events from monday to friday\n▶ Show any events called wellness program",
    helperEventInfo : "After you start the event creation you can see your event information using this:\n▶ Show my event body\n▶ Show Information\n▶ How does my event look?\n▶ My event information",
    helperUpdateEvent : "After you start the event creation, you can change your event information using this:\n▶ Change the name to [new name]\n▶ Change the date to [new date]\n▶ Change the time to [new time]\n▶ Change the duration to [new duration]"
}

const preSearchUserResponses ={
    initialMessage :"There is more than one employee with this description, maybe you are searching for:\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\n",
    failureMessage : "Sorry I couldn't find any user with this description: "
}

const graphRequests ={
    users : 'https://graph.microsoft.com/v1.0/users?$filter='
}

exports.helperResponses = helperResponses
exports.graphRequests = graphRequests
exports.preSearchUserResponses = preSearchUserResponses