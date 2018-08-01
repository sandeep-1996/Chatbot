const Utils = require('../Utils/Utils');
const APP_CONSTANT = require('../Utils/AppConstant');
const Message = require('../Controller/messages');
const UserStore = require('../stores/user_store');
const API = require('./API');
const Facebook = require('../Utils/facebook');
const os = require('os');
const moment = require('moment');
const RedisStore = require('../stores/redis_store');
const async = require('async');
const translate = require('../Utils/translate');



const Obj = {
    'getRideDetails': (response, cb) => {
       
        let authCode = null;
        let obj = response.result;
        let apiObject = {};
        let _obj_ = {};
        let _c = 0;
        let msg = null;
        let redisObject = [];
        let q = null;
        let queryString = null;
        let queryString_one = null;
        let limit = null;
        let lang = null;


        async.auto({
            'translateChinese': (cb) => {
                RedisStore.getRedis(`${response.sessionId}_LANG`, (err, result) => {
                    let _c = 0
                    let _i = 0 
                    if (result) {                        
                        if(result === 'zh-TW'){
                            Object.keys(obj.parameters).forEach((v,i) => {
                                if(obj.parameters[v] && obj.parameters[v] !== ''){
                                  if(v === 'date'){_c++}
                                  if(v === 'date-period'){_i++}
                                  if(v === 'date-period1'){
                                    if(_i === 1){
                                        let dt = obj.parameters[v].split('/')
                                         obj.parameters['date-period'] = `${moment(dt[0]).subtract(1, 'year').format('YYYY-MM-DD')}/${moment(dt[1]).subtract(1, 'year').format('YYYY-MM-DD')}`
                                         delete obj.parameters[v]
                                      }
                                  }
                                  if(v === 'date1'){   
                                      if(_c === 1){
                                        obj.parameters['date-period'] = `${date}/${date1}`
                                        delete obj.parameters['date1']
                                      }                      
                                     
                                  }
                                  if(v === 'ride_type'){

                                  }
                                  if(v === 'ride_type1'){

                                  }
                                  if(v === 'vehicle'){

                                  }
                                }
                             
                            })

                        } else {

                        }
                        lang = result
                        cb()
                    } else {
                        cb()
                    }
                })
            },
            'queryFromRedis': (cb) => {
                RedisStore.getRedis(response.sessionId, (er, authcode) => {
                    if (er) {
                        cb(er)
                    } else {
                        console.log(authcode);
                        authCode = authcode
                        cb()
                    }
                })
            },

            'mapParams': ['queryFromRedis', (result, cb) => {

               // authCode = '33539506191504009005'

                q = `SELECT count(*) as count, mta_rides.status as status , mta_users.name as name,mta_manufacturers.name as brand`
                queryString = ` FROM mta_users_token 
          LEFT JOIN mta_rides on mta_users_token.userid = mta_rides.user_id 
          LEFT JOIN mta_users on mta_users.id = mta_rides.user_id
          LEFT JOIN mta_user_vehical on mta_user_vehical.id = mta_rides.vehical_id
          LEFT JOIN mta_manufacturers on mta_manufacturers.id = mta_user_vehical.manufaturer_id
          WHERE (token='${authCode}' and mta_rides.status = 1 and mta_rides.category_id > 0)`

                queryString_one = `SELECT mta_rides.status as status, mta_manufacturers.name as brand, total_distance, total_charges, mta_users.name as userName,start_date, end_date, start_location_id as origin, end_location_id as destination,r.location_name as location_origin, p.location_name as location_destination, vehical_id as vehical, nickname as carName FROM mta_users_token 
          LEFT JOIN mta_rides on mta_users_token.userid = mta_rides.user_id 
          LEFT JOIN mta_users on mta_users.id = mta_rides.user_id
          LEFT JOIN mta_ride_locations as r on r.id = mta_rides.start_location_id
	      LEFT JOIN mta_ride_locations as p  on p.id = mta_rides.end_location_id
          LEFT JOIN mta_user_vehical on mta_user_vehical.id = mta_rides.vehical_id
          LEFT JOIN mta_manufacturers on mta_manufacturers.id = mta_user_vehical.manufaturer_id
          WHERE (token='${authCode}' and mta_rides.status = 1 and mta_rides.category_id > 0)`

                q = `SELECT  count(*) as count, userid, mta_rides.status as status, mta_users.name as name, mta_manufacturers.name as brand, sum(total_charges) as totalCharge, sum(total_distance) as totalDistance`

                Object.keys(obj.parameters).forEach((v) => {                   
                    if (obj.parameters[v] === '') {
                        delete obj.parameters[v]
                    }
                });
                cb()
            }],
            'checkParams': ['mapParams', (result, cb) => {

                if (Object.keys(obj.parameters).length > 0) {

                    Object.keys(obj.parameters).forEach((v) => {
                        if (v === 'date-period' && obj.parameters[v] !== '') {
                            let _d = obj.parameters[v].split('/')
                            queryString = `${queryString} and (date(start_date) >= '${_d[0]}' and date(end_date) <= '${_d[1]}')`
                            queryString_one = `${queryString_one} and (date(start_date) >= '${_d[0]}' and date(end_date) <= '${_d[1]}')`
                            Object.assign(_obj_, {
                                'date-period': obj.parameters[v]
                            })
                        }

                        if (v === 'date' && obj.parameters[v] !== '') {
                            Object.assign(_obj_, {
                                'date': obj.parameters[v]
                            })
                            queryString = `${queryString} and (date(start_date) >= '${obj.parameters[v]}' and date(end_date) <= '${obj.parameters[v]}')`;
                            queryString_one = `${queryString_one} and (date(start_date) >= '${obj.parameters[v]}' and date(end_date) <= '${obj.parameters[v]}')`

                        }

                        if (v === 'vehicle' && obj.parameters[v] !== '') {
                            queryString = `${queryString} and mta_manufacturers.name = '${obj.parameters[v]}'`
                            queryString_one = `${queryString_one} and mta_manufacturers.name = '${obj.parameters[v]}'`
                        }

                        if (v === 'ride_type' && obj.parameters[v] !== '') {
                            _c++
                            if (_c === 1) {
                                queryString = `${queryString} and(`
                                queryString_one = `${queryString_one} and(`
                            }
                            if (_c === 2) {
                                queryString = `${queryString} or`
                                queryString_one = `${queryString_one} or`
                            }
                            Object.assign(_obj_, {
                                'type': obj.parameters[v]
                            })
                            if (obj.parameters[v] === 'Personal') {
                                q = `${q},SUM(IF(category_id = 1, total_distance, 0)) AS personal_distance,SUM(IF(category_id = 1, total_charges, 0)) AS personal_charge`
                                queryString = `${queryString}category_id=1`
                                queryString_one = `${queryString_one}category_id=1`

                            }

                            if (obj.parameters[v] === 'Business') {
                                q = `${q},SUM(IF(category_id = 2, total_distance, 0)) AS business_distance,SUM(IF(category_id = 2, total_charges, 0)) AS business_charge`
                                queryString = `${queryString}category_id=2`
                                queryString_one = `${queryString_one}category_id=2`
                            }
                        }

                        // ride_type1

                        if (v === 'ride_type1' && obj.parameters[v] !== '') {
                            _c++
                            if (_c === 1) {
                                queryString = `${queryString} and(`
                                queryString_one = `${queryString_one} and(`
                            }

                            if (_c === 2) {
                                queryString = `${queryString} or `;
                                queryString_one = `${queryString_one} or `;
                            }

                            Object.assign(_obj_, {
                                'type1': obj.parameters[v]
                            });
                            if (obj.parameters[v] === 'Personal') {
                                q = `${q},SUM(IF(category_id = 1, total_distance, 0)) AS personal_distance,SUM(IF(category_id = 2, total_charges, 0)) AS personal_charge`;
                                queryString = `${queryString}category_id=1`;
                                queryString_one = `${queryString_one}category_id=1`;
                            }

                            if (obj.parameters[v] === 'Business') {
                                q = `${q},SUM(IF(category_id = 2, total_distance, 0)) AS business_distance,SUM(IF(category_id = 2, total_charges, 0)) AS business_charge`;
                                queryString = `${queryString}category_id=2`;
                                queryString_one = `${queryString_one}category_id=2`;
                            }
                        }

                    });

                    cb();
                } else {
                    cb();
                }
            }],

            'setQuery': ['checkParams', (result, cb) => {
                if (_c > 0) {
                    queryString = `${queryString})`;
                    queryString_one = `${queryString_one})`;
                }

                limit = ` limit 4 offset 0`;

                RedisStore.setRedis(`${response.sessionId}_rideDetials`, `${queryString_one}${limit}`, (err, result) => {
                    //  console.log(err, '-----------Error---------------', result, '--------result---------------')
                    cb();
                });
            }],

            'queryInDB': ['setQuery', (result, cb) => {

                API.rideDetails(`${q}${queryString}`, (err, result) => {              
                 

                    if (Array.isArray(result) && result.length === 0) {

                        Object.assign(_obj_, {
                            noResultFound: 'Sorry'
                        });

                    } else {
                        if (result && result.length > 0) {
                        
                            Object.assign(_obj_, result[0]);
                            API.rideDetails(`${queryString_one}${limit}`, (err, result1) => {

                                Utils.JSONInspect(err);
                                
                                let _ele_ = [];
                                async.series([
                                    innercb => {
                                        if (lang === 'zh-TW') {
                                            async.mapSeries(result1, (v, i) => {
                                                translate.translateText(`ride on ${moment(v.start_date).format("MMMM Do YYYY, h:mm a")} ($${v.total_charges})`, lang, (err, title) => {
                                                    translate.translateText(`Ori:- ${v.location_origin.slice(0, 20) + (v.location_origin.length > 20 ? "..." : "")} Des:-  ${v.location_destination.slice(0, 20) + (v.location_destination.length > 20 ? "..." : "")} car :- ${v.brand} - ${v.carName}`, lang, (err, subtitle) => {
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
                                            let btn = [{
                                                "title": (lang !== 'zh-TW') ? "View More" : '查看更多',
                                                "type": "postback",
                                                "payload": "VIEWMORE:4"
                                            }];

                                            msg = Message.carTemplate(_ele_, btn);

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
                                                "text": (lang !== 'zh-TW') ? "Sorry no records" : '對不起沒有記錄'
                                            };
                                        }
                                        innercb();
                                    },
                                    innercb => {
                                        let event = {
                                            name: "rideDetails",
                                            data: ((Object.keys(response.result.parameters).length > 0) && response.result.parameters.vehicle === '') ? {
                                                vehicle: response.result.parameters.vehicle
                                            } : _obj_
                                        };

                                        let options = {
                                            sessionId: response.sessionId
                                        };
                                        obj = {
                                            event: event,
                                            options: options,
                                            senderId: response.sessionId
                                        };

                                        Object.assign(obj, {
                                            msg
                                        });
                                        innercb();
                                    }
                                ], (err, result) => {
                                  //  console.log('--------------------------', Utils.JSONInspect(obj), '-------------------------------------------------------')
                                    cb();
                                });

                            });

                        } else {
                            let _msg = {
                                "text": "Sorry no records"
                            };
                            Facebook.sendFBMessage(response.sessionId, _msg);
                        }

                    }
                });
            }]
        }, (e, r) => {
            e ? cb(e) : cb(null, obj, 'rideDetails')
        })
    },

    'getCarDetails': (response, cb) => {
        let obj = response.result;
        let _obj_ = {};
        const userProfile = UserStore.USER_STORE.getByMessengerId(response.sessionId);
        let authCode = userProfile.authCode;

        //authCode = '33539506191504009005'

        let queryString = `SELECT mta_manufacturers.name as brand, mta_users.name as userName, mta_user_vehical.nickname as nickname, mta_user_vehical.year, mta_car_models.car_name as model FROM mta_users_token 
        LEFT JOIN mta_users on mta_users.id = mta_users_token.userid
        LEFT JOIN mta_user_vehical on mta_users_token.userid = mta_user_vehical.user_id 
        LEFT JOIN mta_manufacturers on mta_manufacturers.id = mta_user_vehical.manufaturer_id
        LEFT JOIN mta_car_models on  mta_car_models.id = mta_user_vehical.carmodel_id  
        WHERE token='${authCode}' group by model limit 4 offset 0`

        RedisStore.setRedis(`${response.sessionId}_moreRides`, `${queryString}`, (err, result) => {})

        API.carDetails(queryString, (err, result) => {   
            
          if(result > 0){

            let _ele_ = result.map((v, i) => {
                return Object.assign({}, {
                    title: `${v.brand} - ${v.model}`,
                    image_url: 'https://cdn.pixabay.com/photo/2013/07/13/14/02/car-162008_960_720.png',
                    subtitle: `Name:- ${v.nickname}
                    Model:- ${v.model}
                    Year:- ${v.year}`
                })
            })

            if (Array.isArray(result) && result.length >= 2) {
                let btn = [{
                    "title": "View More",
                    "type": "postback",
                    "payload": "MORECARS:4"
                }]

                msg = Message.carTemplate(_ele_, btn)

                let event = {
                    name: "carDetails",
                    data: _obj_
                };

                let options = {
                    sessionId: response.sessionId
                }
                let obj = {
                    event: event,
                    options: options,
                    senderId: response.sessionId
                }

                Object.assign(obj, {
                    msg
                })
                cb(null, obj, 'rideDetails')
            }

          } else {
            let _msg = {
                "text": "Sorry no records"
            }
            Facebook.sendFBMessage(response.sessionId, _msg)
          }           

        })
    },
    'enableWorkHours': (response, cb) => {
        let queryObj = []
        let workhour = {}
        let authCode = null;
        async.auto({
            mapParams: (cb) => {
                const gsDayNames = ["sun","mon", "thue", "wed", "thurs", "fri", "sat"];
                let timePeriod = response.result.parameters;
                timePeriod = timePeriod['time-period'].split('/')
                Object.keys(response.result.parameters).forEach((v, i) => {
                    if ('date' === v && response.result.parameters[v] !== '') {
                        response.result.parameters[v].map((_v, _i) => {
                            queryObj.push(Object.assign({}, {
                                [gsDayNames[new Date(_v).getDay()]]: {
                                    morning: moment(timePeriod[0], ["HH:mm"]).format("h:mm A"),
                                    evening: moment(timePeriod[1], ["HH:mm"]).format("h:mm A")
                                }
                            }))
                        })
                    } else if ('date-period' === v && response.result.parameters[v] !== '') {
                        gsDayNames.map((v, i) => {
                            queryObj.push(Object.assign({}, {
                                [v]: {
                                    morning: moment(timePeriod[0], ["HH:mm"]).format("h:mm A"),
                                    evening: moment(timePeriod[1], ["HH:mm"]).format("h:mm A")
                                }
                            }))
                        })
                    }
                })

                if (Array.isArray(queryObj) && queryObj.length === 0) {
                    let timePeriod = response.result.parameters;
                    timePeriod = timePeriod['time-period'].split('/')
                    gsDayNames.map((v, i) => {
                        queryObj.push(Object.assign({}, {
                            [v]: {
                                morning: moment(timePeriod[0], ["HH:mm"]).format("h:mm A"),
                                evening: moment(timePeriod[1], ["HH:mm"]).format("h:mm A")
                            }
                        }))
                    })
                }

                cb()

            },
            userAuthCode: (cb) => {
                RedisStore.getRedis(response.sessionId, (err, result) => {
                    authCode = result;
                    cb()
                })
            },
            postParams: ['mapParams', 'userAuthCode', (result, cb) => { 
                //console.log(Object.assign({},...queryObj),'-------------------')            
                let obj = {
                    authCode: authCode,
                    data: {
                        workhour:  Object.assign({},...queryObj)
                    }
                }
                API.workHours(obj, (err, result) => {
                    process.emit('workHours', response.sessionId, {
                        text: (response.lang == 'en') ? 'your work hours saved successfully ' : '您的工作時間成功保存'
                        
                    })                    
                })
            }]
        }, (err, result) => {

        })
    },
    'changeLang': (response, cb) => {
        let _lang = null;
        let _langCode = null;
        async.series([
            innerCb => {
                RedisStore.getRedis(`${response.sessionId}_LANG`, (er, re) => {
                    if (re === 'zh-TW') {
                        translate.translateText(response.result.parameters.language, 'en', (e, r) => {
                            response.result.parameters.language = r;
                            innerCb()
                        })
                    } else {
                        innerCb()
                    }
                })
            },
            innerCb => {
                if (response.result.parameters.language === 'english' || response.result.parameters.language === 'English') {
                    _lang = 'Your Preference for language is set successfully'
                    _langCode = 'en'
                }
                if (response.result.parameters.language === 'chinese' || response.result.parameters.language === 'Chinese') {
                    _lang = '您的語言優先權設置成功'
                    _langCode = 'zh-TW'
                }

                RedisStore.setRedis(`${response.sessionId}_LANG`, _langCode, (er, re) => {
                    if (re) {
                        process.emit('changeLang', response.sessionId, {
                            text: _lang
                        }, _langCode)
                        innerCb()
                    } 
                })

            }
        ], (err, result) => {})
    }
}

const accountLinked = (payload, reply) => {
   reply(Message.signInSuccessMessage)
}

const accountUnlinkned = (payload, reply) => {
    console.log(payload);
    const senderId = payload.sender.id;
    RedisStore.unsetRedis(senderId, (err, result) => {
        reply(Message.signOutSuccessMessage)
    })
}

const handleReceiveAccountLink = (event, callback) => {
    const senderId = event.sender.id;
    /* eslint-disable camelcase */
    const status = event.account_linking.status;
    const authCode = event.account_linking.authorization_code;

    switch (status) {
        case 'linked':
            callback(senderId, Message.signInSuccessMessage)
            break;
        case 'unlinked':
            RedisStore.unsetRedis(senderId, (err, result) => {
                callback(senderId, Message.signOutSuccessMessage)
            })
            break;
        default:
            break;
    }
};


module.exports = {
    Obj,
    accountLinked,
    accountUnlinkned,
    handleReceiveAccountLink
}