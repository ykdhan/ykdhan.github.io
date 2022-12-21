import pkg from './package.json';
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import webpackStream from 'webpack-stream';
import path from 'path';

const _env = {
	isProduction: false,
};
const $sass = gulpSass(dartSass);

const $ = plugins({
	pattern: ['*', '!postcss', '!sass'],
	scope: 'devDependencies',
});

const banner = [
	'/**',
	' * @project        <%= pkg.name %>',
	' * @author         <%= pkg.author %>',
	' * @build          ' + $.moment().format('llll'),
	' * @copyright      Copyright (c) ' + $.moment().format('YYYY') + ', <%= pkg.copyright %>',
	' *',
	' */',
	'',
].join('\n');

const onError = (err) => {
	console.log(err);
};

const basePath = {
	src: './src',
	dest: './docs',
	build: './build',
	node: './node_modules',
};

const src = {
	html: `/**/!(_)*.html`,
	ejs: `/**/!(_)*.ejs`,
	images: `/assets/images/**/*.{png,jpg,jpeg,gif,svg}`,
	videos: `/assets/videos/**/*.mp4`,
	scss: `/scss/**/*.scss`,
	scripts: `/js/**/*.js`,
	models: `/assets/models/**/*.*`,
	fonts: `/assets/fonts/**/*.*`,
	favicons: `/assets/favicons/**/*.ico`,
};

const paths = {
	html: `/`,
	ejs: `/`,
	images: `/assets/images/`,
	videos: `/assets/videos/`,
	css: `/css/`,
	scss: `/scss/`,
	scripts: `/js/`,
	models: `/assets/models/`,
	fonts: `/assets/fonts/`,
	favicons: `/assets/favicons/`,
};

const serve = (cb) => {
	$.connect.server({
		host: $.ip.address(),
		root: basePath.dest,
		port: 9595,
		livereload: true,
	});
	cb();
};

const clean = () => $.del([basePath.dest], { force: true });

const scss = () => {
	const isProduction = !!(_env.isProduction === true);
	return (
		gulp
			.src([basePath.src + src.scss])
			.pipe($.plumber({ errorHandler: onError }))
			// .pipe($.cached('sass_compile'))
			.pipe($.if(!isProduction, $.sourcemaps.init()))
			.pipe(
				$sass({
					outputStyle: isProduction ? 'compressed' : 'expanded',
					// ,includePaths: [ basePath.node ],
				}).on('error', $sass.logError)
			)
			.pipe($.postcss([$.autoprefixer]))
			.pipe($.groupCssMediaQueries())
			.pipe($.rename({ basename: 'yk.min' }))
			.pipe($.if(!isProduction, $.sourcemaps.write('.maps')))
			// .pipe($.if(isProduction, $.cleanCss()))
			.pipe($.if(isProduction, $.header(banner, { pkg: pkg })))
			.pipe($.size({ gzip: true, showFiles: true }))
			.pipe(gulp.dest(basePath.dest + paths.css))
			.pipe($.connect.reload())
	);
};

const scripts = () => {
	const isProduction = !!(_env.isProduction === true);
	return (
		gulp
			.src([basePath.src + src.scripts])
			.pipe($.plumber({ errorHandler: onError }))
			.pipe($.babel()) // 옵션은 {"presets": ["@babel/preset-env"]} .babelrc 파일로 대체
			.pipe(
				webpackStream({
					mode: isProduction ? 'production' : 'development',
					output: {
						filename: 'yk.min.js', // [app].js
						path: path.resolve(__dirname, basePath.dest),
					},
					resolve: {
						extensions: ['.js'],
					},
				})
			)
			// .pipe($.if(['*.js', '!*.min.js'],
			// 	$.newer({dest: basePath.dest + path.scripts, ext: '.min.js'}),
			// 	$.newer({dest: basePath.dest + path.scripts})
			// ))
			// .pipe($.if(['*.js', '!*.min.js'], $.uglify()))
			// .pipe($.if(['*.js', '!*.min.js'], $.rename({suffix: '.min'})))
			.pipe($.if(isProduction, $.header(banner, { pkg: pkg })))
			.pipe($.size({ gzip: true, showFiles: true }))
			.pipe(gulp.dest(basePath.dest + paths.scripts))
			.pipe($.connect.reload())
	);
};

const images = () => {
	const basePathImages = basePath.dest + src.images;
	return gulp
		.src([basePath.src + src.images])
		.pipe($.newer({ dest: basePathImages }))
		.pipe($.print.default())
		.pipe(gulp.dest(basePath.dest + paths.images));
};

const videos = () => {
	const basePathVideos = basePath.dest + src.videos;
	return gulp
		.src([basePath.src + src.videos])
		.pipe($.newer({ dest: basePathVideos }))
		.pipe($.print.default())
		.pipe(gulp.dest(basePath.dest + paths.videos));
};

const favicons = () => {
	const basePathImages = `${basePath.dest + paths.favicons}**/*.ico`;
	return gulp
		.src([basePath.src + src.favicons])
		.pipe($.newer({ dest: basePathImages }))
		.pipe($.print.default())
		.pipe(gulp.dest(basePath.dest + paths.favicons));
};

const models = () => {
	return gulp
		.src([basePath.src + src.models])
		.pipe($.print.default())
		.pipe(gulp.dest(basePath.dest + paths.models));
};

const fonts = () => {
	return gulp
		.src([basePath.src + src.fonts])
		.pipe($.print.default())
		.pipe(gulp.dest(basePath.dest + paths.fonts));
};

const html = () => {
	return gulp
		.src([basePath.src + src.html, basePath.src + src.ejs])
		.pipe($.plumber({ errorHandler: onError }))
		.pipe(
			$.data((file) => {
				const files = path.normalize(path.dirname(file.path.replace(path.resolve(__dirname, basePath.src), '')) + '/');
				const rootPath = '../'.repeat([files.split('/').length - 2]) || './';
				return { rootPath };
			})
		)
		.pipe(
			$.ejs({
				siteName: 'YK',
			})
		)
		.pipe($.rename({ extname: '.html' }))
		.pipe(gulp.dest(basePath.dest))
		.pipe($.connect.reload());
};

const watchFiles = (cb) => {
	gulp.watch([basePath.src + src.scss], scss);
	gulp.watch([basePath.src + src.favicons], favicons);
	gulp.watch([basePath.src + src.images], images);
	gulp.watch([basePath.src + src.videos], videos);
	gulp.watch([basePath.src + src.scripts], scripts);
	gulp.watch([basePath.src + src.models], models);
	gulp.watch([basePath.src + src.fonts], fonts);
	gulp.watch([`${basePath.src}/**/*.{html,ejs}`], html);

	const watcher1 = gulp.watch([basePath.src + src.images]);
	const watcher2 = gulp.watch([basePath.src + src.videos]);

	watcher1.on('unlink', function (file) {
		const files = file.replace(basePath.src, basePath.dest);
		$.fancyLog('Remove File: ', files);
		$.del([files], { force: true });
	});
	watcher2.on('unlink', function (file) {
		const files = file.replace(basePath.src, basePath.dest);
		$.fancyLog('Remove File: ', files);
		$.del([files], { force: true });
	});
};

const setProduction = (cb) => {
	_env.isProduction = true;
	$.fancyLog(basePath.dest, basePath.build);
	basePath.dest = basePath.build;
	cb();
};

const dev = gulp.parallel(models, fonts, favicons, images, videos, scripts, scss, html);
const build = gulp.series(clean, setProduction, dev);
const defaults = gulp.series(dev, serve, watchFiles);
export { dev, build, clean, scss, scripts, images, videos, html, models };
export default defaults;
