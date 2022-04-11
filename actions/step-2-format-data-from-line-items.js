/*****
  Description: Code to take the LINE ITEM data and format it for batch processing.
  
  Input Requires:
  Property: lineItems
  Property: deal_owner_id 
  Property: dealname
  
  Output Requires:
  tickets (string)
*****/

exports.main = async (event, callback) => {

  /*****
    Setting the array for tickets
  *****/
  
  //Retrieving the lineItems data from the previous output node
  let lineItems = JSON.parse(event.inputFields.lineItems)
  
  //Creating the tickets object to be passed to next node
  let tickets = {inputs:[]}

  /*****
    Looping through the LINE ITEMS that were passed in from previous code and processing the data 
    into the object we want pass into the next code to create ticket. Each completed object 
    is a TICKET.
    
    All data logic here.
  *****/
  lineItems.forEach(lineItem => {
    /*****
      Potentially discriminatory of LINE ITEMS based on the criteria. Probably dupe of the main trigger.
	  
	  If you want to only process Line Items that have specific values, you can set the condition here.
    *****/
    //if (lineItem.properties.product_channel && lineItem.properties.product_channel !== null && lineItem.properties.product_channel == "Print") {
    if (lineItem) {
      /*****
        The QUANTITY loop. Creating additional tickets for each quantity.
      *****/
      let quantity = Number(lineItem.properties.quantity)
      for(let i = 1; i <= quantity; i++) {
        /***** TICKET DATA *****/
		let ticketData = {}
		
		// If you want to add text to the description of the ticket
        let contentData = ""
		
        /*****
          Processing the deal_owner__ticket_ property
        *****/
        ticketData["deal_owner__ticket_"] = event.inputFields.deal_owner_id

        /*****
          Processing the NAME property
          Checking for the NAME property in the LINE ITEM.
        *****/
        if (lineItem.properties.name && lineItem.properties.name !== null && lineItem.properties.name.length > 0) {
          if (quantity > 1) {
            ticketData["subject"] = event.inputFields.dealname + ': ' + lineItem.properties.name + " - Item " + i + '/' + quantity
          } else {
            ticketData["subject"] = event.inputFields.dealname + ': ' + lineItem.properties.name
          }
        }

        /*****
          Processing the hs_pipeline property
          Property not in line item so no need to check for it
          Data is in Settings -> Objects -> Tickets -> Pipelines -> Select a Pipeline

          0 = Print Deliverables
        *****/
        if (lineItem.properties.product_channel && lineItem.properties.product_channel !== null && lineItem.properties.product_channel.length > 0) {
          //Manually assign the PIPELINE based on the product_channel
          if ( lineItem.properties.product_channel == "Print" ) {
            ticketData["hs_pipeline"] = "0"
          }
        }

        /*****
          Processing the product_type__ticket_ property
          Checking for the product_type property in the LINE ITEM.
        *****/
        if (lineItem.properties.product_type && lineItem.properties.product_type !== null && lineItem.properties.product_type.length > 0) {
          ticketData["product_type__ticket_"] = lineItem.properties.product_type
        }

        /*****
          Processing the publication__ticket_ property
          Checking for the publication property in the LINE ITEM.
        *****/
        if (lineItem.properties.publication && lineItem.properties.publication !== null && lineItem.properties.publication.length > 0) {
          ticketData["publication__ticket_"] = lineItem.properties.publication
        }

        /*****
          Processing the hubspot_owner_id property
          Property not in line item so no need to check for it.

          MANUALLY SET.
        *****/
        ticketData["hubspot_owner_id"] = "1234567890"

        /*****
          Processing the hs_pipeline_stage property
          Property not in line item so no need to check for it.
          Data is in Settings -> Objects -> Tickets -> Pipelines -> Configure 

          1 = TBD <--- Default Status
        *****/
        ticketData["hs_pipeline_stage"] = "1"

        //Adding on CONTENT to the ticket
        //ticketData["content"] = "Testing this\nLine Break"
        ticketData["content"] = contentData

        // Pushing the object we created with all the data into the TICKETS object
        // which will create the TICKETS in the next module.
        tickets.inputs.push({"properties": ticketData})
      }
    }
  })
  
  // Returns tickets to the workflow. 
  // tickets is now a JSON formatted file that can be processed via batchAPI
  console.log(tickets)
  callback({
    outputFields: {
      tickets: tickets
    }
  })
}
