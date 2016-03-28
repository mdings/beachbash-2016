var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var fontMagician = require('postcss-font-magician');
var concat = require('gulp-concat');

// Static Server + watching scss/html files
gulp.task('serve', function() {
  browserSync.init({
    open: false,
    server: 'build'
  });
  gulp.watch('static/**/*.scss', ['sass']);
  gulp.watch('static/**/*.js', ['scripts']);
  gulp.watch('static/img/**/*.{gif, jpg, jpeg, .png}', ['build']);
  gulp.watch('documents/**/*.md', ['build']);
  gulp.watch('layouts/**/*.jade', ['build']);
});

gulp.task('scripts', function() {
  return gulp.src([
    'bower_components/fancybox/source/jquery.fancybox.js',
    'bower_components/fancybox/source/helpers/jquery.fancybox-media.js',
    'static/js/main.js'
  ])
  .pipe(concat('main.js'))
  .pipe(gulp.dest('build/js/'))
  .pipe(browserSync.stream());
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  var processors = [
    autoprefixer({browsers: ['last 2 version']}),
    fontMagician({hosted: './static/fonts/'})
  ];
  return gulp.src('static/css/*.scss')
  .pipe(sass({
    includePaths: ['./bower_components/foundation-sites/scss/', './bower_components/']
  }))
  .on('error', sass.logError)
  .pipe(postcss(processors))
  .pipe(gulp.dest('build/css/'))
  .pipe(browserSync.stream());
});

gulp.task('build', function(){
  var ms = require('./metalsmith');
  ms('build').build(function(){
    browserSync.reload({stream:false});
  });
});

gulp.task('default', ['serve']);
