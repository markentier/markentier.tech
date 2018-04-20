'use strict';

const SRC_HTML = 'public/**/*.html';
const DEST = 'public';

const gulp = require('gulp');
const inline = require('gulp-inline');
const postHTML = require('gulp-posthtml');
const htmltidy = require('gulp-htmltidy');
const replace = require('gulp-replace');
const removeEmptyLines = require('gulp-remove-empty-lines');
const whitespace = require('gulp-whitespace');

const inlineConfig = {
  base: DEST,
  disabledTypes: ['svg', 'js', 'img']
};

const htmltidyConfig = {
  doctype: 'html5',
  hideComments: true,
  wrap: 0,
  indent: 'auto',
  indentSpaces: 2,
  indentWithTabs: true,
  tabSize: 0,
  keepTabs: true,
  clean: true,
  joinStyles: true,
  uppercaseAttributes: 'preserve',
  priorityAttributes: 'id,class,name,href,src',
  tidyMark: false
};

const plugins = [
  require('./vendor/posthtml-img-autosize')({
    root: DEST,
    processEmptySize: true
  }),
  require('posthtml-alt-always')({})
];

gulp.task('default', ['html']);

gulp.task('html', () => {
  return gulp.src(SRC_HTML)
    .pipe(inline(inlineConfig))
    .pipe(postHTML(plugins))
    .pipe(htmltidy(htmltidyConfig))
    .pipe(replace(' type="text/css"', ''))
    .pipe(replace(' name="continue-reading"', ''))
    .pipe(removeEmptyLines({ removeComments: true }))
    .pipe(whitespace({ removeTrailing: true }))
    .pipe(gulp.dest(DEST));
});
