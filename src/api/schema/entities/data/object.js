import APIData from '../apidata'

class DataQL extends APIData {

  static create(data) {
    return new DataQL(data)
  }

  _hello = null;

  constructor(data) {
    super(data)
    let { hello } = data

    this._hello = hello
  }

  hello({ name }) {
    return `Hello ${name}!`
  }

}

export default DataQL
