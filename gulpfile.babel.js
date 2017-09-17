// gulpfile.babel.js
let gulp = require('gulp')
let source = require('vinyl-source-stream')
let fs = require('fs')
let runSequence = require('run-sequence')
let { spawn, exec } = require('child_process')

let plugin = require('gulp-load-plugins')
let plugins = plugin()
var api, web

gulp.task('api-dev', (cb) => {
  runSequence('api-start', cb)
})

gulp.task('api-start', () => {
  if (api) api.kill()
  api = spawn('node', ['./index.js'], {stdio: 'inherit'})
  api.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...')
    }
  });
});

gulp.task('watch', ['api-dev'], () => {
  gulp.watch(['./src/**/*.js', '!./src/site/*', '!./src/site/**'], ['api-dev'])
  gulp.watch('./src/*.js', ['api-dev'])
  gulp.watch('./.env', ['api-dev'])
});

function swallowError (error) {
  console.log(error.toString())
  this.emit('end')
}
