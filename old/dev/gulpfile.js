var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    scss = require('gulp-sass')(require('sass')),
    html = require('gulp-minify-html'),
    sync = require('browser-sync').create();

var paths = {
  build: 'build',
  src: 'src',
  js: 'src/scripts/**/*.js',
  scss: 'src/styles/**/*.scss',
  html: 'src/**/*.html',
};

var scssOptions = { 
  /** 
   * outputStyle (Type : String , Default : nested) 
   * CSS의 컴파일 결과 코드스타일 지정 
   * Values : nested, expanded, compact, compressed 
   **/
  outputStyle : "expanded",
  /** 
   * indentType (>= v3.0.0 , Type : String , Default : space) 
   * 컴파일 된 CSS의 "들여쓰기" 의 타입 
   * Values : space , tab 
   **/ 
  indentType : "tab",
  /** 
   * indentWidth (>= v3.0.0, Type : Integer , Default : 2) 
   * 컴파일 된 CSS의 "들여쓰기" 의 갯수 
   **/
  indentWidth : 1, // outputStyle 이 nested, expanded 인 경우에 사용 
  /** 
   * precision (Type : Integer , Default : 5) 
   * 컴파일 된 CSS 의 소수점 자리수. 
   **/
  precision: 6, 
  /**
   * sourceComments (Type : Boolean , Default : false)
   * 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시.
   **/ 
  sourceComments: false 
};

gulp.task('watch', function () {
	gulp.watch(paths.js, ['uglify']);
  gulp.watch(paths.scss, ['compile']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('uglify', function () {
  return gulp.src(paths.js)
    .pipe(concat('yk.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.build))
    .pipe(sync.reload({stream:true}));
});

gulp.task('html', function () {
  return gulp.src(paths.html)
      .pipe(html())
      .pipe(gulp.dest(paths.build))
      .pipe(sync.reload({stream:true}));
});

gulp.task('compile', function () { 
  return gulp 
    .src(paths.scss)
    .pipe(concat('main.scss'))
    .pipe(sourcemaps.init())
    .pipe(scss(scssOptions).on('error', scss.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.build))
    .pipe(sync.reload({stream:true}));
});

gulp.task('ykdhan', ['uglify','compile','html'], function () {
    return console.log('--- ykdhan.com ---');
});

gulp.task('default', ['ykdhan','watch','uglify','compile','html']);