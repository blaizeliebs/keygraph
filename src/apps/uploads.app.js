let path = require('path')
let express = require('express')
let uploadsApp = express.static(path.join(__dirname, '../../', 'uploads'))

module.exports = uploadsApp
