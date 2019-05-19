import * as gulp from 'gulp';
import * as sourcemaps from 'gulp-sourcemaps';
import * as sass from 'gulp-sass';
import * as uglify from 'gulp-uglify';
import * as browserify from 'browserify';
import * as globby from 'globby';

import through = require('through2');
import source =  require('vinyl-source-stream');
import buffer = require('vinyl-buffer');


var tsify = require("tsify");

var paths = {
    pages: ['src/*.html'],
    script: ['src/**/*.ts'],
    scss: ['src/**/*.scss']
};

function makeWatch(paths: string[], task: string[] | string): (() => any) {
  let tasks: string[] = [];
  if (Array.isArray(task)) {
    tasks = task;
  }
  else {
    tasks = [task];
  }

  return (() => {
    return gulp.watch(paths, { ignoreInitial: false}, gulp.series(...tasks));
  });
}

gulp.task("copy-html", () => {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task('copy-html:watch', () => {
  return makeWatch(paths.pages, 'copy-html')();
});

gulp.task('compile-styles', () => {
  return gulp.src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass.sync({
      outputStyle: "compressed"
    }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest("dist"));
});

gulp.task('compile-styles:watch', () => {
  return makeWatch(paths.scss, 'compile-styles')();
});

gulp.task("compile-scripts", () => {
  
  var bundledStream = through();
  bundledStream
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));

  globby(paths.script)
    .then((entries) => {
      var b = browserify({
        entries: entries,
        debug: true
      })
      .plugin(tsify, { project: '.' })
      
      b.bundle().pipe(bundledStream);
    })
  return bundledStream;
});

gulp.task("compile-scripts:watch", () => {
  return makeWatch(paths.script, 'compile-scripts')();
});

gulp.task("build", gulp.parallel(["compile-scripts", "copy-html", "compile-styles"]))
gulp.task("watch", gulp.parallel(["compile-scripts:watch", "copy-html:watch", "compile-styles:watch"]));
