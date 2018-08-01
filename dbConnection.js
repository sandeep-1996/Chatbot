var mysql = require('mysql');

module.exports.connection = function () {

    if(process.env.NODE_ENV === 'dev'){
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'welcome',
            database: 'milego_demo'
        });
    } else {
        var connection = mysql.createConnection({
            host: 'milegoapp.com',
            user: 'milego_bot',
            password: 'CBx]7ajcfhjO',
            database: 'milego_rides'
        });
    }

   


   return connection;
}