import jwt from 'json-web-token'
import Promise from 'bluebird'
import SkError from './skerror'
import bcrypt from 'bcryptjs'

class JWTAuthError extends SkError {}

class JWTAuth {

  constructor() {
    if (!process.env.JWT_KEY) {
      throw new Error('Please set a JWT_KEY field in your .env file')
    }
  }

  getToken(header) {
    var matches = header.match(/^Bearer\s(.*)$/)
    if (matches) {
      return matches[1]
    }
    throw new JWTAuthError('Unable to parse auth token', 403)
  }

  create(expiry = 30, type = 'api', id = 'unknown') {
    return new Promise((resolve, reject) => {
      var expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)
      var timestamp = Math.floor(Date.now() / 1000)
      var key = Buffer.from(this.randomString(40)).toString('base64')
      var expiry = Math.floor(expiryDate.getTime() / 1000)

      var payload = {
        'iat': timestamp,
        'jti': key,
        'iss': 'oscars-arc',
        'aud': 'api-users',
        'exp': expiry,
        'typ': '/online/transactionstatus/v2',
        'data': {
          'type': type,
          'id': id,
        },
      }
      var secret = process.env.JWT_KEY
      // encode
      jwt.encode(secret, payload, (err, token) => {
        if (err) {
          return reject(err)
        }
        resolve(token)
      })
    })
  }

  validate(token) {
    return new Promise((resolve, reject) => {
      var timestamp = Math.floor(Date.now() / 1000)
      this.decode(token)
      .then(data => {
        if (data.exp && data.exp < timestamp) {
          throw new JWTAuthError('Expired Token', 402)
        } else {
          resolve(data)
        }
      })
      .catch(reject)
    })
  }

  decode(token) {
    return new Promise((resolve, reject) => {
      var secret = process.env.JWT_KEY
      jwt.decode(secret, token, (err, decode) => {
        if (err) {
          return reject(err)
        } else {
          resolve(decode)
        }
      })
    })
  }

  randomString(size) {
    var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    var randomString = ''
    for (var x = 0; x < size; x++) {
      var charIndex = Math.floor(Math.random() * characters.length)
      randomString += characters.substring(charIndex, charIndex + 1)
    }
    return randomString
  }

  generatePasswordHash(password) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return reject(err)
        }
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            return reject(err)
          }
          resolve(hash)
        })
      })
    })
  }

  comparePasswordHash(password, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, isPasswordMatch) => {
        if (err) {
          return reject(err)
        }
        resolve(isPasswordMatch)
      })
    })
  }

}

export { JWTAuth as default, JWTAuthError }
