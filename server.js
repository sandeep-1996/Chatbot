/**
 * 
 * Smartdata inc 
 * Project Name :- Milego Chatbot
 * Framworks :- Dialogflow, Facebook Messanger,Expressjs
 * Plateform :- Nodejs
 */


'use strict';


// ====    npm modules  =====
const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const path = require('path');
const facebookBot = require('./src/lib').Facebook;
const mongoose = require('mongoose');




// ===== custom modules  ======
const Events = require('./src/Controller/Event');
const Action = require('./src/Controller/Action');
const API = require('./src/Controller/API');
const UserStore = require('./src/stores/user_store');
const Dialog = require('./src/Controller/Dialog');
const Messages = require('./src/Controller/messages');
const Service = require('./src/models/userServices');



// ====== certificate =======
const privateKey = fs.readFileSync('./certs/stagingsdei_com.key', 'utf8');
const certificate = fs.readFileSync('./certs/c86aaff33f318ca4.crt', 'utf8');
const ca = fs.readFileSync('./certs/gd_bundle-g2-g1.crt');
//const RedisStore = require('./src/stores/redis_store');//
const httpsOptions = {
    // key: privateKey,
    // cert: certificate,
    // ca: ca
};

mongoose.connect('mongodb://localhost/milego');


const app = express();

/* ----------  Views  ---------- */

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'jade');
/* ----------  Static Assets  ---------- */

//app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(express.static(path.join(__dirname, 'src/public')));

/* ----------  Parsers  ---------- */
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
/* ----------  Parsers  ---------- */

const REST_PORT = 4106; //process.env.PORT || 4105 
const FB_TOKEN = 'EAAFVFZB6iCPABALtd4ZAfZAiZCdPvDGzGGNBLrSGCa1nOwCqz6HhR86vZBHXaiL7b3cKBszqA0ml3DeJFPvWN8AH9RfqSbjLEl93FZAEPWK0kVYB1P7WlMOxloDtrYRNbFaZBx6jTmy3JVgwCDp9rbwph02RXas1SAIZAb6XcZBvkzQZDZD';
const FB_VERFIY = 'eewqweqweqweqweqweqweqwewqe';

/**
 * facebook messanger constructor 
 */

let messanger = new facebookBot({
    token: FB_TOKEN,
    verify: FB_VERFIY
});


/**
 * When error send by messanger all are handle in this function
 * @param {err}
 */
messanger.on('error', (err) => {
    console.log(err.message, '----------');
});



/**
 * Set get start button which is apper when user first time 
 * interact with chatbot or may be this button apper
 * if user interact after long time
 * @param {Object}
 */
messanger.setGetStartedButton({
    "payload": "FACEBOOK_WELCOME"
});

/**
 * This is Greeting when user open chat for first time
 * @param {Array}
 */

messanger.setGreeting([{
    "locale": "default",
    "text": `Hello {{user_first_name}}!
              I am chatbot i am here to help you regarding`
}]);



/**
 * All Messages which comes from Messanger 
 * will handle here in this function
 * @param {payload}
 * @param {reply}
 */

messanger.on('fb_message', (payload, reply) => {     
    Dialog.processMessage(payload.sender.id, payload.message.text,'fb',reply);      
});

const Msges = () => {
    return function(req, res){    
       
       Service.chat({userID: req.query.id},{},{lean: true}, (err, result) => {
          err ? res.send(err) :  res.send(result[0])
       })
    }
}

const Message = () => {
    return function (req, res) {
        let _langCode = null;
        let _lang = null;
               
        const authCode = req.get('Authorization')
       
        //console.log(req.body)
        const payload = req.body;
        console.log(payload);
        //console.log(payload)
         //console.log(payload.text)
        //console.log(payload.lang);
        // RedisStore.setRedis(payload.id, authCode, (err, result) => {})

        // if (payload.lang === 'en') {
        //     _lang = 'Your Preference for language is set successfully'
        //     _langCode = 'en'
        // }
        // if (payload.lang === 'zh-TW' ) {
        //     _lang = '您的語言優先權設置成功'
        //     _langCode = 'zh-TW'
        // }

        //RedisStore.setRedis(`${payload.id}_LANG`, _langCode, (er, re) => {}) 

        // if(payload.lang){
        //        res.send(_lang)`
        // } else {   
            Service.updateChat({userID:payload.id}, {
               sessionId: authCode,
            
               $push: {"conversition": {"text": payload.text, "sender_type": "USER","isMine": true} }

             },{new: true, upsert: true},(err, result) => {
             console.log(err, result);
            })
            
            Dialog.processMessage(payload.id, payload.text,{device:'mb', authCode:authCode },res);      
       //}
    }
}


// function defination 





/**
 * here custom postback are handle in this function 
 * like example "VIEWMORE" when user click on button 
 * then it will handle here 
 * @param {payload}
 * @param {reply}
 */


messanger.on('fb_postback', (payload, reply) => {   
    Dialog.checkConfig(payload,(err, result) => {
        if('lang' in result) {
            Events.postback[payload.postback.payload.split(":")[0]](payload, reply);
        } else {           
            reply(result);
        }        
    });    
});


/**
 * When user want to login through messanger 
 * then messanger postback "accountlinked" event
 * @param {payload}
 * @param {reply}
 */
messanger.on('fb_accountLinked', (payload, reply) => {
    Action.accountLinked(payload, reply);
});


/**
 * When user want to logout through messanger then
 * then messanger postback "accountLikedin" event 
 */

messanger.on('fb_accountUnlinked', (payload, reply) => {
    Action.accountUnlinkned(payload, reply);
});



app.use(bodyParser.text({
    type: 'application/json'
}));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());

/* ----------  Loggers &c  ---------- */

/**
 * =========== Routes here  ==================
 */
app.get('/', function (req, res) {
    return res.send('Hey Welcome to Milego Chatbot :)');
    
});
app.get('/webhook/', (req, res) => {
    return messanger._verify(req, res);
});

app.post('/webhook/', messanger.init());
app.post('/device/message',Message());
app.get('/device/messages   ', Msges())
app.post('/login', API.userLogin());
app.get('/login', API.loginPage());


// ===== Server ====
http.createServer(app).listen(REST_PORT, () => console.log(`REST service ready on port ${REST_PORT}`));




// UserName:mallikata.naidu@smartdatainc.net, PWD:Password@123
// test@yopmail.com Nagpur@123



