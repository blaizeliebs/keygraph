import Promise from 'bluebird'
import request from 'superagent'
import Config from '../config'
import EventEmitter from 'event-emitter-es6'

let instance = null

class Auth extends EventEmitter {

  _user = null;
  client = null;

  get user() {
    if (this._user) {
      return this._user
    }
    let user = localStorage.getItem('user')
    if (user) {
      return JSON.parse(user)
    }
    return null
  }

  set user(newUser) {
    this._user = newUser
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
    this.emit('statusChange', newUser)
  }

  get token() {
    if (this.user) {
      return this.user.auth.token
    }
  }

  static shared(client = false) {
    if (!instance) {
      instance = new Auth(client)
    } else if (client) {
      instance.client = client
    }
    return instance
  }

  constructor(client = false) {
    super()
    if (client) {
      this.client = client
    }
  }

  status() {
    if (this.user !== null) {
      return 'AUTHORIZED'
    }
    return 'UNKNOWN'
  }

  checkToken(token) {
    return new Promise((resolve, reject) => {
      request
      .get(Config.tokenValidateURL(token))
      .end((err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res.body)
      })
    })
  }

  register(token, password, holdEventTime = 0) {
    return new Promise((resolve, reject) => {
      request
      .post(Config.tokenRegisterURL(token))
      .send({ password: password })
      .end((err, res) => {
        if (err) {
          return reject(err)
        }
        resolve(res.body)
        this.user = null
        this.client.resetStore()
      })
    })
  }

  reset(token, password) {
    return new Promise((resolve, reject) => {
      request
      .post(Config.tokenResetURL(token))
      .send({ password: password })
      .end((err, res) => {
        if (err) {
          return reject(err)
        }
        resolve(res.body)
      })
    })
  }

  logOut() {
    return new Promise((resolve, reject) => {
      request
      .get(Config.getLogoutURL())
      .set({
        Authorization: `Bearer ${this.token}`,
      })
      .end((err, res) => {
        if (err) {
          reject(err)
        }
        this.user = null
        this.client.resetStore()
        resolve()
      })
    })
  }

  logIn(email, password, holdEventTime = 0) {
    return new Promise((resolve, reject) => {
      request
      .post(Config.getLoginURL())
      .send({ email: email, password: password })
      .end((err, res) => {
        if (err) {
          setTimeout(() => {
            this.user = null
          }, holdEventTime * 1000)
          return reject(err)
        }
        let responseData = res.body
        if (responseData.success) {
          setTimeout(() => {
            this.client.resetStore()
            this.user = responseData.user
          }, holdEventTime * 1000)
          resolve()
        } else {
          setTimeout(() => {
            this.client.resetStore()
            this.user = null
          }, holdEventTime * 1000)
          reject(new Error(responseData.error))
        }
      })
    })
  }

}

export default Auth
