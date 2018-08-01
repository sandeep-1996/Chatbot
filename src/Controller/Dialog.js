'use strict';

/**
 * 
 * Smartdata inc 
 * Project Name :- Milego Chatbot
 * Framworks :- Dialogflow, Facebook Messanger,Expressjs
 * Plateform :- Nodejs
 */

const async = require('async');
const Dialogflow = require('../lib').Dialogflow;
//const RedisStore = require('../stores/redis_store');
const Messages = require('../Controller/messages');
const Action = require('../Controller/Action');
const Service = require('../models/userServices');

const _config_ = {
    access_token: '6fe1fc7577af43d19890303bd014eaff',
    language: 'en',
    requestSource: "fb"
};

/**
 * initialize Dialogflow with configuration provided by user 
 * @param {language}
 * @param {source}
 * 
 */

const initDialogFlow = (token, language, source) => {
    let _obj_ = {};
    if (token) {
        Object.assign(_obj_, {
            access_token: token
        });
    }
    if (language) {
        Object.assign(_obj_, {
            language: language
        });
    }
    if (source) {
        Object.assign(_obj_, {
            requestSource: source
        });
    }
    return {
        [language]: new Dialogflow(_obj_)
    };
};

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

/**
 * check config 
 * @param {*} id 
 * @param {*} inncb 
 */
const checkConfig = (id, inncb) => {
    let senderId = null;
    let _lang = null;
    let _langCode = null;
    (typeof id=== 'object' && "sender" in id) ? senderId = id.sender.id : senderId = id;
    inncb()
//    //RedisStore.getRedis(senderId, (err, userProfile) => {
//         console.log("==",id,"==")
//         if (userProfile) {
//             RedisStore.getRedis(`${senderId}_LANG`, (err, result) => {
//                 console.log(err, result)
//                 if (result) {
//                     inncb(null, {
//                         lang: result
//                     });
//                 } else {                    
//                     if (id.postback.payload === 'en') {
//                         _lang = 'Your Preference for language is set successfully'
//                         _langCode = 'en'
//                     }
//                     if (id.postback.payload === 'zh-TW' ) {
//                         _lang = '您的語言優先權設置成功'
//                         _langCode = 'zh-TW'
//                     }
    
//                     RedisStore.setRedis(`${senderId}_LANG`, _langCode, (er, re) => {
//                         if (re) {
//                             inncb(null,_lang)
//                         } 
//                     })
//                 }
//             });
//         } else {
//             inncb(null, Messages.LoginAccountMessage);
//         }
//     });
}

/**
 * Process user message in Dialogflow (api ai)
 * @param {*} id 
 * @param {*} payload 
 * @param {*} reply 
 */
const processMessage = (id, text, source, reply) => {
   
    let apiai = null;  
    //console.log('sandeep',id);
    //console.log('text',id,text);
    async.auto({
        
        'check_Config': (cb) => {
           
            checkConfig(id, (err, result) => {
              
                if (result) {
                    if ('lang' in result) {
                        cb();
                    } else {
                        (source.device === 'mb') ? cb() : reply(result)
                    }
                } else {
                    cb();
                }
            });
        },
        'init_DF': ['check_Config', (result, cb) => {
            apiai = initDialogFlow(_config_.access_token, _config_.language, _config_.requestSource)['en'];
            apiai.sendTextMessage(text, { sessionId: id });
            
            cb();
        }],
        'DF_Response': ['init_DF', (result, cb) => {
            apiai.on('df_response', (response) => {               
                if (isDefined(response.result) && isDefined(response.result.fulfillment) && !response.result.actionIncomplete) {
                    let responseText = response.result.fulfillment.speech;
                  
                    if (response.result.action) {
                        if (Object.keys(Action.Obj).includes(response.result.action)) {
                            
                           Action.Obj[response.result.action](response, (err, result, event) => {
                                if (event) {
                                    if(source.device !== 'mb') { apiai.sendEvent(result.event, result.options);}
                                    if (result.msg) {
                                        Service.updateChat({userID:id}, {
                                            sessionId: source.authCode,
                                            $push: {"conversition": {"text": result.msg, "sender_type": "BOT","isMine": false}}                            
                                        },{new: true, upsert: true},(err, result) => {
                                          console.log('jhjhjhj',err,'result', result);
                                        });

                                        (source.device === 'mb') ? reply.send(Object.assign(result.msg,{isMine: false})) : reply(result.msg)
                                    }
                                } else {
                                    Service.updateChat({userID:id}, {
                                        sessionId: source.authCode,
                                        $push: {"conversition": {"text": responseText, "sender_type": "BOT", "isMine": false} }
                        
                                    },{new: true, upsert: true},(err, result) => {
                                     console.log(err, result);
                                    });

                                    (source.device === 'mb') ? 
                                    reply.send({
                                        text: responseText,
                                        isMine: false
                                    }) : reply({
                                        text: responseText
                                    }) 
                                }
                            });
                        } else {
                            Service.updateChat({userID:id}, {
                                sessionId: source.authCode,
                                $push: {"conversition": {"text": responseText, "sender_type": "BOT", "isMine": false} }
                
                            },{new: true, upsert: true},(err, result) => {
                             console.log(err, result);
                            });

                            (source.device === 'mb') ? reply.send({
                                text: responseText,
                                isMine: false
                            }) : reply({
                                text: responseText
                            })
                        }
                    } else {
                        Service.updateChat({userID:id}, {
                            sessionId: source.authCode,
                            $push: {"conversition": {"text": responseText, "sender_type": "BOT", "isMine": false} }
            
                        },{new: true, upsert: true},(err, result) => {
                         console.log(err, result);
                        });

                        (source.device === 'mb') ? reply.send({
                            text: responseText,
                            isMine: false
                        }) : reply({
                            text: responseText
                        })
                    }
                } else {

                    (source.device === 'mb') ? reply.send({
                        text: response.result.fulfillment.speech,
                        isMine: false
                    }) : reply({
                        text: response.result.fulfillment.speech
                    })
                }
            });
        }]
    }, (err, result) => {
        console.log(" ================ DONE =================== ")

    });
};

 module.exports = {checkConfig,  processMessage}