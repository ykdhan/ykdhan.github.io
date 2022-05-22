import gulp from 'gulp'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import rename from 'gulp-rename'
import sourcemaps from 'gulp-sourcemaps'
import gulpSass from "gulp-sass"
import nodeSass from "node-sass"
import browserSync from 'browser-sync'

const scss = gulpSass(nodeSass)
const sync = browserSync.create()

// var gulp = require('gulp'),
//     concat = require('gulp-concat'),
//     uglify = require('gulp-uglify'),
//     rename = require('gulp-rename'),
//     sourcemaps = require('gulp-sourcemaps'),
//     scss = require('gulp-sass')(require('node-sass')),
//     sync = require('browser-sync').create();

var src  = 'src',
    build = 'docs';

var srcPath = {
    script : src + '/js/**/*.js',
    style : src + '/scss/**/*.scss',
    assets: src + '/assets/**/*.*',
    html : src + '/**/*.html'
};
var buildPath = {
    script : build + '/js/',
    style : build + '/css/',
    assets: build + '/assets/',
    html : build
};

gulp.task('js', function () {
    return gulp.src(srcPath.script)
        // .pipe(concat('yk.js'))
        .pipe(uglify())
        .pipe(rename('yk.min.js'))
        .pipe(gulp.dest(buildPath.script))
        .pipe(sync.stream());
});

gulp.task('html', function () {
    return gulp.src(srcPath.html)
        .pipe(gulp.dest(buildPath.html))
        .pipe(sync.stream());
});

var scssOptions = {
    outputStyle : "compressed", // nested, expanded, compact, compressed
    indentType : "tab",
    indentWidth : 1,
    precision: 6,
    sourceComments: true
};

gulp.task('scss', function () {
    return gulp
        .src(srcPath.style)
        .pipe(sourcemaps.init())
        .pipe(scss(scssOptions).on('error', scss.logError))
        .pipe(sourcemaps.write())
        .pipe(rename('yk.min.css'))
        .pipe(gulp.dest(buildPath.style))
        .pipe(sync.stream());
});
 
gulp.task('watch', function () {
    gulp.watch(srcPath.script, gulp.series('js'));
    gulp.watch(srcPath.style, gulp.series('scss'));
    gulp.watch(srcPath.html, gulp.series('html'));
});

gulp.task('server', function() {
    sync.init({
        server: {
            baseDir: build
        }
    });
});

gulp.task('default', gulp.series('html', 'js', 'scss', gulp.parallel('watch', 'server')));