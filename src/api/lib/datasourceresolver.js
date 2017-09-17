let instance = null

class DatasourceResolver {

  static shared() {
    if (!instance) {
      instance = new DatasourceResolver()
    }
    return instance
  }

  constructor() {
    this.datasources = {}
  }

  register(name, datasource) {
    this.datasources[name] = datasource
  }

  get(name) {
    return this.datasources[name]
  }

}

module.exports = DatasourceResolver
