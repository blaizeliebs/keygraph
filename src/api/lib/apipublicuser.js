let Promise = require('bluebird')
let APIUser = require('./apiuser')
let _ = require('underscore')
let permissions = require('../schema/supporting/permissions')

class APIPublicUser extends APIUser {

  loadPermissions(token) {
    return new Promise((resolve, reject) => {
      // throw new Error(JSON.stringify({ message: "Testing Erros", code: 500 }));
      _.each(permissions, (permission, key) => {
        this.permissions.push({
          permission: permission,
          id: null,
        })
      })
      resolve(this)
    })
  }

}

module.exports = APIPublicUser
