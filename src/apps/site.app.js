import '../includes/env'
import express from 'express'
import exphbs from 'express-handlebars'
import path from 'path'
import chalk from 'chalk'

import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../../webpack.dev.config.js'

const isDeveloping = process.env.NODE_ENV !== 'production'
let appDir = path.dirname(require.main.filename)
let siteApp = express()

if (isDeveloping) {
  const compiler = webpack(config)
  const middleware = webpackMiddleware(compiler, {
    publicPath: '/public/js/',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  })

  siteApp.use(middleware)
  siteApp.use(webpackHotMiddleware(compiler))
}

let envOptions = {
  'API_PORT': process.env.PORT,
  'API_PROTOCOL': process.env.PROTOCOL,
  'API_DOMAIN': process.env.DOMAIN,
  'API_ENDPOINT': process.env.API_ENDPOINT,
  'API_WS_PORT': process.env.API_WS_PORT,
}

console.log(`\n\n ***   [${chalk.blue(`STARTING WEB SERVER`)}]   ***\n`)
siteApp.use('/public/', express.static(appDir+'/public/'))
siteApp.engine('handlebars', exphbs({
  defaultLayout: 'main',
  layoutsDir: appDir+'/views/web/layouts',
  partialsDir: appDir+'/views/web',
  helpers: {
    json: function (context) {
      return JSON.stringify(context, null, 2)
    },
  },
}))
siteApp.set('view engine', 'handlebars')
siteApp.set('views', appDir+'/views/web')
siteApp.get('/*', (req, res, next) => {
  res.render(
    'index',
    {
      react: '',
      data: {},
      env: envOptions,
    }
  )
})
console.log(`REACT APP ENDPOINT....[${chalk.blue(`INITIALISED`)}]`)
export default siteApp
