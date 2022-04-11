/*****
  Description: Code to get all LINE ITEMS, COMPANIES and CONTACTS associated with the DEAL.

  Input Requires:
  Secret Key: APP_KEY
  
  Output Requires:
  lineItems (string)
  companies (string)
  contacts (string)
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
  
  // Retrieve the LINE ITEM ids from the DEAL
  let lineItemsID = await getLineItemsFromDeal(event)
  
  // Retrieving the data of each of the LINE ITEM
  let lineItemsData = await Promise.all(lineItemsID.map(item =>  getLineItemsData(event, item)));

  // Retrieve the COMPANIES from the DEAL
  let companiesID = await getCompaniesFromDeal(event)

  // Retrieve the CONTACTS from the DEAL
  let contactsID = await getContactsFromDeal(event)

  // Returns lineItems, companies and contacts to the workflow to be used in other actions
  callback({
    outputFields: {
      lineItems: lineItemsData,
      companies: companiesID,
      contacts: contactsID
    }
  })
}

/*****
  API call to get all LINE ITEMS associated with the DEAL.
  
  Requires: 
  event = event.object.objectId (DEAL ID)
  
  Output:  
  lineItemsData
*****/
async function getLineItemsFromDeal (event) {
  // API call
  try {
    const results = await hubspotClient.crm.deals.associationsApi.getAll(event.object.objectId, 'line_item')
    return results.body.results
  } catch (e) {
    console.log(e)
  }
}

/*****
  Function to execute the API call to get data from the LINE ITEM.
  These properties (besides the defaults) are ones you created in Hubspot for PRODUCTS
  API Request to get properties: https://api.hubapi.com/crm/v3/properties/line_items?archived=false

  Requires: 
  event = event.object.objectId (DEAL ID)
  data = lineItemsID
  
  Output:  
  lineItemsData
*****/
async function getLineItemsData (event, data) {  
  // API Call
  try {
    const results = await hubspotClient.crm.lineItems.basicApi.getById(data.id, 
      [
        'name', //Name of Line Item.
        'product_type', //Custom Property
        'publication', //Custom Property
        'quantity' //Custom Property
      ])
    return results.body
  } catch (e) {
    console.log(e)
  }
}

/*****
  Function to execute the API call to get CONTACT ids from the DEAL
  Requires: 
  event = event.object.objectId (DEAL ID)
  
  Output:  
  contactsID
*****/
async function getContactsFromDeal (event) {  
  // API Call
  try {
    const results = await hubspotClient.crm.deals.associationsApi.getAll(event.object.objectId, 'contacts')
    return results.body.results
  } catch (e) {
    console.log(e)
  }
}

/*****
  Function to execute the API call to get all COMPANY ids associated with the DEAL
  Requires: 
  event = event.object.objectId (DEAL ID)
  
  Output:  
  companiesID
*****/
async function getCompaniesFromDeal (event) {  
  // API call
  try {
    const results = await hubspotClient.crm.deals.associationsApi.getAll(event.object.objectId, 'companies')
    return results.body.results
  } catch (e) {
    console.log(e)
  }
}