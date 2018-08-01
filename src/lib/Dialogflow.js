'use strict';



const apiai = require('apiai');


/**
 * *************** Smartdata .inc ********************
 * ======================================================================
 * --------------- Dialogflow Messsanger library --------------------------
 * ======================================================================
 */


const EventEmitter = require('events').EventEmitter;


class Dialogflow extends EventEmitter {
    constructor(opts) {
        super();
        let _opts = {};
        opts = opts || {};
        if (!opts.access_token) {
            throw new Error('Missing access token');
        }
        if (opts.language) {
            _opts.language = opts.language;
        }
        if (opts.requestSource) {
            _opts.requestSource = opts.requestSource;
        }

        this.access_token = opts.access_token;
        this.apiAi = apiai(this.access_token, _opts);
    }

    sendTextMessage(text, _obj) {
        let apiaiRequest = this.apiAi.textRequest(text, _obj);
        this._receiveMessage(apiaiRequest);
    }

    sendEvent(event, _obj){
        let apiaiRequest = this.apiAi.textRequest(event, _obj);
        this._receiveMessage(apiaiRequest);
    }

    _isDefined(obj) {
        if (typeof obj == 'undefined') {
            return false;
        }

        if (!obj) {
            return false;
        }

        return obj != null;
    }

    _receiveMessage(apiaiRequest) {
        apiaiRequest.on('response', (response) => { 
            this._handleEvent('df_response', response);        
        });

        apiaiRequest.on('df_error', (error) => {
            console.log(error)
            this._handleEvent('error', error)
        });
        apiaiRequest.end();
    }

    _handleEvent(type, response) {
        this.emit(type, response);
    }
}

// Export module

module.exports = Dialogflow;