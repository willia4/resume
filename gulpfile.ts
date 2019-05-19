import * as gulp from 'gulp';
import * as sourcemaps from 'gulp-sourcemaps';
import * as sass from 'gulp-sass';
import * as uglify from 'gulp-uglify';


import * as browserify from 'browserify';
import * as globby from 'globby';
import * as del from 'del';

import through = require('through2');
import source =  require('vinyl-source-stream');
import buffer = require('vinyl-buffer');
const webserver = require('gulp-webserver');

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

gulp.task("build-html", () => {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task('build-html:watch', () => {
  return makeWatch(paths.pages, 'build-html')();
});

gulp.task('clean-html', () => {
  return del("dist/**/*.html");
})

gulp.task('build-styles', () => {
  return gulp.src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass.sync({
      outputStyle: "compressed"
    }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest("dist"));
});

gulp.task('build-styles:watch', () => {
  return makeWatch(paths.scss, 'build-styles')();
});

gulp.task('clean-styles', () => {
  return del(["dist/**/*.css", "dist/**/*.css.map"]);
})

gulp.task("build-scripts", () => {
  
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

gulp.task("build-scripts:watch", () => {
  return makeWatch(paths.script, 'build-scripts')();
});

gulp.task('clean-scripts', () => {
  return del(["dist/**/*.js", "dist/**/*.js.map"]);
})

gulp.task("clean", gulp.parallel(["clean-scripts", "clean-html", "clean-styles"]))
gulp.task("build", gulp.series("clean", gulp.parallel(["build-scripts", "build-html", "build-styles"])));

gulp.task("watch", gulp.series("clean", gulp.parallel(["build-scripts:watch", "build-html:watch", "build-styles:watch"])));

gulp.task("serve", gulp.parallel(["watch", () => { 
  return gulp
    .src("./dist")
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: false
    }));
}]))