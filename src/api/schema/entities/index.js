import dataSchema from './data/schema'

function getSchemaDefinitions() {
  return `
    ${dataSchema.getSchemaDefinitions()}
  `
};

function getSchemaMutations() {
  return `
    ${dataSchema.getMutationDefinitions()}
  `
};

function getSchemaSubscriptions() {
  return `
    ${dataSchema.getSubscriptionDefinitions()}
  `
};

function getResolverFunctions() {
  return {}
}

function getMutationFunctions() {
  return {}
}

export {
  getSchemaDefinitions,
  getSchemaMutations,
  getSchemaSubscriptions,
  getResolverFunctions,
  getMutationFunctions,
}
