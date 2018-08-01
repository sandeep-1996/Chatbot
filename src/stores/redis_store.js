// const APP_CONSTANT = require('../Utils/AppConstant')


// const redis = require('redis');
// const redisClient = redis.createClient();
// redisClient.on('error', function (err) {
//     console.log('Error ' + err);
// });

// redisClient.on('connect', function () {
//     console.log('Redis is ready');
// });

// exports.setRedis = function (key, value, callback) {
//     redisClient.set(key, value, function (err, data) {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else {
//             redisClient.expire(key, 86400)
//             callback(null, data)
//         }
//     });
// };

// exports.unsetRedis = function (key, cb) {
//     redisClient.del(key, function (err, response) {
//         if (response == 1) {
//             console.log("Deleted Successfully!")
//             cb()
//         } else {
//             console.log("Cannot delete")
//             cb()
//         }
//     })
// }


// exports.setRedisObject = function (key, value, callback) {
//     redisClient.hmset(key, value, function (err, data) {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else {
//             callback(null, data)
//         }
//     });
// };


// exports.getRedis = function (key, callback) {
//     redisClient.get(key, function (err, data) {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else {
//             callback(null, data)
//         }
//     });
// };