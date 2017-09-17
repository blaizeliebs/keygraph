let APIData = require('./apidata')

class APIParent extends APIData {

  static create(data) {
    return new APIParent(data)
  }

  constructor(data) {
    super()
    let { _id } = data
    if (_id) {
      this._id = _id.toString()
    } else {
      this._id = 'not-applicable'
    }
  }

}

module.exports = APIParent
