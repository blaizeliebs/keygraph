require('./includes/env')
let express = require('express')
let chalk = require('chalk')
let bodyParser = require('body-parser')
let { apiApp, graphiqlApp, corsApp, publicApp } = require('./apps/')
let path = require('path')
let keystone = require('keystone')
let handlebars = require('express-handlebars')
let Helpers = require('./cms/templates/views/helpers')

console.log(`\n\n ***   [${chalk.blue(`STARTING WEB SERVER`)}]   ***\n`)
let appDir = path.dirname(require.main.filename)
let app = express()

app.use(corsApp)
app.use(publicApp)
app.use('/api', bodyParser.json(), apiApp)
app.use('/graphql', graphiqlApp)

let helpers = Helpers()
keystone.init({
  'name': 'KeyGraph',
  'brand': 'KeyGraph',
  'port': process.env.PORT,
  'less': 'public',
  'static': ['public', 'uploads'],
  'favicon': 'public/favicon.ico',
  'views': 'templates/views',
  'view engine': '.hbs',
  'module root': `${appDir}/src/cms/`,

  'mongo': `mongodb://localhost/${process.env.MONGO_DATABASE}`,

  'custom engine': handlebars.create({
    layoutsDir: './src/cms/templates/views/layouts',
    partialsDir: './src/cms/templates/views/partials',
    defaultLayout: 'default',
    helpers: helpers,
    extname: '.hbs',
  }).engine,

  'auto update': true,
  'session': true,
  'auth': true,
  'user model': 'Admin',
})

// Load your project's Models

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
  _: require('lodash'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable,
})

// Load your project's Routes

// Configure the navigation bar in Keystone's Admin UI

keystone.set('google api key', 'AIzaSyCarm2hpfRKWfpELwBKSq950KGbI_WkKBA')
keystone.set('google server api key', 'AIzaSyAlwAQDjEUDvKK7pUqWkVseYYL_LfooLIg')
keystone.set('default region', 'za')

keystone.set('cloudinary config', {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

keystone.set('cloudinary prefix', 'oscars-arc')
keystone.set('cloudinary folders', true)
keystone.set('cloudinary secure', true)

// Start Keystone to connect to your database and initialise the web server

keystone.app = app

keystone.import('models')
// keystone.set('updates', require('updates/*'));
keystone.set('routes', require('./cms/routes'))
keystone.set('nav', {
  admins: 'admins',
})

keystone.start({
  onHttpServerCreated: function () {
    require('keystone/server/createApp')(keystone)
  },
})

process.on('SIGINT', function () {
  console.log(`\n\n *** [${chalk.red(`SIGINT SHUTDOWN PROCESS`)}] ***\n`)
  console.log(`HTTP SERVER.............[${chalk.red(`SHUT DOWN`)}]`)
  process.exit()
})
