let path = require('path')
let env = require('node-env-file')

if (!process.env.HAS_LOADED_ENV) {
  let envFile = path.join(__dirname, '../', '../', '/.env')
  env(envFile)
}
