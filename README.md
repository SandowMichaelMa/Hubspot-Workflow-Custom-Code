# Example workflow of creating TICKETS for each LINE ITEM in a DEAL

This is an example of a Hubspot Workflow Custom Coded Actions that takes in a DEAL (trigger) and converts the LINE ITEMS in the DEAL  to TICKETS.

We mostly use an AWAIT ASYNC to retrieve and process data.

## API Key and data in the Workflow
In order to run API requests, you need to add the API key as a SECRET to the WORKFLOW. For my purposes, I created a Private App (Settings -> Account Setup -> Private Apps) to prevent workflows from breaking due to a key rotation. I can, likewise, track the amount of requests the WORKFLOW executes separately from the default key requests.

They can be accessed as an enviroment variable once selected
eg, process.env.SECRET_KEY_NAME

For hapikey use (aka, main API Key for the hubspot account):
apiKey: process.env.HAPIKEY

For Access tokens use (aka, Private App Key access token or OAUTH)
accessToken: process.env.APP_KEY

You can use whatever name you want for your secret key. hapikey is often used in the documentation and is generally referring to the main Hubspot API key. As such, to ensure I don't confuse what key is being used, I will chose a different name for a Private App key. You may need to play around with the scopes of your app key to get exactly the permissions you want. You can check the console log in the step for scope rejection. There are some legacy scopes still in there which may sometimes need to be used to access certain data.

Data for the workflow is stored in the EVENT object. 

Example data:
```json
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
```

You can access these values like so:

event.origin.portalId which has a value = 1

event.object.objectType which has a value = DEAL

The inputFields are the defined elements in this module OR output elements from other nodes in the workflow.

You can access these values like so:

event.inputFields.INPUT_FIELD_NAME

## Process
The actions are broken into four steps with each step performing a specific task. The reason to break it apart is to ensure we never run into the 20 second execution time or the memory limit of an action.

![alt Workflow image](https://github.com/SandowMichaelMa/Hubspot-Workflow-Custom-Code/blob/df2412a0cb6698db1557f9576c749171ad556844/workflow-screenshot.png?raw=true)


### Trigger
The workflow trigger is: 

PIPELINE is any of X
AND
At least one associated LINE ITEM has
Product Channel is any of Print

### Step 1 - [step-1-get-line-items.js](actions/step-1-get-line-items.js)
This step retrieves all the LINE ITEMS, CONTACTS and COMPANIES from the DEAL and stores them into variables (outputFields) that will be accessable to the rest of the workflow.

### Step 2 - [step-2-format-data-from-line-items.js](actions/step-2-format-data-from-line-items.js)
This step takes the LINE ITEM data variable created in Step 1 and then processes them into the JSON format for batch creating ticket. The majority of any logic is done here. You can skip LINE ITEMS that you don't want to be processed by this workflow or add conditions to assign it to specific things (eg, if X data exists, assign it to PIPELINE Y).

### Step 3 - [step-3-create-tickets.js](actions/step-3-create-tickets.js)
This step takes the batched formatted data in Step 2 and posts it to Hubspot. This creates all the tickets and assigns the basic data set we defined. This outputs the new TICKET ids.

### Step 4 - [step-4-create-associations-to-tickets.js](actions/step-4-create-associations-to-tickets.js)
ASSOCIATIONS have to be created after the tickets are created. We assign the CONTACTS, COMPANIES and DEAL so that the data is readily available in the ticket. 

## Questions
If you have any questions or comments, please feel free to let me know!
