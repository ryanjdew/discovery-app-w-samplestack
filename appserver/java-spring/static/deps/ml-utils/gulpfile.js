var gulp = require('gulp')
  , browserify = require('browserify')
  , jshint = require('gulp-jshint')
  , jsmin = require('gulp-jsmin')
  , rename = require('gulp-rename')
  , stylish = require('jshint-stylish')
  , source = require('vinyl-source-stream');

gulp.task('browserify', function() {
    return browserify('./src/index.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('ml-utils.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./'))
});

gulp.task('min', ['browserify'], function() {
  return gulp.src('./ml-utils.js')
    .pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./'));
});

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('dev', function() {
  console.log('Watching js files for changes');
  var watcher = gulp.watch('src/*.js', ['build']);
  watcher.on('change', function(event) {
    console.log('File '+event.path+' was '+event.type);
  });
});


gulp.task('build',['min']); // TODO update the version