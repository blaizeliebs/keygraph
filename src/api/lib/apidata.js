let { MongoClient, ObjectId } = require('mongodb')
let Promise = require('bluebird')

const connectionString = `mongodb://${process.env.MONGO_SERVER}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`

class APIData {

  static objectId(_id) {
    return ObjectId(_id)
  }

  static getConnection() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(connectionString, {
        poolSize: process.env.MONGO_POOL_SIZE || 10,
        promiseLibrary: Promise,
      }, (err, db) => {
        if (err) {
          return reject(err)
        }
        resolve(db)
      })
    })
  }

}

module.exports = APIData
