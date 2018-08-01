
// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');


const EventEmitter = require('events').EventEmitter;

class DialogflowV2 extends EventEmitter {

    constructor(opts) {
        super(opts)
        let _opts = {}
        opts = opts || {}

        this.sessionClient = new dialogflow.SessionsClient();
        // Define session path
        this.sessionPath = sessionClient.sessionPath(projectID, opts.sessionID);

    }

    sendText(_obj) {

        // The text query request.
        const request = {
            session: this.sessionPath,
            queryInput: {
                text: {
                    text: _obj.query,
                    languageCode: _obj.languageCode,
                },
            },
        };
        return request;
    }
    sendEvent(_event,_params) {

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                event: {
                    name: _event.name,
                    parameters: _params,
                    languageCode: _event.languageCode,
                },
            },
        };

        return request;
    }

    _handleEvent(type, response) {
        this.emit(type, response);
    }
}

// Send request and log result
// sessionClient
//     .detectIntent(request)
//     .then(responses => {
//         console.log('Detected intent');
//         const result = responses[0].queryResult;
//         console.log(`  Query: ${result.queryText}`);
//         console.log(`  Response: ${result.fulfillmentText}`);
//         if (result.intent) {
//             console.log(`  Intent: ${result.intent.displayName}`);
//         } else {
//             console.log(`  No intent matched.`);
//         }
//     })
//     .catch(err => {
//         console.error('ERROR:', err);
//     });




// Export module

module.exports = DialogflowV2;