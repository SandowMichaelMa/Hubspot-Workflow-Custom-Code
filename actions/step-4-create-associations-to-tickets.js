/*****
  Description: Code to process the TICKETS and their associated 
  COMPANIES, CONTACTS and DEAL into a batch JSON and then post the data

  Input Requires:
  Secret Key: APP_KEY
  Property: newTickets
  Property: contacts
  Property: companies
  
  Output:
  (optional) ???
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
  
  /*****
    Data for the workflow is stored in the EVENT object. 
	
	Example data:
    {
      "origin": {
        // Your portal ID
        "portalId": 1,

        // Your custom action definition ID
        "actionDefinitionId": 2,
      },
      "object": {
        // The type of CRM object that is enrolled in the workflow
        "objectType": "DEAL",

        // The ID of the CRM object that is enrolled in the workflow
        "objectId": 4,
      },
      "inputFields": {
        // The property name for defined inputs
      },
      // A unique ID for this execution
      "callbackId": "ap-123-456-7-8"
    }
    
    You can access these values like so:
    event.origin.portalId which has a value = 1
    event.object.objectType which has a value = DEAL
    
    The inputFields are the defined elements in this module OR
    output elements from other nodes in the workflow.
    
    You can access these values like so:
    event.inputFields.INPUT_FIELD_NAME
  *****/
  
  //Retrieving the tickets, companies, contacts and deal data from the previous output node
  let newTickets = JSON.parse(event.inputFields.newTickets)
  let contacts = JSON.parse(event.inputFields.contacts)
  let companies = JSON.parse(event.inputFields.companies)
  
  //Assign variables for API
  let associationContacts = {inputs:[]}
  let associationCompanies = {inputs:[]}
  let associationDeal = {inputs:[]}
  
  //Loop through all the tickets
  newTickets.forEach (ticket => {
    //Setting DEALs to tickets
    let processingData = {}
    processingData["from"] = { id: ticket.id}
    processingData["to"] = { id: event.inputFields.hs_object_id}
    processingData["type"] = "ticket_to_deal"
    associationDeal.inputs.push(processingData)
    
    //Loop through contacts
    contacts.forEach (contact => {
      let processingData = {}
      processingData["from"] = { id: ticket.id}
      processingData["to"] = { id: contact.id}
      processingData["type"] = "ticket_to_contact"
      //console.log(processingData)
      associationContacts.inputs.push(processingData)
    })
    
    //Looping through companies
    companies.forEach (company => {
      let processingData = {}
      processingData["from"] = { id: ticket.id}
      processingData["to"] = { id: company.id}
      processingData["type"] = "ticket_to_company"
      //console.log(processingData)
      associationCompanies.inputs.push(processingData)
    })
  })
  //console.log(associationContacts)
  //console.log(associationCompanies)

  // Batch create the tickets associations with deal
  let newTicketsDeal = await createTicketAssociation(associationDeal, 'deal')
  console.log(newTicketsDeal)

  // Batch create the tickets associations with contacts
  let newTicketsCompanies = await createTicketAssociation(associationContacts, 'contacts')
  console.log(newTicketsCompanies)

  // Batch create the tickets associations with companies
  let newTicketsContacts = await createTicketAssociation(associationCompanies, 'companies')
  console.log(newTicketsContacts)
}

/*****
  API call to post all the ticket associations
  Requires: 
  data = associationCompanies or newTicketsContacts or deal data (JSON formatted batched data)
  type = companies, contacts or deals (the associaton you want to make)
   
  Output:  
  (optional) results
*****/
async function createTicketAssociation (data, type) {
  // API call
  try {
    const results = hubspotClient.crm.associations.batchApi.create('tickets', type, data)
    return results.body //nothing here?
  } catch (e) {
    console.log(e)
  }
}