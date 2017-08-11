import Promise from 'bluebird'
import APIUser from './apiuser'
import * as _ from 'underscore'
import permissions from '../schema/supporting/permissions'

class APIRegisteredUser extends APIUser {

  permissions = []

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

export default APIRegisteredUser
