const URL_CONSTANT = {
    BASE_PATH: 'http://accounts.milegoapp.com/webservices11',
    HOST: process.env.NODE_ENV !== 'development' ? 'https://stagingsdei.com:4105/' : 'https://2d7b7c61.ngrok.io',
    REDIS:  {
        URI: '127.0.0.1',
        port: 6379
    }
};

module.exports = {
    URL_CONSTANT
};
