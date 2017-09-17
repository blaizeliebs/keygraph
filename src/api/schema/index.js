let { makeExecutableSchema } = require('graphql-tools')
let DateQL = require('./scalars/date')
let TokenQL = require('./scalars/token')
let PasswordQL = require('./scalars/password')
let {
  getSchemaDefinitions,
  getSchemaMutations,
  getSchemaSubscriptions,
  getResolverFunctions,
  getMutationFunctions,
} = require('./entities/')

let Data = require('./entities/data/object')

const stringSchema = `
  ${getSchemaDefinitions()}
  type Query {
    data: Data
  }
  type Mutation {
    ${getSchemaMutations()}
  }
  type Subscriptions {
    ${getSchemaSubscriptions()}
  }
  schema {
    query: Query
    mutation: Mutation
  }
`

var resolverMap = Object.assign({}, getResolverFunctions(), {
  Date: DateQL,
  Token: TokenQL,
  Password: PasswordQL,
  Query: {
    data: (obj, args, ctx, info) => Data.create(Object.assign({}, args, { name: 'Hello World' })),
  },
  Mutation: Object.assign({}, getMutationFunctions()),
  // Subscription: {}
})

const schema = makeExecutableSchema({
  typeDefs: stringSchema,
  resolvers: resolverMap,
})

module.exports = { schema, stringSchema }
