// gulpfile.babel.js
import gulp from 'gulp';
import source from 'vinyl-source-stream';
import fs from 'fs';
import runSequence from 'run-sequence';
import { spawn, exec } from 'child_process';

import plugin from 'gulp-load-plugins';
let plugins = plugin();
var api, web;

gulp.task('api-dev', (cb) => {
  runSequence('api-transpile', 'api-start', cb);
});

gulp.task('api-transpile', (cb) => {
  return exec('babel src/ -d build/ -s', [], cb);
});

gulp.task('api-start', () => {
  if (api) api.kill()
  api = spawn('node', ['./index.js'], {stdio: 'inherit'})
  api.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('watch', ['api-dev'], () => {
  gulp.watch(['./src/**/*.js', '!./src/site/*', '!./src/site/**'], ['api-dev']);
  gulp.watch('./src/*.js', ['api-dev']);
});

function swallowError (error) {
  console.log(error.toString());
  this.emit('end');
}
