var gulp          = require('gulp');
var browserSync   = require('browser-sync').create();
var sass          = require('gulp-sass');
var postcss       = require('gulp-postcss');
var autoprefixer  = require('autoprefixer');

// Static Server + watching scss/html files
gulp.task('serve', function() {
  browserSync.init({
    open: false,
    server: 'build'
  });
  gulp.watch('static/**/*.scss', ['sass']);
  gulp.watch('static/img/**/*.{gif, jpg, jpeg, .png}', ['build']);
  gulp.watch('documents/**/*.md', ['build']);
  gulp.watch('layouts/**/*.jade', ['build']);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  var processors = [
    autoprefixer({browsers: ['last 2 version']}),
  ];
  return gulp.src('static/css/*.scss')
    .pipe(sass({
      includePaths: ['./bower_components/foundation-sites/scss/']
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
