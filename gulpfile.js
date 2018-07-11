'use strict';

/* dependencies */
var gulp          = require('gulp');
var browserSync   = require('browser-sync').create();
var rename        = require('gulp-rename');
var plumber       = require('gulp-plumber');
var jade          = require('gulp-jade');
var affected      = require('gulp-jade-find-affected');
var sass          = require('gulp-sass');
var autoprefix    = require('gulp-autoprefixer');
var cssnano       = require('gulp-cssnano');
var stripDebug    = require('gulp-strip-debug');
var jshint        = require('gulp-jshint');
var babel         = require('gulp-babel');
var concat        = require('gulp-concat');
var imagemin      = require('gulp-imagemin');
var uglify        = require('gulp-uglify');

/* routes */
var _project_dist = './app/';

var _jade_src     = './source/pages/**/!(_)*.jade';
var _jade_dest    = './app';
var _jade_watch   = './source/**/**/*.jade';

var _scss_src     = './source/pages/*.scss';
var _scss_dest    = './app/css/';
var _scss_watch   = './source/**/*.scss';

var _js_src       = './source/**/*.js';
var _js_dest      = './app/js/';

var _img_src      = './source/**/*.{jpg,jpeg,png,gif}';
var _img_dest     = './app/images/';

var _font_src     = './source/fonts/**/*.{eot,eot?#iefix,woff,woff2,ttf,svg,otf}';
var _font_dest    = './app/fonts/';

/**
 * Task: [jade]
 * JADE to HTML
 */
gulp.task('jade', function() {
  gulp.src(_jade_src)
    .pipe(plumber({
      errorHandler: function(err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(affected())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(_jade_dest))
    .pipe(browserSync.stream());
});

/**
 * Task: [SASS]
 * SCSS to CSS
 */
gulp.task('sass', function() {
  gulp.src(_scss_src)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefix(['> 1%', 'last 5 version']))
    .pipe(cssnano({
      core: false,
    }))
    // .pipe(concat('style.css'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(_scss_dest))
    .pipe(browserSync.stream());
});

/**
 * Task: [js]
 * detect errors and potential problems in code.
 */
gulp.task('js', function() {
  gulp.src(_js_src)
    .pipe(plumber({
      errorHandler: function(err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(stripDebug())
    .pipe(concat('app.min.js'))
    .pipe(babel({
       presets: ['es2015', 'stage-3'],
       plugins: ['transform-runtime']
    }))
    .pipe(uglify())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest(_js_dest))
    .pipe(browserSync.reload({
       stream: true
    }));
});

/**
 * Task: [image]
 * minify images
 */
gulp.task('image', function() {
  gulp.src(_img_src)
    .pipe(imagemin())
    .pipe(rename({dirname:''})) // using gulp-rename to get rid of the directory name and throw all images from all folder into one
    .pipe(gulp.dest(_img_dest));
});

/**
 * Task [font]
 * copy fonts
 */
gulp.task('fonts', function() {
    return gulp.src(_font_src)
            .pipe(gulp.dest(_font_dest));
});

/**
 * Task: [watch]
 */
gulp.task('watch', function() {
    gulp.watch(_jade_watch , ['jade']);
    gulp.watch(_scss_watch , ['sass']);
    gulp.watch(_js_src     , ['js']);
});

/**
 * Task: [browser-sync]
 */
gulp.task('browser-sync', function() {
    browserSync.init({
      ghostMode: false,
      notify: false,
      reloadDelay: 500,
       server: {
          baseDir: './app'
       }
    });
});

// Combine tasks
gulp.task('default', ['jade', 'sass', 'js', 'image', 'fonts', 'watch', 'browser-sync']);
