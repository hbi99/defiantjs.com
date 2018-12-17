
const colors = require("colors")
const gulp = require("gulp")
const $ = require("gulp-load-plugins")()
const autoprefixer = require("autoprefixer")
const cleanCSS = require("gulp-clean-css")
const markdownIt = require("markdown-it")
const hljs = require("highlight.js")


const srcPaths = {
	base: "./src",
	server : "./app.js",
	html : ["./src/index.htm", "./src/res/md/*.md"],
	scripts : ["./src/res/js/*.js", "!./src/res/js/*.min.js", "./src/res/js/site.js"],
	modules : "./src/res/js/modules/*.js",
	styles : ["./src/res/css/**/*.less", "./src/res/css/index.less"],
	images : "./src/res/img/**/*.{gif,png,jpg,ico,svg}",
	json : "./src/res/json/**/*.{json,csv,tsv}",
	svg : ["./src/res/svg/*.svg", "!./src/res/svg/svg-symbols.svg"]
}

const destPaths = {
	base: "./public",
	script: "./public/res/js/",
	modules: "./public/res/js/modules/",
	styles: "./public/res/css/",
	images: "./public/res/img/",
	json: "./public/res/json/",
	svg: "./public/res/svg/",
}

const includeOptions = {
	prefix: "@@",
	basepath: "@file"
}

const svgOptions = {
	id : "symbol-%f",
	class : ".svg-symbol.symbol-%f",
	templates : ["default-svg"]
}

const md = new markdownIt({
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value
			} catch (__) {}
		}
		return ''
	}
})




/*-------------------------------------------------------------------------
 * Gulp HELP
 *-------------------------------------------------------------------------*/
function help(done) {
	var str = "\n----DEVELOPMENT Mode-------------------------------------------------------------"+
			"\n  NodeJS version 9.2.0 is required for this project\n".white+
			"\n  gulp build".cyan      +"\t\tCreates a build version".grey+
			"\n  gulp watch".cyan      +"\t\tWatches source files and compiles on change".grey+
			"\n----------------------------------------------------------------------------------\n"
	console.log(str)
	done()
}


function clean() {
	return gulp.src(destPaths.base +"/**/*", { read: false })
		.pipe($.rm())
}

function scripts() {
	return gulp.src(srcPaths.scripts[2])
		.pipe($.fileInclude(includeOptions))
	//	.pipe($.uglify())
		.pipe($.rename({suffix: ".min"}))
		.pipe(gulp.dest(destPaths.script))
		.pipe($.size({title: "scripts"}))
}

function modules() {
	return gulp.src(srcPaths.modules)
		.pipe(gulp.dest(destPaths.modules))
		.pipe($.size({title: "modules"}))
}

function styles() {
	return gulp.src(srcPaths.styles[1])
		.pipe($.less())
		.on("error", (err) => {
			$.util.beep()
			console.log(err.toString())
			this.emit("end")
		})
		.pipe(cleanCSS({compatibility: "ie8"}))
		.pipe(gulp.dest(destPaths.styles))
		.pipe($.size({title: "styles"}))
}

function images() {
	return gulp.src(srcPaths.images)
		.pipe($.imagemin())
		.pipe(gulp.dest(destPaths.images))
		.pipe($.size({title: "images"}))
}

function json() {
	return gulp.src(srcPaths.json)
		.pipe(gulp.dest(destPaths.json))
		.pipe($.size({title: "json"}))
}

function svg() {
	return gulp.src(srcPaths.svg)
		.pipe($.svgSymbols(svgOptions))
		.pipe(gulp.dest(destPaths.svg))
		.pipe($.size({title: "svg"}))
}

function html() {
	return gulp.src(srcPaths.html[0])
		.pipe($.fileInclude({
			filters: { markdown: instr => md.render(instr) }
		}))
		.pipe(gulp.dest(destPaths.base))
		.pipe($.size({title: "html"}))
}

function webserver(done) {
	$.nodemon({
		script: srcPaths.server,
		ignore: [srcPaths.base, destPaths.base],
	})
	done()
}

function watch() {
	gulp.watch(srcPaths.scripts.slice(0,2), scripts)
	gulp.watch(srcPaths.modules, modules)
	gulp.watch(srcPaths.styles[0], styles)
	gulp.watch(srcPaths.images, images)
	gulp.watch(srcPaths.json, json)
	gulp.watch(srcPaths.svg, svg)
	gulp.watch(srcPaths.html, html)
}

var build = gulp.series(clean, gulp.parallel(scripts, modules, styles, images, svg, json, html))
var start = gulp.series(clean, gulp.parallel(scripts, modules, styles, images, svg, json, html), webserver, watch)

gulp.task("clean", clean)
gulp.task("watch", watch)
gulp.task("scripts", scripts)
gulp.task("modules", modules)
gulp.task("styles", styles)
gulp.task("images", images)
gulp.task("svg", svg)
gulp.task("json", json)
gulp.task("html", html)
gulp.task("webserver", webserver)

gulp.task("help", help)
gulp.task("build", build)
gulp.task("start", start)

