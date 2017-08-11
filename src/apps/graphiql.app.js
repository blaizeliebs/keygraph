import { graphiqlExpress } from 'graphql-server-express'

let graphiqlApp = graphiqlExpress({
  endpointURL: '/api',
  subscriptionsEndpoint: `ws://localhost:8005/api`,
})

export default graphiqlApp
