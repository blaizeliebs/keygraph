import ExtendableError from './extendableerror'

class SkError extends ExtendableError {

  httpCode = 0;

  constructor(m, code = 500) {
    super(m)
    this.httpCode = code
  }

}

export default SkError
