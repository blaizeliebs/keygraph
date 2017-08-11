let instance = null

class DatasourceResolver {

  datasources = {}

  static shared() {
    if (!instance) {
      instance = new DatasourceResolver()
    }
    return instance
  }

  register(name, datasource) {
    this.datasources[name] = datasource
  }

  get(name) {
    return this.datasources[name]
  }

}

export default DatasourceResolver
