import { makeExecutableSchema } from 'graphql-tools'
import DateQL from './scalars/date'
import TokenQL from './scalars/token'
import PasswordQL from './scalars/password'
import {
  getSchemaDefinitions,
  getSchemaMutations,
  getSchemaSubscriptions,
  getResolverFunctions,
  getMutationFunctions,
} from './entities/'

import Data from './entities/data/'

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

var resolverMap = {
  ...getResolverFunctions(),
  Date: DateQL,
  Token: TokenQL,
  Password: PasswordQL,
  Query: {
    data: (obj, args, ctx, info) => Data.create({ ...args, name: 'Hello World' }),
  },
  Mutation: {
    ...getMutationFunctions(),
  },
  // Subscription: {}
}

const schema = makeExecutableSchema({
  typeDefs: stringSchema,
  resolvers: resolverMap,
})

export { schema as default, stringSchema }
