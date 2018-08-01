/**
 * 
 * API AI EVENTS INVOK
 * 
 */

const Facebook = require('../Utils/facebook');
const RedisStore = require('../stores/redis_store');
const API = require('./API');
const Utils = require('../Utils/Utils');
const moment = require('moment');
const Messages = require('../Controller/messages');
const async = require('async');

exports.postback = {

        'GET_STARTED_PAYLOAD': (event,reply) => {
         
        },
        'en': (event, reply) => {
                RedisStore.setRedis(`${event.sender.id}_LANG`, event.postback.payload, (er, re) => {
                        if (re) {
                               reply({text: 'Your Preference for language is set successfully'});
                        }
                });

        },
        'zh-TW': (event, reply) => {
                RedisStore.setRedis(`${event.sender.id}_LANG`, event.postback.payload, (er, re) => {
                        if (re) {
                                reply({ text: '您的語言優先權設置成功'});                                
                        }
                });
        },
        'FACEBOOK_WELCOME': (event, reply) => {                             
                reply(Messages.LoginAccountMessage);
        },

        "VIEWMORE": (event, reply) => {
                let msg = null;
                let _ele_;
                let r_s = RedisStore.getRedis(`${event.sender.id}_rideDetials`, (e, r) => {
                        if (e) {
                                console.error(e);
                        } else {

                                let query = `${r.split('limit')[0]} limit 4 offset ${event.postback.payload.split(":")[1]}`
                                RedisStore.setRedis(`${event.sender.id}_rideDetials`, `${query}`, (err, result) => {})
                                API.rideDetails(query, (err, result1) => {

                                        let _ele_ = [];
                                        let lang = null;
                                        async.series([
                                                innercb => {
                                                        RedisStore.getRedis(`${event.sender.id}_LANG`, (err, result) => {
                                                                if (result) {
                                                                        lang = result;
                                                                        innercb();
                                                                } else {
                                                                        innercb();
                                                                }
                                                        })
                                                },
                                                innercb => {
                                                        if (lang === 'zh-TW') {
                                                                async.mapSeries(result1, (v, i) => {
                                                                        translate.translateText(`ride on ${moment(v.start_date).format("MMMM Do YYYY, h:mm a")} ($${v.total_charges})`, lang, (err, title) => {
                                                                                translate.translateText(`Ori:- ${v.location_origin ? v.location_origin.slice(0, 20) + ((v.location_origin.length > 20) ? "..." : "") : 'null'} Des:-  ${v.location_destination ? v.location_destination.slice(0, 20) + ((v.location_destination.length > 20) ? "..." : "") : 'null'} car :- ${v.brand} - ${v.carName}`, lang, (err, subtitle) => {
                                                                                        _ele_.push(Object.assign({}, {
                                                                                                title: title,
                                                                                                image_url: 'https://cdn.pixabay.com/photo/2013/07/13/14/02/car-162008_960_720.png',
                                                                                                subtitle: subtitle
                                                                                        }));
                                                                                        i();
                                                                                });
                                                                        });

                                                                }, innercb);
                                                        } else {
                                                                async.mapSeries(result1, (v, i) => {
                                                                        _ele_.push(Object.assign({}, {
                                                                                title: `ride on ${moment(v.start_date).format("MMMM Do YYYY, h:mm a")} ($${v.total_charges})`,
                                                                                image_url: 'https://cdn.pixabay.com/photo/2013/07/13/14/02/car-162008_960_720.png',
                                                                                subtitle: `Ori:- ${v.location_origin.slice(0, 20) + (v.location_origin.length > 20 ? "..." : "")} Des:-  ${v.location_destination.slice(0, 20) + (v.location_destination.length > 20 ? "..." : "")} car :- ${v.brand} - ${v.carName}`
                                                                        }));
                                                                        i();
                                                                }, innercb);
                                                        }
                                                },
                                                innercb => {
                                                        if (Array.isArray(result1) && result1.length >= 2) {
                                                                msg = {
                                                                        "attachment": {
                                                                                "type": "template",
                                                                                "payload": {
                                                                                        "template_type": "list",
                                                                                        "top_element_style": "large",
                                                                                        "elements": _ele_,
                                                                                        "buttons": [{
                                                                                                "title": (lang !== 'zh-TW') ? "View More" : '查看更多',
                                                                                                "type": "postback",
                                                                                                "payload": `VIEWMORE:${4 + Number(event.postback.payload.split(":")[1])}`
                                                                                        }]
                                                                                }
                                                                        }
                                                                };


                                                        } else if (Array.isArray(result1) && result1.length === 1) {
                                                                msg = {
                                                                        "attachment": {
                                                                                "type": "template",
                                                                                "payload": {
                                                                                        "template_type": "generic",
                                                                                        "elements": _ele_,
                                                                                }
                                                                        }
                                                                };
                                                        } else {
                                                                msg = {
                                                                        "text": (lang !== 'zh-TW') ? "End of detail" : "細節結束"
                                                                };
                                                        }
                                                        innercb();
                                                }
                                        ], (err, result) => {
                                                process.emit('payback', event.sender.id, msg);
                                        });
                                });
                        }
                });
        },
        'MORECARS': (event, reply) => {
                let msg = null;
                let _ele_;
                let r_s = RedisStore.getRedis(`${event.sender.id}_moreRides`, (e, r) => {

                        if (e) {
                                console.error(e);
                        } else {
                                let query = `${r.split('limit')[0]} limit 4 offset ${event.postback.payload.split(":")[1]}`

                                console.log('*', query, '*')

                                RedisStore.setRedis(`${event.sender.id}_moreRides`, `${query}`, (err, result) => {})
                                API.rideDetails(query, (err, result) => {
                                        let _ele_ = result.map((v, i) => {
                                                return Object.assign({}, {
                                                        title: `${v.brand} - ${v.model}`,
                                                        image_url: 'https://cdn.pixabay.com/photo/2013/07/13/14/02/car-162008_960_720.png',
                                                        subtitle: `Name:- ${v.nickname}
                                                        Model:- ${v.model}`
                                                })
                                        })

                                        if (Array.isArray(result) && result.length >= 2) {

                                                let btn = [{
                                                        "title": "View More",
                                                        "type": "postback",
                                                        "payload": `MORECARS:${4 + Number(event.postback.payload.split(":")[1])}`
                                                }]

                                                msg = Message.carTemplate(_ele_, btn)

                                        } else if (Array.isArray(result) && result.length === 1) {
                                                msg = {
                                                        "attachment": {
                                                                "type": "template",
                                                                "payload": {
                                                                        "template_type": "generic",
                                                                        "elements": _ele_,
                                                                }
                                                        }
                                                }
                                        } else {
                                                msg = {
                                                        "text": "End of detail"
                                                }

                                        }

                                        process.emit('payback', event.sender.id, msg)
                                })

                        }
                })

        }
}