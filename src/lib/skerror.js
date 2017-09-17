let ExtendableError = require('./extendableerror')

class SkError extends ExtendableError {

  constructor(m, code = 500) {
    super(m)
    this.httpCode = code
  }

}

module.exports = SkError
