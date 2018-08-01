/**
 * User Model
 * @class User
 */
module.exports = class User {
  constructor(username, password, messengerId, authCode) {
    this.username = username;
    this.password = password;
    this.messengerId = messengerId;
    this.authCode = authCode;
  }
}


