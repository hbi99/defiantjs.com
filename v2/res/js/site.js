
// Javascript by Hakan Bilgin (c) 2013-2015

$(function() {
	'use strict';

	var app = {
		init: function() {
			// fast references
			this.win   = $(window);
			this.body  = $('body');
			this.nav   = this.body.find('nav');
			this.cover = this.body.find('.cover');

			// initate app
			for (var n in this) {
				if (typeof(this[n].init) === 'function') {
					this[n].init();
				}
			}
			// bind handlers
			this.win.on('mouseout', this.doEvent);
			this.body.on('click', '.nolink, [data-cmd]', this.doEvent);
			this.nav.on('mouseover', '> ul > li', this.doEvent);
			this.nav.on('mouseover', this.doEvent);
			this.cover.on('mouseover', this.doEvent);
			
			// auto login user
			this.doEvent('/post-parse-xslt-gist/');

		},
		doEvent: function(event, el) {
			var self = app,
				cmd  = (typeof(event) === 'string')? event : event.type,
				cmd_target = self,
				cmd_parts,
				twLite = TweenLite,
				srcEl,
				height;

			switch(cmd) {
				// native events
				case 'click':
					// prevent default behaviour
					if (this.nodeName === 'A') event.preventDefault();

					srcEl = $((this.nodeName === 'A')? this : event.target);
					if (srcEl.hasClass('disabled') || srcEl.parent().hasClass('disabled')) return;
					cmd = this.getAttribute('href') || this.getAttribute('data-cmd');
					// fint target object/function
					cmd_parts = cmd.slice(1,-1).split('/');
					if (cmd_parts[0] === 'goto') {
						var section = $('[data-section="'+ cmd_parts[1] +'"]');
						$('html, body').animate({scrollTop: section.offset().top - 17}, 500);
						return;
					}
					cmd_parts.filter(function(sub) {
						if (cmd_target[sub]) cmd_target = cmd_target[sub];
					});
					// call target command
					cmd_target.doEvent(cmd, srcEl, event);
					break;
				case 'mouseover':
					if (this === self.nav[0]) {
						self.nav.addClass('hover');
						return;
					}
					if (this === self.cover[0]) {
						srcEl = self.nav.find('.submenu');
						twLite.to(srcEl, 0.075, {height: 0});
						self.nav.removeClass('hover');
						return;
					}
					srcEl  = $('.submenu', this);
					if (srcEl.length) {
						height = this.childNodes[3].scrollHeight;
						twLite.to(srcEl[0], 0.075, {height: height});
					}
					break;
				// custom events
				case '/post-parse-xslt-gist/':
					var jq    = $,
						gists = jq('.gist-code.type-xslt'),
						len   = gists.length,
						str,
						node,
						lines,
						ll;
					// iterate gists
					while (len--) {
						lines  = jq('div.line', gists[len]);
						ll     = lines.length;
						// iterate lines
						while (ll--) {
							node = jq(lines[ll]);
							if (node.text().trim().indexOf('<') === 0) {
								// reset string
								str = node.text().replace(/&#160;/g, '&amp;#160;')
												.replace(/</g, '&lt;')
												.replace(/>/g, '&gt;');
								// attributes
								str = str.replace(/([\w-]+)="(.*?)"/g, '<span class="na">$1</span>="<span class="s">$2</span>"');
								// xsl tags
								str = str.replace(/(\&lt;xsl\:[\w-]+)(.*?)(\&gt;|\/\&gt;)/g, '<span class="xsl"><span class="xnt">$1</span>$2<span class="xnt">$3</span></span>');
								str = str.replace(/(\&lt;\/xsl\:[\w-]+\&gt;)/g, '<span class="xnt">$1</span>');
								str = str.replace(/(\&lt;\/xsl\:[\w-]+\&gt;)/g, '<span class="xsl">$1</span>');
								// html tags
								str = str.replace(/(\&lt;[\w\d]+\&gt;|\&lt;\/[\w\d]+\&gt;|\&lt;[\w\d]+\/\&gt;)/g, '<span class="nt">$1</span>');
								str = str.replace(/(\&lt;\w+ )(.*?)(\&gt;)/g, '<span class="nt">$1</span>$2<span class="nt">$3</span>');
								// comments
								str = str.replace(/(\&lt;!--.*?--\&gt;)/g, '<span class="c">$1</span>');
								// replace with new format
								node.html( str );
							}
						}
					}
					break;
			}
		},
		evaluator: {
			init: function() {
				this.evaluator   = $('.xpath-evaluator');
				this.structure   = this.evaluator.find('.structure');
				this.examples    = this.evaluator.find('.examples');
				this.btn_row     = this.evaluator.next('.btn-row');
				this.btn_xml     = this.btn_row.find('a.button[href="/evaluator/switch-to-xml/"]');
				this.btn_json    = this.btn_row.find('a.button[href="/evaluator/switch-to-json/"]');
				this.btn_samples = this.btn_row.find('a.button[href="/evaluator/xpath-samples/"]');
				this.tab_str     = '   ';

				this.mode     = 'json';
				this.snapshot = Defiant.getSnapshot(json_data);
				this.search('//book[3]');

				this.doEvent('/evaluator/xpath-samples/');
			},
			doEvent: function(event, el, eOriginal) {
				var root = app,
					self = root.evaluator,
					cmd  = (typeof(event) === 'string')? event : event.type,
					dialog,
					srcEl;

				switch(cmd) {
					// custom events
					case '/evaluator/eval-xpath/':
						self.search(el.text());
						break;
					case '/evaluator/switch-to-json/':
						if (self.btn_json.hasClass('active')) return;
						self.btn_xml.removeClass('active');
						self.btn_json.addClass('active');
						break;
					case '/evaluator/switch-to-xml/':
						if (self.btn_xml.hasClass('active')) return;
						self.btn_xml.addClass('active');
						self.btn_json.removeClass('active');

						if (self.xpath) {
							self.mode = 'xml';
							self.search(self.xpath);
						} else {
							self.render_json(json_data);
						}
						break;
					case '/evaluator/toggle-edit/':
						break;
					case '/evaluator/xpath-samples/':
						if (self.examples.hasClass('show')) {
							self.examples.removeClass('show');
							self.btn_samples.removeClass('active');
						} else {
							self.examples.addClass('show');
							self.btn_samples.addClass('active');
						}
						break;
				}
			},
			search: function(xpath) {
				var jss;
				this.xpath = xpath;

				switch (this.mode) {
					case 'json':
						jss = JSON.search(this.snapshot, xpath);
						this.render_json(json_data, jss);
						break;
					case 'xml':
						break;
				}
			},
			render_json: function(obj, matches) {
				var str    = JSON.stringify(obj, null, '\t'),
					_trace = JSON.trace || [],
					lines  = str.split('\n'),
					gutter = '',
					ld     = '',
					i      = 0,
					j      = 0,
					il     = lines.length,
					jl     = _trace.length,
					hl     = [],
					ls,
					mlc,
					htm;
				
				for (; j<jl; j++) {
					for (var k=0; k<_trace[j][1]+1; k++) {
						hl.push(_trace[j][0]+k-1);
					}
				}
				for (; i<il; i++) {
					mlc = '';
					// highlighting
					ls = lines[i].replace(/\t/g, this.tab_str);
					// key-value pairs
					ls = ls.replace(/(".*?"): (".*?"|[\d\.]{1,})/ig, '<span class="s1">$1</span>: <span class="s2">$2</span>');
					ls = ls.replace(/(   )(".*?"|".*?",)$/igm, '$1<span class="s2">$2</span>');
					ls = ls.replace(/(".*?"): (\W)/ig, '<span class="s1">$1</span>: $2');
					// highlight matching lines
					if (hl.indexOf(i) > -1) {
						mlc = 'ml';
						ls = '<span class="ml">'+ ls +'</span>';
					}
					// prepare html
					ld += '<div class="line '+ mlc +'">'+ ls +'</div>';
					gutter += '<span>'+ (i+1) +'</span>';
				}
				htm = '<table><tr>'+
					  '<td class="gutter">'+ gutter +'</td>'+
					  '<td class="line-data"><pre>'+ ld +'</pre></td>'+
					  '</tr></table>';
				this.structure.html(htm);
				this.mode = 'json';

				//$('textarea.paste_data').val(str.replace(/\t/g, this.tab_str));
			}
		}
	};

	app.init();

	// publish object
	window.app = app;

});

/*
 * The variable "json_data" is made global.
 * This is in case the visitor wants to make searches via the console.
 * 
 * The variable "xml_data" will be set when json_data is parsed.
 */
var xml_data,
	json_data = { "store": {
		"book": [ 
			{
				"title": "Sword of Honour",
				"category": "fiction",
				"author": "Evelyn Waugh",
				"@price": 12.99
			},
			{
				"title": "Moby Dick",
				"category": "fiction",
				"author": "Herman Melville",
				"isbn": "0-553-21311-3",
				"@price": 8.99
			},
			{
				"title": "Sayings of the Century",
				"category": "reference",
				"author": "Nigel Rees",
				"@price": 8.95
			},
			{
				"title": "The Lord of the Rings",
				"category": "fiction",
				"author": "J. R. R. Tolkien",
				"isbn": "0-395-19395-8",
				"@price": 22.99
			}
		],
			"bicycle": {
				"brand": "Cannondale",
				"color": "red",
				"@price": 19.95
			}
		}
	};

	// enable search trace, for visual highlighting
	Defiant.env = 'development';
