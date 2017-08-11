import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { GraphQLError } from 'graphql/error'

let TokenQL = new GraphQLScalarType({
  name: 'Token',
  serialize: function serialize(value) {
    if (typeof value !== 'string') {
      throw new TypeError('Field error: value is not an instance of String')
    }
    return value
  },
  parseValue: function parseValue(value) {
    if (typeof value !== 'string') {
      throw new TypeError('Field error: value is not an instance of String')
    }
    return value
  },
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('Query error: Can only parse strings to token but got a: ' + ast.kind, [ast])
    }
    return ast.value
  },
})

export default TokenQL
