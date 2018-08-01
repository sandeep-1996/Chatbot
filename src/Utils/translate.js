'use strict';
const Translate = require('@google-cloud/translate');
const path = require('path')

//console.log('==============',path.join(process.cwd(), 'certs/MileGo-b72007a23ccb.json'))


/**
 * @param text
 * @param target
 * @callback  
 */

function translateText (text, target,callback) {
     
    // Your Google Cloud Platform project ID
     const projectId = 'milego-2d14e';
  
    // Instantiates a client
    const translate = Translate({
        projectId: projectId,
        keyFilename: path.join(process.cwd(), 'certs/MileGo-b72007a23ccb.json')
      });
  
    // The text to translate, e.g. "Hello, world!"
    // const text = 'Hello, world!';
  
    // The target language, e.g. "ru"
    // const target = 'ru';
  
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    translate.translate(text, target)
      .then((results) => {
        let translations = results[0];
        translations = Array.isArray(translations) ? translations : [translations];
  
        console.log('Translations:');
        translations.forEach((translation, i) => {
          callback(null,translation)
        });
      })
      .catch((err) => {
        console.error('ERROR:', err);
      });
    // [END translate_translate_text]
  }

  /**
   * 
   * @param {*} text 
   */

  function detectLanguage (text, callback) {
  
      // Your Google Cloud Platform project ID
      const projectId = 'milego-2d14e';
      
      
        // Instantiates a client
        const translate = Translate({
            projectId: projectId,
            keyFilename: path.join(process.cwd(), 'certs/MileGo-b72007a23ccb.json')
          });
  
    // The text for which to detect language, e.g. "Hello, world!"
    // const text = 'Hello, world!';
  
    // Detects the language. "text" can be a string for detecting the language of
    // a single piece of text, or an array of strings for detecting the languages
    // of multiple texts.
    translate.detect(text)
      .then((results) => {
        let detections = results[0];
        detections = Array.isArray(detections) ? detections : [detections];        
        detections.forEach((detection) => {
          //console.log(`${detection.input} => ${detection.language}`);
          callback(null,detection.language)
        });

       
      })
      .catch((err) => {
        console.error('ERROR:', err);
        callback(err)       
      });
    // [END translate_detect_language]
  }


  module.exports = {
    detectLanguage: detectLanguage,
    translateText: translateText
  }