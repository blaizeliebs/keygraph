let _ = require('underscore')
let APIObject = require('../../../lib/apiobject')

class Data extends APIObject {

  static create(data) {
    return new Data(data)
  }

  constructor(data) {
    super(data)
    let { hello } = data

    this._hello = hello
  }

  hello({ name }, ctx, info) {
    return this._hello
  }

}

module.exports = Data
