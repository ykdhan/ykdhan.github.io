var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    scss = require('gulp-sass')(require('node-sass'));

var src  = 'src',
    dist = 'docs';

var paths = {
    js : src + '/js/**/*.js',
    scss : src + '/scss/**/*.scss',
    assets: src + '/assets/**/*.*',
    html : src + '/**/*.html'
};

gulp.task('js:combine', function () {
    return gulp.src(paths.js)
        .pipe(concat('yk.js'))
        .pipe(uglify())
        .pipe(rename('yk.min.js'))
        .pipe(gulp.dest(dist+'/js'));
});

gulp.task('html:copy', function () {
    return gulp.src(paths.html)
        .pipe(gulp.dest(dist));
});

var scssOptions = {
    outputStyle : "compressed", // nested, expanded, compact, compressed
    indentType : "tab",
    indentWidth : 1,
    precision: 6,
    sourceComments: true
};

gulp.task('scss:compile', function () {
    return gulp
        .src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(scss(scssOptions).on('error', scss.logError))
        .pipe(sourcemaps.write())
        .pipe(rename('yk.min.css'))
        .pipe(gulp.dest(dist + '/css'));
});
 
gulp.task('watch', function () {
    gulp.watch(paths.js, gulp.series('js:combine'));
    gulp.watch(paths.scss, gulp.series('scss:compile'));
});

gulp.task('default', gulp.series('html:copy', 'js:combine', 'scss:compile', 'watch'));