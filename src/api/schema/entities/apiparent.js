import APIData from './apidata'

class APIParent extends APIData {

  _id = null;

  static create(data) {
    return new APIParent(data)
  }

  constructor(data) {
    super()
    let { _id } = data
    this._id = _id.toString()
  }

}

export default APIParent
