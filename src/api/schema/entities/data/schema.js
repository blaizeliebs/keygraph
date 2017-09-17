const schemaDefinition = `

  scalar Date
  scalar Token
  scalar Password

  enum OrderDirectionEnum {
    ASC
    DESC
  }

  type Data {
    hello(name:String): String
  }
`

const listDefinition = ``

const mutationDefinitions = `
  placeholderMutation(in:String): String
`

const subscriptionDefinitions = `
  placeholderSubscription: String
`

const dataSchema = {
  getSchemaDefinitions: () => schemaDefinition,
  getListDefinitions: () => listDefinition,
  getMutationDefinitions: () => mutationDefinitions,
  getSubscriptionDefinitions: () => subscriptionDefinitions
}

module.exports = dataSchema
