
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
	styles : ["./src/res/css/**/*.less", "./src/res/css/index.less"],
	images : "./src/res/img/**/*.{gif,png,jpg,ico,svg}",
	svg : ["./src/res/svg/*.svg", "!./src/res/svg/svg-symbols.svg"]
}

const destPaths = {
	base: "./public",
	script: "./public/res/js/",
	styles: "./public/res/css/",
	images: "./public/res/img/",
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
		const isActive = !lang.indexOf("active:")
		let outStr = ""

		if (lang) {
			if (isActive) {
				outStr = '<textarea data-language="js">'+ str +'</textarea>'
			} else if (hljs.getLanguage(lang)) {
				try {
					outStr = hljs.highlight(lang, str).value
				} catch (__) {}
			}
		}
		return outStr
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
	gulp.watch(srcPaths.styles[0], styles)
	gulp.watch(srcPaths.images, images)
	gulp.watch(srcPaths.svg, svg)
	gulp.watch(srcPaths.html, html)
}

var build = gulp.series(clean, gulp.parallel(scripts, styles, images, svg, html))
var start = gulp.series(clean, gulp.parallel(scripts, styles, images, svg, html), webserver, watch)

gulp.task("clean", clean)
gulp.task("watch", watch)
gulp.task("scripts", scripts)
gulp.task("styles", styles)
gulp.task("images", images)
gulp.task("svg", svg)
gulp.task("html", html)
gulp.task("webserver", webserver)

gulp.task("help", help)
gulp.task("build", build)
gulp.task("start", start)

