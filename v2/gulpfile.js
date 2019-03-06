
const fs = require("fs")
const path = require("path")
const through = require('through2')
const colors = require("colors")
const gulp = require("gulp")
const $ = require("gulp-load-plugins")()
const cleanCSS = require("gulp-clean-css")
const markdownIt = require("markdown-it")
const hljs = require("highlight.js")


const html_data = {
	version: {
		defiant: "v2.2.3",
		junior: "v1.1.4",
		jupyter: "v1.0.5",
		rebellious: "1.0.1",
	}
};

const srcPaths = {
	base: "./src",
	server : "./app.js",
	html : ["./src/**/*.htm", "./src/res/md/*.md"],
	demos : "./src/demo/*.md",
	scripts : ["./src/res/js/*.js", "!./src/res/js/*.min.js", "./src/res/js/site.js", "./src/res/js/jupyter.js"],
	modules : "./src/res/js/modules/*.js",
	styles : ["./src/res/css/**/*.less", "./src/res/css/index.less"],
	images : "./src/res/img/**/*.{gif,png,jpg,ico,svg}",
	fonts : "./src/res/fonts/*.*",
	json : "./src/res/json/**/*.{json,csv,tsv}",
	svg : ["./src/res/svg/*.svg", "!./src/res/svg/svg-symbols.svg"]
}

const destPaths = {
	base: "./public",
	demos: "./public/demo/",
	script: "./public/res/js/",
	modules: "./public/res/js/modules/",
	styles: "./public/res/css/",
	images: "./public/res/img/",
	fonts: "./public/res/fonts/",
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
		return ""
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
	return gulp.src(srcPaths.scripts.slice(2))
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

function fonts() {
	return gulp.src(srcPaths.fonts)
		.pipe($.imagemin())
		.pipe(gulp.dest(destPaths.fonts))
		.pipe($.size({title: "fonts"}))
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
		.pipe($.data(() => html_data))
        .pipe($.template())
		.pipe($.fileInclude({
			filters: { markdown: instr => md.render(instr) }
		}))
		.pipe(gulp.dest(destPaths.base))
		.pipe($.size({title: "html"}))
}

function demos() {
	const _template = fs.readFileSync("./src/demo/_template.html").toString()

	return gulp.src(srcPaths.demos)
        .pipe(through.obj(function (file, enc, callback) {
			//console.log('chunk', file.path) // this should log now
			const fileparts = path.parse(file.path)
			const contents = new Buffer(file.contents).toString()
			const rendered = md.render(contents)
			
			let html = _template.replace(/<%= issue_markdown %>/, rendered)
			html = html.replace(/<%= issue_number %>/, fileparts.name.split("-")[1])

			file.contents = new Buffer(html);
			callback(null, file)
		}))
		.pipe($.rename({extname: ".htm"}))
		.pipe(gulp.dest(destPaths.demos))
		.pipe($.size({title: "demos"}))
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
	gulp.watch(srcPaths.fonts, fonts)
	gulp.watch(srcPaths.json, json)
	gulp.watch(srcPaths.svg, svg)
	gulp.watch(srcPaths.demos, demos)
	gulp.watch(srcPaths.html, html)
}

var build = gulp.series(clean, gulp.parallel(scripts, modules, styles, images, fonts, svg, json, demos, html))
var start = gulp.series(clean, gulp.parallel(scripts, modules, styles, images, fonts, svg, json, demos, html), webserver, watch)

gulp.task("clean", clean)
gulp.task("watch", watch)
gulp.task("scripts", scripts)
gulp.task("modules", modules)
gulp.task("styles", styles)
gulp.task("images", images)
gulp.task("fonts", fonts)
gulp.task("svg", svg)
gulp.task("json", json)
gulp.task("html", html)
gulp.task("demos", demos)
gulp.task("webserver", webserver)

gulp.task("help", help)
gulp.task("build", build)
gulp.task("start", start)

