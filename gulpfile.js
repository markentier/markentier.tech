/* eslint-disable space-before-function-paren */
'use strict';

const SRC_HTML = 'public/**/*.html';
const SRC_CSS = 'public/**/*.css';
const SRC_JS = 'public/**/*.js';
const SRC_JSON = 'public/**/*.json';
const DEST = 'public';

const gulp = require('gulp');
const postCSS = require("gulp-postcss");
const postHTML = require('gulp-posthtml');
const htmlmin = require('gulp-htmlmin');
const htmltidy = require('gulp-htmltidy');
const minify = require('gulp-minify');
const jsonminify = require('gulp-jsonminify');

const postHtmlPlugins = [
  require("posthtml-img-autosize")({ root: DEST, processEmptySize: true }),
  require("posthtml-alt-always")({}),
  require("posthtml-align-style")({}),
  require("posthtml-avif-webp")({ root: DEST })
];

const postHtmlPluginsSecondRun = [
  require("htmlnano")({
    mergeStyles: true,
    // breaks my beautiful header image :'-(
    minifySvg: false,
    // does not work as expected
    // minifyUrls: process.env.IMG_BASE_URL,
  }),
  require("posthtml-externalize-styles")({ root: DEST }),
];

const htmltidyConfig = {
  doctype: 'html5',
  hideComments: true,
  wrap: 0,
  indent: true,
  indentSpaces: 2,
  indentWithTabs: true,
  tabSize: 2,
  keepTabs: true,
  clean: true,
  joinStyles: true,
  uppercaseAttributes: 'preserve',
  priorityAttributes: 'id,class,name,href,src',
  tidyMark: false
};

const htmlminOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  conservativeCollapse: false,
  minifyCSS: true,
  minifyJS: true,
  removeComments: true,
  removeStyleLinkTypeAttributes: true
};

const minifyConfig = {
  ext: {
    src: '-debug.js',
    min: '.js'
  }
}

function html() {
  return gulp.src(SRC_HTML)
    .pipe(postHTML(postHtmlPlugins))
    .pipe(htmltidy(htmltidyConfig))
    .pipe(htmlmin(htmlminOptions))
    .pipe(postHTML(postHtmlPluginsSecondRun))
    .pipe(gulp.dest(DEST));
};

function javascript() {
  return gulp.src(SRC_JS)
    .pipe(minify(minifyConfig))
    .pipe(gulp.dest(DEST));
};

function json() {
  return gulp.src(SRC_JSON)
    .pipe(jsonminify())
    .pipe(gulp.dest(DEST));
};

function css() {
  return gulp
    .src(SRC_CSS)
    .pipe(
      postCSS([
        require("cssnano")({ preset: "default" }), // advanced
      ])
    )
    .pipe(gulp.dest(DEST));
}

const build = gulp.series(gulp.parallel(html, javascript, json), css);

exports.html = html;
exports.default = build;
