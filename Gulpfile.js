var gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  fontMagician = require('postcss-font-magician'),
  pxtorem = require('postcss-pxtorem'),
  concat = require('gulp-concat'),
  ghPages = require('gulp-gh-pages'),
  sourcemaps = require('gulp-sourcemaps');

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
  gulp.watch('layouts/**/*.pug', ['build']);
  gulp.watch('layouts/**/*.jade', ['build']);
});

gulp.task('scripts', function() {
  return gulp.src([
    'bower_components/fancybox/source/jquery.fancybox.js',
    'bower_components/fancybox/source/helpers/jquery.fancybox-media.js',
    'bower_components/fastclick/lib/fastclick.js',
    'static/js/vendor/wicket.js',
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
    fontMagician({hosted: './static/fonts/'}),
    pxtorem({propWhiteList: []})
  ];
  return gulp.src('static/css/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({
    includePaths: [
      './bower_components/foundation-sites/scss/',
      './bower_components/'
    ]
  }))
  .on('error', sass.logError)
  .pipe(postcss(processors))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('build/css/'))
  .pipe(browserSync.stream());
});

gulp.task('build', function(){
  var ms = require('./metalsmith');
  ms('build').build(function(){
    browserSync.reload({stream:false});
  });
});

gulp.task('deploy', function() {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});

gulp.task('default', ['sass', 'scripts', 'serve']);
