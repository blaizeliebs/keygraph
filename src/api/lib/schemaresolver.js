let _ = require('underscore')

let instance = null

class SchemaResolver {

  static shared() {
    if (!instance) {
      instance = new SchemaResolver()
    }
    return instance
  }

  constructor() {
    this.schemas = {}
  }

  register(name, schema) {
    this.schemas[name] = schema
  }

  get() {
    let shouldProcess = true
    let didFindDependency = false
    while (shouldProcess) {
      shouldProcess = false
      if (didFindDependency) {
        shouldProcess = true
      }
      didFindDependency = false
      _.each(this.schemas, (schema) => {
        let matches = schema.schemaDefinitions.match(/\[(.*?)List\]/)
        if (matches) {
          let defintionString = _.map(this.schemas[matches[1]].listDefinitions.split('\n'), (def) => {
            return '  '+def
          }).join('\n')
          schema.schemaDefinitions = schema.schemaDefinitions.replace(`[${matches[1]}List]`, defintionString)
          didFindDependency = true
        }
      })
    }
    let stringSchema = `
  ${this.getSchemaDefinitions()}
  type Query {
    data: Data
  }

  type Mutation {
    ${this.getSchemaMutations()}
  }

  schema {
    query: Query
    mutation: Mutation
  }
  `
    return stringSchema
  }

  getSchemaDefinitions() {
    let definitions = ''
    _.each(this.schemas, (schema) => {
      definitions += schema.schemaDefinitions
    })
    return definitions
  }

  getSchemaMutations() {
    let mutations = ''
    _.each(this.schemas, (schema) => {
      let defintionString = _.map(schema.mutationDefinitions.split('\n'), (def) => {
        return '  '+def
      }).join('\n')
      mutations += defintionString
    })
    return mutations
  }

}

module.exports = SchemaResolver
