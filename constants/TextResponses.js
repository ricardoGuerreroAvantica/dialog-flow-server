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
//contains all the text constants used in preSearchUser Function
const preSearchUserResponses ={
    initialMessage :"There is more than one employee with this description, maybe you are searching for:\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\n",
    failureMessage : "Sorry I couldn't find any user with this description: ",
    successMessage : "What is the date?"
}

const inviteUserResponses= {
    initialMessage : "Current invitation list:\n",
    errorMessage : "Error no invite in the contexts"
}

const showInvitesResponses = {
    initialMessage :"These are your current attendees:\n",
    noInvitesMessage : "There are no invitations yet."
}

//contains the constants for the microsoft graph requests
const graphRequests = {
    graph : "graph.microsoft.com",
    events : "/v1.0/me/events",
    fullEvents : "https://graph.microsoft.com/v1.0/me/events?",
    users : "https://graph.microsoft.com/v1.0/users?$filter=",
    timezone : "https://graph.microsoft.com/v1.0/me/mailboxSettings/timeZone",
    calendarView : "https://graph.microsoft.com/v1.0/me/calendarview?",
    me : "https://graph.microsoft.com/v1.0/me",
    meetingTimes : "/beta/me/findMeetingTimes",
}

const preFindMeetingTimesResponses = {
    initialMessage : "I found some space at: \n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\nFrom:\n",
    errorAccessA : "Couldn't access to ",
    errorAccessB : " schedule, the calendar of this employee may be restricted at this time.",
    noAvailableMessage : "Didn't find any available slot in the calendar of "
}


const showEvents= {
    initialMessage : "Found these events:\n",
    emptyAgenda : "There is nothing on your agenda"
}

const scheduleMeetingResponses ={
    eventCreatedMessage : "These event was created successfully: \n",
    initialMessage : "These are your current attendees:\n",
    invites : "\nInvites: \n",
    
}
const showEventDetailsResponses ={
    initialMessage : "¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\nRemember You can:\n▶ Change the name, date, time or duration of the event.\n▶ Make some invites.\n\nIf you want to finish the creation, say \"Done\" or ask me for \"Help\" for more information.",
    invitesMessage : "\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\nYour invites:\n",
    noInvitesMessage : "There are no invitations yet.",
}
exports.showEvents = showEvents
exports.preFindMeetingTimesResponses = preFindMeetingTimesResponses
exports.helperResponses = helperResponses
exports.scheduleMeetingResponses = scheduleMeetingResponses
exports.showEventDetailsResponses = showEventDetailsResponses
exports.showInvitesResponses = showInvitesResponses
exports.inviteUserResponses = inviteUserResponses
exports.graphRequests = graphRequests
exports.preSearchUserResponses = preSearchUserResponses