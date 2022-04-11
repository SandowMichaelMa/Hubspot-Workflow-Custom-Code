/*****
  Description: Code to batch create all the TICKETS.

  Input Requires:
  Secret Key: APP_KEY
  Property: tickets
  
  Output Requires:
  newTickets (string)
*****/

/*****
  Setting global variables used in all functions
*****/
const hubspot = require('@hubspot/api-client');

/*****
  API key is stored in a SECRET. They can be accessed as an enviroment variable once selected
  eg, process.env.SECRET_KEY_NAME

  For hapikey use (aka, main API Key for the hubspot account):
  apiKey: process.env.HAPIKEY

  For Access tokens use (aka, Private App Key or OAUTH)
  accessToken: process.env.APP_KEY
*****/
const hubspotClient = new hubspot.Client({
  //apiKey: process.env.HAPIKEY
  accessToken: process.env.APP_KEY
});

/*****
  Main Loop
*****/
exports.main = async (event, callback) => {

  //Retrieving the tickets data from the previous output node
  let tickets = JSON.parse(event.inputFields.tickets)
  
  // Batch create the tickets
  let newTickets = await createTicketsBatch(tickets)
  
  // Returns newTickets to the workflow
  callback({
    outputFields: {
      newTickets: newTickets
    }
  })
}

/*****
  API call to post all the ticket data to batch create
  Requires: 
  data = tickets (JSON formated batched ticket data)
  
  Output:  
  newTickets (IDs of tickets just created)
*****/
async function createTicketsBatch (data) {
  // API call
  try {
    const results = await hubspotClient.crm.tickets.batchApi.create(data)
    return results.body.results
  } catch (e) {
    console.log(e)
  }
}
