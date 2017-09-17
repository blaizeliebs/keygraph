let { GraphQLScalarType } = require('graphql')
let { Kind } = require('graphql/language')
let { GraphQLError } = require('graphql/error')

let PasswordQL = new GraphQLScalarType({
  name: 'Password',
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
      throw new GraphQLError('Query error: Can only parse strings to password but got a: ' + ast.kind, [ast])
    }
    return ast.value
  },
})

module.exports = PasswordQL
