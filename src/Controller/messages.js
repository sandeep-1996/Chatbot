const APP_CONSTANT = require('../Utils/AppConstant')
const SERVER_URL = APP_CONSTANT.URL_CONSTANT.HOST; // eslint-disable-line

/**
 * Account Link Button
 */
const signInButton = {
  type: 'account_link',
  url: `${APP_CONSTANT.URL_CONSTANT.HOST}/login`,
};

/**
 * Account Unlink Button
 */
const signOutButton = {
  type: 'account_unlink'
};


/**
 * Message that informs the user the must sign in and prompts
 * them to set link their account.
 */

const LoginAccountMessage = {
  "attachment": {
    "type": "template",
    "payload": {
      "template_type": "generic",
      "elements": [{
        "title": "Welcome to MileGo Chatbot",
        "image_url": "http://34.211.31.84/MileageTracking/mileageTrackingApp/mile_logo_1024.png",
        "subtitle": "You’ll need to log in to your MileGo account.",
        "buttons": [signInButton]
      }]
    }
  }
};

/**
 * Fun message for saying hello to a signed in user.
 *
 * @param {String} username System username of the currently logged in user
 * @returns {Object} Message payload
 */
const signInGreetingMessage = (username) => {
  return {
    text: `Welcome back, ${username}!`,
  };
};

/**
 * Message that informs the user they've been succesfully logged in.
 *
 * @param {String} username System username of the currently logged in user
 * @returns {Object} Message payload
 */
const signInSuccessMessage = {
  attachment: {
    type: 'template',
    payload: {
      template_type: 'button',
      text: `*Now you’ll have full access see your MileGo ride details*.

you can ask me like:-

"_How many rides I have taken in aug 2017_".

"_today ride details._"

"_personal ride in this week._"

"_business ride in this week._" `,
      buttons: [signOutButton],
    },
  },
};

/**
 * Message that informs the user they've been succesfully logged out.
 */
const signOutSuccessMessage = {
  attachment: {
    type: 'template',
    payload: {
      template_type: 'button',
      text: 'You’ve been logged out of your MileGo Account',
      buttons: [signInButton],
    },
  },
};

/**
 * Message that informs the user they are currently logged in.
 *
 * @param {String} username System username of the currently logged in user
 * @returns {Object} Message payload
 */
const loggedInMessage = {
  attachment: {
    type: 'template',
    payload: {
      template_type: 'button',
      text: `*You’re still logged in.*

you can ask me like:-

1. "_How many rides I have taken in aug 2017_."

2. "_today ride details_."

3."_personal ride in this week_."

4."_business ride in this week_."`,
      buttons: [signOutButton],
    },
  },
};

/**
 * Fun message for saying hello to a signed in user.
 */
const napMessage = {
  text: 'Oh hey there! I was just napping while you were gone 😴. But I’m awake now!',
};

/**
 * The Get Started button.
 */
const getStarted = {
  setting_type: 'call_to_actions',
  thread_state: 'new_thread',
  call_to_actions: [{
    payload: JSON.stringify({
      type: 'GET_STARTED',
    }),
  },],
};


const carTemplate = (ele, button) => {
  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "list",
        "top_element_style": "large",
        "elements": ele,
        "buttons": button
      }
    }
  }
}


const langPreference = {
  "attachment": {
    "type": "template",
    "payload": {
      "template_type": "generic",
      "elements": [{
        "title": "Please select language",
        "buttons": [{
          "type": "postback",
          "title": "English",
          "payload": "en"
        }, {
          "type": "postback",
          "title": "Traditional Chinese",
          "payload": "zh-TW"
        }]
      }]
    }
  }
}


module.exports = {
  LoginAccountMessage,
  signInGreetingMessage,
  signInSuccessMessage,
  signOutSuccessMessage,
  loggedInMessage,
  napMessage,
  getStarted,
  carTemplate,
  langPreference
};