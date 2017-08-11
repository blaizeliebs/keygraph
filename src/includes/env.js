import path from 'path'
import env from 'node-env-file'

if (!process.env.HAS_LOADED_ENV) {
  let envFile = path.join(__dirname, '../', '../', '/.env')
  env(envFile)
}
