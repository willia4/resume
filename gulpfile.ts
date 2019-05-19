import * as gulp from 'gulp';
import * as sourcemaps from 'gulp-sourcemaps';
import * as sass from 'gulp-sass';
import * as uglify from 'gulp-uglify';
import * as util from 'gulp-util';
import * as tap from 'gulp-tap';

import * as browserify from 'browserify';
import * as globby from 'globby';
import * as yaml from 'js-yaml';

import * as fs from 'fs';
import * as del from 'del';

import through = require('through2');
import source =  require('vinyl-source-stream');
import buffer = require('vinyl-buffer');

const webserver = require('gulp-webserver');

var tsify = require("tsify");

var paths = {
    pages: ['src/*.html'],
    script: ['src/**/*.ts'],
    scss: ['src/**/*.scss'],
    assets: ['./assets/*.pdf', './assets/*.txt'],
    yaml: [ 'src/**/*.yaml']
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

function clean(...globs: string[]): Promise<any> {
  let lastPromise: Promise<any> = Promise.resolve();
  
  globs.forEach((g) => {
    lastPromise = lastPromise
      .then(() => del(g))
      .catch((err) => console.log(err));
  })

  return lastPromise;
}

gulp.task("build-html", () => {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task('build-html:watch', () => {
  return makeWatch(paths.pages, 'build-html')();
});

gulp.task('clean-html', () => {
  return clean("dist/**/*.html");
})

gulp.task("build-assets", () => {
  return gulp.src(paths.assets)
      .pipe(gulp.dest("dist"));
});

gulp.task('build-assets:watch', () => {
  return makeWatch(paths.assets, 'build-assets')();
});

gulp.task('clean-assets', () => {
  return clean("dist/**/*.pdf", "dist/**/*.txt");
})



gulp.task("build-yaml", () => {
  return gulp.src(paths.yaml)
      .pipe(tap((file) => {
          yaml.load(file.contents.toString());
        })
      )
      .pipe(gulp.dest("dist"));
});

gulp.task('build-yaml:watch', () => {
  return makeWatch(paths.yaml, 'build-yaml')();
});

gulp.task('clean-yaml', () => {
  return clean("dist/**/*.yaml",);
})

gulp.task('build-styles', () => {
  return gulp.src(paths.scss)
    .on('error', util.log)
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
  return clean("dist/**/*.css", "dist/**/*.css.map");
})

gulp.task("build-scripts", () => {
  
  var bundledStream = through();
  bundledStream
    .on('error', util.log)
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
  return clean("dist/**/*.js", "dist/**/*.js.map");
})

gulp.task("clean", gulp.parallel(["clean-scripts", "clean-html", "clean-styles", "clean-assets"]))
gulp.task("build", gulp.series("clean", gulp.parallel(["build-scripts", "build-html", "build-styles", "build-assets"])));

gulp.task("watch", gulp.series("clean", gulp.parallel(["build-scripts:watch", "build-html:watch", "build-styles:watch", "build-assets:watch", "build-yaml:watch"])));

gulp.task("serve", 
  gulp.series(
    (taskDone) => {
      fs.exists('./dist', (exists) => {
        if (exists) { return taskDone(); }

        fs.mkdir("./dist", (err) => {
          return taskDone(err);
        })
      }); 
    },   
    gulp.parallel(
      "watch", 
      () => { 
        return gulp
          .src("./dist")
          .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: false
          }));
      }
    )
  )
);