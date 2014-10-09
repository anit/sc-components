'use strict';

/*!
 * Module dependencies.
 */

var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var footer = require('gulp-footer');
var minimist = require('minimist');
var bump = require('gulp-bump');
var gulp = require('gulp');

var pkg;
var dist;
var banner = [
  '/**',
  ' * <%= pkg.name %>',
  ' * <%= pkg.description %>',
  ' * @version <%= pkg.version %>',
  ' * Copyright(c) SafetyChanger',
  ' * @license <%= pkg.license %>',
  ' */',
  '', ''
].join('\n');

/**
 * Option parsing and defaults
 *
 * $ gulp --release minor # major, patch is default
 */

var knownOptions = {
  string: 'release',
  default: { release: 'patch' }
};
var options = minimist(process.argv.slice(2), knownOptions);
if (!~['patch', 'minor', 'major'].indexOf(options.release)) {
  options.release = 'patch';
}

/**
 * Bump
 */

gulp.task('bump', function () {
  return gulp.src('./bower.json')
    .pipe(bump({ type: options.release }))
    .pipe(gulp.dest('./'));
});

/**
 * Concat all
 */

gulp.task('concat', ['bump'], function () {
  pkg = require('./bower.json');
  dist = './dist';
  return gulp.src(['./src/*.js', './src/*/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat(pkg.name +'.js'))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist + '/'));
});

/**
 * Minify
 */

gulp.task('minify', ['concat'], function () {
  return gulp.src(dist + '/'+ pkg.name +'.js')
    .pipe(uglify({ mangle: false }))
    .pipe(rename(pkg.name +'.min.js'))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(footer('//# sourceMappingURL='+ pkg.name +'.js.map'))
    .pipe(gulp.dest(dist + '/'));
});

/**
 * Default
 */

gulp.task('default', [
  'bump',
  'concat',
  'minify'
]);
