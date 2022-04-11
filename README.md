# Example workflow of creating TICKETS for each LINE ITEM in a DEAL

This is an example of a Hubspot Workflow Custom Coded Actions that takes in a DEAL (trigger) and converts the LINE ITEMS in the DEAL  to TICKETS.

We mostly use an AWAIT ASYNC to retrieve and process data.

## API Key and data in the Workflow
In order to run API requests, you need to add the API key as a SECRET to the WORKFLOW. For my purposes, I created a Private App to prevent workflows from breaking due to an key rotation.

They can be accessed as an enviroment variable once selected
eg, process.env.SECRET_KEY_NAME

For hapikey use (aka, main API Key for the hubspot account):
apiKey: process.env.HAPIKEY

For Access tokens use (aka, Private App Key or OAUTH)
accessToken: process.env.APP_KEY

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

The inputFields are the defined elements in this module OR output elements from other nodes in the workflow.

You can access these values like so:
event.inputFields.INPUT_FIELD_NAME

## Process
The actions are broken into four steps with each step performing a specific task. The reason to break it apart is to ensure we never run into the 20 second execution time or the memory limit of an action.

### Step 1
This step retrieves all the LINE ITEMS, CONTACTS and COMPANIES from the DEAL and stores them into variables (outputFields) that will be accessable to the rest of the workflow.

### Step 2
This step takes the LINE ITEM data variable created in Step 1 and then processes them into the JSON format for batch creating ticket. The majority of any logic is done here. You can skip LINE ITEMS that you don't want to be processed by this workflow or add conditions to assign it to specific things (eg, if X data exists, assign it to PIPELINE Y).

### Step 3
This step takes the batched formatted data in Step 2 and posts it to Hubspot. This creates all the tickets and assigns the basic data set we defined. This outputs the new TICKET ids.

### Step 4
ASSOCIATIONS have to be created after the tickets are created. We assign the CONTACTS, COMPANIES and DEAL so that the data is readily available in the ticket. 
