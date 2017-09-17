let express = require('express')
let { graphqlExpress } = require('graphql-server-express')
let { SubscriptionManager } = require('graphql-subscriptions')
let { createServer } = require('http')
let { SubscriptionServer } = require('subscriptions-transport-ws')
let { schema } = require('../api/schema')
let pubsub = require('../api/publisher')
let APIPublicUser = require('../api/lib/apipublicuser')
let APIRegisteredUser = require('../api/lib/apiregistereduser')

const WS_PORT = 8005

// Create WebSocket listener server
const websocketServer = createServer((request, response) => {
  response.writeHead(404)
  response.end()
})

// Bind it to port and start listening
websocketServer.listen(WS_PORT, () => console.log(
  `Websocket Server is now running on http://localhost:${WS_PORT}`
))

const subscriptionManager = new SubscriptionManager({
  schema: schema,
  pubsub: pubsub,
  setupFunctions: {
    somethingChanged: (options, args) => ({
      myChangeHandlerThing: {
        filter: (data) => {
          console.log(data)
          console.log(options)
          console.log(args)
          // EURIKA!!! perform validations here!
          return true
          // return data.somethingChanged.id === args.var; // return true and not the object as long as you do not want to filter
        },
      },
    }),
  },
})

const server = new SubscriptionServer({ // eslint-disable-line no-unused-vars
  subscriptionManager: subscriptionManager,
},
{
  server: websocketServer,
  path: '/api',
})

let getApp = (user, request, response, next) => {
  let options = {
    schema: schema,
    context: { user: user },
    // rootValue: root,
    graphiql: true,
    pretty: true,
    debug: true,
    formatError: (error) => {
      console.log(error.stack)
      try {
        let errorData = JSON.parse(error.message)
        return {
          message: errorData.message,
          code: errorData.code,
        }
      } catch (e) {
        return {
          message: error.message,
          code: 500,
          details: error.stack,
        }
      }
    },
  }
  return graphqlExpress(request => options)(request, response, next)
}

let apiApp = express()
apiApp.use('/', (request, response, next) => {
  console.log('********* IN API *********')
  return new Promise((resolve, reject) => {
    if (request.headers.authorization) {
      // use a registered user here
      let user = new APIRegisteredUser()
      user.loadPermissions(request.headers.authorization)
      .then((user) => {
        return getApp(user, request, response, next)
      })
      .catch((err) => {
        console.log(err.stack)
      })
    } else {
      let user = new APIPublicUser()
      user.loadPermissions('replace with header token')
      .then((user) => {
        return getApp(user, request, response, next)
      })
      .catch((error) => {
        console.log(error.stack)
        try {
          let errorData = JSON.parse(error.message)
          response.set('Content-Type: application/json')
          response.send({
            data: {
              data: null,
            },
            errors: [{
              message: errorData.message,
              code: errorData.code,
            }],
          })
        } catch (e) {
          response.set('Content-Type: application/json')
          response.send({
            data: {
              data: null,
            },
            errors: [{
              message: error.message,
              code: 500,
              details: error.stack,
            }],
          })
        }
      })
    }

  })
})

module.exports = apiApp
