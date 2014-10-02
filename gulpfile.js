
/*!
 * Module dependencies.
 */

var gulp = require('gulp');
var serve = require('gulp-serve');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('serve', serve(['public', 'src']));

gulp.task('default', [
  'serve'
]);
