import express from 'express'
import bodyParser from 'body-parser'
import JWTAuth from '../lib/jwtauth'

let jwt = new JWTAuth()

let authApp = express()
authApp.use(bodyParser.json())

authApp.post('/login', (request, response, next) => {

})

authApp.get('/logout', (request, response, next) => {

})

authApp.post('/register/:token', (request, response, next) => {

})

authApp.post('/reset/:token', (request, response, next) => {

})

authApp.get('/validate/:token', (request, response, next) => {
  jwt.validate(request.params.token)
  .then((data) => {
    // ?
  })
  .catch((err) => { // eslint-disable-line handle-callback-err
    response.setHeader('Content-Type', 'application/json')
    response.status(401)
    response.send(JSON.stringify({
      success: false,
      message: 'Invalid Token',
    }))
  })
})

export default authApp
