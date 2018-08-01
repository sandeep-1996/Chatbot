
/**
 * 
 * Smartdata inc 
 * Project Name :- Milego Chatbot
 * Framworks :- Dialogflow, Facebook Messanger,Expressjs
 * Plateform :- Nodejs
 */

const async = require('async');
const Dialogflow = require('../lib').DialogflowV2;
const RedisStore = require('../stores/redis_store');
const Messages = require('../Controller/messages');
const Action = require('../Controller/Action');

const _config_ = {
    projectID:'fir-5c2c3',
    language: 'en-US'
}

const initDialogFlow = (language, source) => {
    let _obj_ = {};

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


/**
 *
 *
 * @param {*} obj
 * @returns
 */
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


// const checkConfig = (id, inncb) => {
//     RedisStore.getRedis(id, (err, userProfile) => {
//         if (userProfile) {
//             RedisStore.getRedis(`${id}_LANG`, (err, result) => {
//                 if (result) {
//                     inncb(null, {
//                         lang: result
//                     });
//                 } else {
//                     inncb(null, {
//                         perf: Messages.langPreference
//                     });
//                 }
//             });
//         } else {
//             inncb(null, {
//                 message: Messages.LoginAccountMessage
//             });
//         }
//     });
// }
