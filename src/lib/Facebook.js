
'use strict'

/**
 * *************** Smartdata .inc ********************
 * ======================================================================
 * --------------- Facebook Messsanger library --------------------------
 * ======================================================================
 */


// Import npm modules
const url = require('url');
const qs = require('querystring');
const config = require('config');
const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');
const request = require('request-promise');
const Utils = require('util');
const JSONbig = require('json-bigint');

const _fb = config.get('facebook');



class Facebook extends EventEmitter {
    constructor(opts){
        super();

        opts  = opts || {};
        if(!opts.token){
            throw new Error('Missing page token.Please get token from your facebook page')
        }

        this.token = opts.token;
        this.app_secret = opts.app_secret || false;
        this.verify_token = opts.verify || false;
        this.debug = opts.debug || false;
    }

    /**
     * profile of user on faceboapiEventok
     * @param {id} user id 
     * @callback cb callback on response from fb
     * find here a link @{https://developers.facebook.com/docs/messenger-platform/identity/user-profile}
     */

     userProfile(id,cb){
         return request({
             method: 'GET',
             uri: `${_fb.baseURL}/${id}`,
             qs: this._getQs({fields: 'first_name,last_name,profile_pic,locale,timezone,gender'}),
             json: true
         })
         .then(body => {
             if(body.error) return Promise.reject(body.error);
             if(!cb) return body;
             cb(null, body);
         })
         .catch(err => {
             if(!cb) return Promise.reject(err);
             cb(err);
         });
     }
          

     /**
      * @param {recipient} - recipient id 
      * @param {payload} - message to be send to user
      * @callback cb - The callback that handles the response
      * Send message api for messanger
      * for more detail please visit here @{https://developers.facebook.com/docs/messenger-platform/reference/send-api/}
      */

     sendMessage(recipient, payload, cb){
         return request({
             method: 'POST',
             uri: `${_fb.baseURL}/me/messages`,
             qs: this._getQs(),
             json:{
                 recipient: {id: recipient},
                 message: payload
             }
         })
         .then(body => {
             if(body.error) return Promise.reject(body.error);
             if(!cb) return body;
             cb(null, body);
         })
         .catch(err => {
             if(!cb) return Promise.reject(err);
             cb(err);
         });
     }

     /**
      * Sender action Message property allows you to control indicator
      * for typing and read receipts in the conversation
      * @param {recipient} - id of the recipient
      * @param {senderAction} - value if sender action 
      * @callback cb - The callback that handles the response
      * for more information please visit here @{https://developers.facebook.com/docs/messenger-platform/send-messages/sender-actions}
      */

      sendSenderAction(recipient, senderAction, cb ){
          return request({
              method:'POST',
              uri: `${_fb.baseURL}/me/message`,
              qs: this._getQs(),
              json: {
                  recipient:{
                      id: recipient
                  },
                  sender_action: senderAction
              }
          })
          .then(body => {
              if(body.error) return Promise.reject(body.error);
              if(!cb) return body;
              cb(null, body);
          })
          .catch(err => {
              if(!cb) return Promise.reject(err);
              cb(err);
          });
      }

      /**
       * @param {field} - name of the field to be set
       * @param {payload} - value for the field
       * @callback cb - The callback that handles the response
       * The Messenger Profile for your bot is where you set properties that define various aspects of the following Messenger Platform features
       * for more information please visit here @{https://developers.facebook.com/docs/messenger-platform/reference/messenger-profile-api}
       */

      setField(field, payload, cb){
          return request({
              method: 'POST',
              uri: `${_fb.baseURL}/me/messenger_profile`,
              qs: this._getQs(),
              json: {
                  [field]: payload
              }
          })
          .then(body => {
              if(body.error) return Promise.reject(body.error);
              if(!cb) return body;
              cb(null, body);
          });
      }

      deleteField(field, cb){
          return request({
              method: 'DELETE',
              uri: `${_fb.baseURL}/me/messenger_profile`,
              qs: this._getQs(),
              json: {
                  fields: [field]
              }
          })
          .then(body => {
              if(body.error) return Promise.reject(body.error)
              if(!cb) return body;
              cb(null, body);
          })
          .catch(err => {
              if(!cb) return err;
              cb(err);
          });
      }
      
      setGetStartedButton (payload, cb) {
        return this.setField('get_started', payload, cb);
      }
    
      setPersistentMenu (payload, cb) {
        return this.setField('persistent_menu', payload, cb);
      }
    
      setDomainWhitelist (payload, cb) {
        return this.setField('whitelisted_domains', payload, cb);
      }
    
      setGreeting (payload, cb) {
        return this.setField('greeting', payload, cb);
      }
    
      removeGetStartedButton (cb) {
        return this.deleteField('get_started', cb);
      }
    
      removePersistentMenu (cb) {
        return this.deleteField('persistent_menu', cb);
      }
    
      removeDomainWhitelist (cb) {
        return this.deleteField('whitelisted_domains', cb);
      }
    
      removeGreeting (cb) {
        return this.deleteField('greeting', cb);
    }

      init(){
          return(req, res) => {              
              const parsed = JSON.parse(req.body);
              if (parsed.entry[0].messaging !== null && typeof parsed.entry[0].messaging[0] !== 'undefined') {
                  this._handleMessage(parsed);
              }
              return res.status(200).json({status: "ok"});
          };
      }

      _handleMessage (json) {
        let entries = json.entry;
        
    
        entries.forEach((entry) => {
          let events = entry.messaging;
    
          events.forEach((event) => {
            // handle inbound messages and echos
            if (event.message) {
              if (event.message.is_echo) {
                this._handleEvent('fb_echo', event);
              } else {
                this._handleEvent('fb_message', event);
              }
            }
    
            // handle postbacks
            if (event.postback) {
              this._handleEvent('fb_postback', event);
            }
    
            // handle message delivered
            if (event.delivery) {
              this._handleEvent('fb_delivery', event);
            }
    
            // handle message read
            if (event.read) {
              this._handleEvent('fb_read', event);
            }
    
            // handle authentication
            if (event.optin) {
              this._handleEvent('fb_authentication', event);
            }
    
            // handle referrals (e.g. m.me links)
            if (event.referral) {
              this._handleEvent('fb_referral', event);
            }
    
            // handle account_linking
            if (event.account_linking && event.account_linking.status) {
              if (event.account_linking.status === 'linked') {
                this._handleEvent('fb_accountLinked', event);
              } else if (event.account_linking.status === 'unlinked') {
                this._handleEvent('fb_accountUnlinked', event);
              }
            }
          });
        });
    }

      _handleEvent(type, event){
          this.emit(type, event, this.sendMessage.bind(this, event.sender.id), this._getActionsObject(event));
      }

      _getActionsObject(event){
          return {
              setTyping: (typingState, cb) => {
                  let senderTypingAction = typingState ? 'typing_on' : 'typing_off';
                  this.sendSenderAction(event.sender.id, senderTypingAction, cb);
              },
              markRead: this.sendSenderAction.bind(this, event.sender.id, 'mark_seen')
          };
      }

      _verify(req, res){    
           
          let query = qs.parse(url.parse(req.url).query);
          if(query['hub.verify_token'] === this.verify_token){
              return res.end(query['hub.challenge']);
          }
          return res.end('Error, Wrong Validation token');
      }

     _getQs(qs){
         if(typeof qs === 'undefined'){
             qs = {};
         }

         qs.access_token = this.token;

         if(this.debug){
             qs.debug = this.debug;
         }

         return qs;
     }
}

// Export module

module.exports = Facebook;