import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const browserSync = require('browser-sync').create();

const paths = {
  statics: {
    html: 'htdocs/**/*.html',
    css: 'htdocs/css/*.css',
    js: 'htdocs/js/*.js'
  },
  scripts: {
    src: 'src/*.js',
    dest: 'dist/',
    dest_webroot: 'htdocs/js/',
  },
  serve: {
    baseDir: 'htdocs/'
  }
};

export function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe($.plumber({
        errorHandler: $.notify.onError('Error: <%= error.message %>')
    }))
    .pipe($.eslint('.eslintrc'))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
    .pipe($.babel({
      'presets': [
        ['@babel/env']
      ],
      'plugins': [
        'transform-object-assign'
      ],
      'babelrc': false
    }))
    .pipe($.size({ title: 'scripts' }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(gulp.dest(paths.scripts.dest_webroot))
    .pipe($.uglify({output: {comments: 'some'}}))
    .pipe($.rename('autotrack.min.js'))
    .pipe(gulp.dest(paths.scripts.dest));
}

export function serve(done) {
  browserSync.init({
    server: paths.serve.baseDir,
    port: 3501,
    browser: 'google chrome'
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
  gulp.watch(paths.statics.html, reload);
}

export { watchFiles as watch };

const dev = gulp.series(gulp.parallel(scripts), serve, watchFiles);
export default dev;
