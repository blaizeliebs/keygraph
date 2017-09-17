let apiApp = require('./api.app')
let graphiqlApp = require('./graphiql.app')
let corsApp = require('./cors.app')
let authApp = require('./auth.app')
let publicApp = require('./public.app')

module.exports = {
  apiApp,
  graphiqlApp,
  corsApp,
  authApp,
  publicApp,
}
