let { graphiqlExpress } = require('graphql-server-express')

let graphiqlApp = graphiqlExpress({
  endpointURL: '/api',
  subscriptionsEndpoint: `ws://localhost:8005/api`,
})

module.exports = graphiqlApp
