import path from 'path'
import express from 'express'
let uploadsApp = express.static(path.join(__dirname, '../../', 'uploads'))

export default uploadsApp
