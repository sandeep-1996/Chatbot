const db = require('../../dbConnection');
const Chat = require('./chat');

// mysql library for MySQL 

const user_query = (query, cb) => {
    let connection = db.connection();
    connection.query(query, cb)
    connection.end();
}

const createUser = function (objToSave, callback) {
    new User(objToSave).save(callback)
};

const findUser = function (criteria, projection, options, callback) {
    User.findOne(criteria, projection, options, callback)
}

const createChat = function (objToSave, callback) {
    new Chat(objToSave).save(callback)
}

const chat = function (criteria, projection, options, callback) {
    Chat.find(criteria, projection, options, callback)
}

const updateChat = function (criteria, dataToUpdate, options, callback) {
    Chat.findOneAndUpdate(criteria, dataToUpdate, options, callback)
}


module.exports = {user_query, updateChat, chat}