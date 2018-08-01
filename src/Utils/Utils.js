const util = require('util');
const UserStore = require('../stores/user_store')
const uuid = require('uuid')
const RedisStore = require('../stores/redis_store')



const JSONInspect = (obj) => {
   console.log('\n\n-0-',util.inspect(obj, false, null),'-0-\n\n')
}

const linkAccountToMessenger = (res, username, authCode, redirectURI) => {   
     // UserStore.USER_STORE.linkMessengerAccount(username,authCode,'AUTH_CODE');  
    // Redirect users to this URI on successful login
     const redirectURISuccess = `${redirectURI}&authorization_code=${authCode}`;  
    RedisStore.setRedis(username,authCode, (err, result) => {})
    res.redirect(redirectURISuccess);
};
  

module.exports = {
    JSONInspect,
    linkAccountToMessenger
}