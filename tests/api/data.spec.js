const graphql = require('graphql');
const chai = require('chai');

const mockServer = require('graphql-tools').mockServer;
const schema = require('../../build/api/schema');
const stringSchema = schema.stringSchema;
const expect = chai.expect;
const assert = chai.assert;

describe('API Data Schema', () => {

  const dataType = schema.default._typeMap.Data;

  it('Should have an hello field of type String', () => {
    expect(dataType.getFields()).to.have.property('hello');
    expect(dataType.getFields().hello.type).to.deep.equals(new graphql.GraphQLNonNull(graphql.GraphQLString));
  });

});

describe('API Data Query', () => {

  const server = mockServer(stringSchema, {
    Int: () => 6,
    Float: () => 22.1,
    String: () => 'TestString',
  });
  const query = `
    query TestData {
      data(userToken: "ABCDEF") {
        hello
      }
    }
  `;

  it('Should have hello field equal to "TestString"', () => {
    return server.query(query)
      .then((response) => {
        expect(response.data.data).to.have.key('hello');
        expect(response.data.data.hello).to.equal('TestString');
      })
      .catch((err) => {
        assert.ifError(err);
      })
  });

});
