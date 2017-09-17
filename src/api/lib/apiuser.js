let Promise = require('bluebird')

class APIUser {

  constructor() {
    this.permissions = []
  }

  loadPermissions(info) {
    return Promise.resolve()
  }

  hasAnyPermission(reqPermissions) {
    for (let r = 0; r < reqPermissions.length; r++) {
      let req = reqPermissions[r]
      for (let p = 0; p < this.permissions.length; p++) {
        let cur = this.permissions[p]
        if (cur.permission === req.permission && (cur.id === null || cur.id === req.id)) {
          return true
        }
      }
    }
    return false
  }

}

module.exports = APIUser
