let { dataSchema } = require('./data/')

function getSchemaDefinitions() {
  return `
    ${dataSchema.getSchemaDefinitions()}
  `
}

function getSchemaMutations() {
  return `
    ${dataSchema.getMutationDefinitions()}
  `
}

function getSchemaSubscriptions() {
  return ``
}

function getResolverFunctions() {
  return Object.assign({},
  )
}

function getMutationFunctions() {
  return Object.assign({},
  )
}

module.exports = {
  getSchemaDefinitions,
  getSchemaMutations,
  getSchemaSubscriptions,
  getResolverFunctions,
  getMutationFunctions,
}
