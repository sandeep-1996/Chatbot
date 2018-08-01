const Utils = require('../Utils/Utils');
const request = require('request');
const APP_CONSTANT = require('../Utils/AppConstant');
const Services = require('../models/userServices');
const config = require('config');
const _fb = config.get('facebook');
const UserStore = require('../stores/user_store')



/**
 * ride detail of user based upon user input query
 * @param {authCode}
 * @param {obj}
 * @callback function 
 * return obj 
 */

exports.rideDetails = (queryString,  cb) => {     
    newFunction(queryString);
    Services.user_query(queryString,function(error, results, fields){                  
        error ? cb(error) : cb(null,results)
    })
}

/**
 * user query for car details
 * @param querystring, 
 * @param cb
 * 
 */

exports.carDetails = (queryString, cb) => {
    Services.user_query(queryString,function(error, results, fields){                
        error ? cb(error) : cb(null,results)
    })
}

/**
 * Login Module user provide email and password
 * @param {obj}
 * @callback function 
 * return authCode for user
 */

const login = (obj, cb) => {
    request.post({
        headers: {
            'content-type': 'application/json',
            'securityKey': 'bfd8acd8223afc46cc914c48205b45de75a1dbb76d6dff159c8ef7d54baf65bc',
            'Mobile': true,
        },
        url: `${APP_CONSTANT.URL_CONSTANT.BASE_PATH}/verifyLoginDetailsFb`,     
        json: obj
    }, function (error, response, body) {       
        error ? cb(error) : cb(null, body);
    });
};


exports.userLogin = () => {
    return function (req, res) {
        const {
            username,
            password,
            redirectURI
        } = req.body;   
    
        login({
            username,
            password
        }, (err, result) => {
            if (err) {
                res.render('login', {
                    redirectURI,
                    username,
                    password,
                    errorMessage: 'Uh oh. That username doesn’t exist or Incorrect password. Please try again.',
                    router
                });
            } else {
                if (result && result.responceData.authorization_code) {    
                    psid(_fb.FB_TOKEN, req.body.accountLinkingToken, (err, result1) => {
                        result1 = JSON.parse(result1);
                        console.log(result.responceData.authorization_code)
                        Utils.linkAccountToMessenger(res, result1.recipient, result.responceData.authorization_code, redirectURI);
                    });
    
                } else {
                    res.render('login', {
                        redirectURI,
                        username,
                        password,
                        errorMessage: 'Uh oh. That username doesn’t exist or Incorrect password. Please try again.'                        
                    });
                }
            }
        });
    };
};

exports.loginPage = () => {
    return function (req, res) {
        /*
          Account Linking Token is never used in this demo, however it is
          useful to know about this token in the context of account linking.
      
          It can be used in a query to the Graph API to get Facebook details
          for a user. Read More at:
          https://developers.facebook.com/docs/messenger-platform/account-linking
        */
        const accountLinkingToken = req.query.account_linking_token;
    
        psid(_fb.FB_TOKEN, accountLinkingToken, (err, result) => {
            if (err) {
    
            } else {
                result = JSON.parse(result);
                const userProfile = UserStore.USER_STORE.getByMessengerId(result.recipient);
                if (Object.keys(userProfile).length > 0) {
                    const redirectURI = req.query.redirect_uri;
                    const redirectURISuccess = `${redirectURI}&authorization_code=${userProfile.authCode}`;
                    res.redirect(redirectURISuccess);
                } else {
                    const redirectURI = req.query.redirect_uri;
                    res.render('login', {
                        accountLinkingToken,
                        redirectURI
                    });
                }
            }
        });
    };
};

exports.workHours = (obj, cb) => {
    request.post({
        headers: {
            'content-type': 'application/json',
            'securityKey': 'bfd8acd8223afc46cc914c48205b45de75a1dbb76d6dff159c8ef7d54baf65bc',
            'Mobile': true,
            'authorization_code': obj.authCode

        },
        url: `${APP_CONSTANT.URL_CONSTANT.BASE_PATH}/chatBotWorkHourReset`,     
        json: obj.data
    }, function (error, response, body) {

        console.log(error,  body);
        error ? cb(error) : cb(null,body)
    });
}

/**
 * user's page-scoped ID 
 * Account Linking endpoint
 * @param accessToken
 * @param account_linking_token
 * @callback function 
 * return {PSID}
 */

const psid = (accessToken, account_linking_token,cb) => {
  request.get({
      url:'https://graph.facebook.com/v2.6/me',
      qs: {
        access_token: accessToken,
        fields: 'recipient',
        account_linking_token:account_linking_token
      }
  }, function(error, response, body){
      error ? cb(error) : cb(null,body)
  })
};

function newFunction(queryString) {
    console.log(`
    =========================================================================

    ${queryString}
    
    =========================================================================   
    `);
}




