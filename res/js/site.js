
// Javascript by Hakan Bilgin (c) 2013-2014

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
	},
	snapshot = Defiant.getSnapshot(json_data);
	
$(function() {
	'use strict';

	// enable search trace, for visual highlighting
	Defiant.env = 'development';
	
	var site = {
		init: function() {
			this.menu = $('#menu')[0];

			$(window).bind('scroll', this.do_event).trigger('scroll');
			$('.nolink').live('click', this.do_event);
			$('.button').live('mousedown', this.do_event);

			this.build_menu();
			this.post_render_gists();
			this.school.init();

			var hash = document.location.hash;
			if (hash) {
				$('a[href="'+ hash +'"]').trigger('click');
			}

			$.ajax({
				cache: false,
				url: '/defiant.js/package.json',
				complete: function(data) {
					var lib = JSON.parse(data.responseText);
					$('.libv').html('version '+ lib.version);
				}
			});
		},
		build_menu: function() {
			var nav = {"menu_item": []},
				section = $('[data-section]'),
				subsection,
				menu_item,
				name,
				target,
				is_link;
			// build menu JSON
			for (var i=0, il=section.length; i<il; i++) {
				target    = section[i].getAttribute('data-section');
				is_link   = target.slice(0,4) === 'http';
				menu_item = {
					name   : $(section[i]).text(),
					target : target.slice(0,4) === 'http'? target : '#'+ target,
					is_link: is_link
				};
				// find subsections
				subsection = $(section[i]).parents('section').find('[data-subsection]');
				if (subsection.length) {
					menu_item['submenu'] = [];
					for (var j=0, jl=subsection.length; j<jl; j++) {
						name = (subsection[j].nodeName.toLowerCase() === 'div')
								? $(subsection[j]).find('code:nth(0)').text().replace(/\(.*?\)/, '')
								: $(subsection[j]).text();
						target  = subsection[j].getAttribute('data-subsection');
						is_link = target.slice(0,4) === 'http';
						menu_item['submenu'].push({
							name   : name,
							target : is_link ? target : '#'+ target,
							is_link: is_link
						});
					}
				}
				nav.menu_item.push(menu_item);
			}
			// render menu object with defiant
			$('#menu').defiant('menu', nav);
		},
		do_event: function(event) {
			var _site  = site,
				target = $(this),
				nolink = target.hasClass('nolink');

			switch(event.type) {
				case 'mousedown':
					if (target.hasClass('disabled')) return;
					if (nolink && target.hasClass('button')) {
						var parent = target.parent(),
							is_group = parent.hasClass('btn-group'),
							is_toggle =target.hasClass('btn-toggle');

						if (is_group) {
							parent.find('.active').removeClass('active');
							target.addClass('active');
						} else if (is_toggle) {
							target[ target.hasClass('active') ? 'removeClass' : 'addClass' ]('active');
						}
					}
					break;
				case 'click':
					if (nolink) {
						if (!target.parents('#menu').length) {
							event.preventDefault();
							_site.do_cmd( target.attr('href').slice(1), target );
							return;
						}
						var href = (target.attr('href')) ? target.attr('href').slice(1) : target.attr('data-target').slice(1),
							section = $('[data-section="'+ href +'"]');
						if (!section.length) section = $('[data-subsection="'+ href +'"]');
						$('html, body').animate({scrollTop: section.offset().top - 73}, 500);
					}
					break;
				case 'scroll':
					var scroll_top = document.documentElement.scrollTop || document.body.scrollTop,
						menu       = _site.menu,
						menu_top   = menu.parentNode.offsetTop,
						docked     = menu_top - scroll_top < 0;
					
					if (docked) menu.className = 'docked';
					else menu.className = '';
					break;
			}
		},
		do_cmd: function(cmd, el) {
			var _site = site,
				school = _site.school;

			switch (cmd) {
				case 'show-xpath_evaluator':
					$('a[href="#xpath_evaluator"]').trigger('click');
					break;
				case 'xpath-samples':
					if (!el.hasClass('button')) {
						$('.button[href="#xpath-samples"]').trigger('mousedown').trigger('click');
						return;
					}
					var show_pan = el.hasClass('active'),
						pan      = $('.xpath-school .examples'),
						right    = +pan.width();
					
					pan.animate({
						'opacity': show_pan ? 1 : 0,
						'right': show_pan ? 0 : -right
					}, 300);
					break;
				case 'swap-xpath':
					var xpath = el.text();
					$('.school-buttons input').val( xpath );
					school.search(xpath);
					break;
				case 'switch-to-json':
					if (school.xpath) {
						school.mode = 'json';
						school.search(school.xpath);
					} else school.render_json(json_data);
					break;
				case 'switch-to-xml':
					if (school.xpath) {
						school.mode = 'xml';
						school.search(school.xpath);
					} else school.render_xml(json_data);
					break;
				case 'evaluate-xpath':
					if (el[0].nodeName.toLowerCase() === 'a') el = $('.school-buttons input');
					try {
						school.search( el.val() );
					} catch(e) {
						if (school.mode === 'json') school.render_json(json_data);
						else school.render_xml(json_data);
						el.addClass('error');
						return;
					}
					el.removeClass('error');
					break;
				case 'toggle-edit':
					var school_el   = $('.xpath-school').parent(),
						btn_samples = $('a.button[href="#xpath-samples"]', school_el),
						textarea    = $('textarea.paste_data', school_el),
						structure   = $('.structure', school_el),
						is_edit     = el.hasClass('active'),
						str         = (school.mode === 'json')? JSON.stringify(json_data, null, '\t').replace(/\t/g, school.tab_str)
															  : Defiant.node.prettyPrint( JSON.toXML(json_data) ),
						test,
						input_type,
						button;

					if (is_edit) {
						if (btn_samples.hasClass('active')) {
							btn_samples.removeClass('active').trigger('click');
						}
						structure.hide();
						textarea.show().val(str).select().focus();
						btn_samples.addClass('disabled');
					} else {
						str  = textarea.val().replace(/\n|\t/g, '');
						try {
							input_type = 'json';
							test = JSON.parse(str);
							
							json_data = test;
							snapshot  = Defiant.getSnapshot(json_data);
							button    = 'a[href="#switch-to-json"]';

						} catch (e) {
							input_type = 'xml';
							str = str.replace(/d:data/, 'd:data '+ Defiant.namespace);
							test = Defiant.xmlFromString(str);

							if (Defiant.node.prettyPrint(test).indexOf('parsererror') > -1) {
								var conf = confirm('The input doesn\'t appear to be valid JSON or XML. Do you want to try again?');
								if (conf) return el.addClass('active');
							} else {
								json_data = test.documentElement.toJSON();
								button    = 'a[href="#switch-to-xml"]';
							}
						}
						$(button).trigger('mousedown').trigger('click');
						// re-render with new structure
						//school.search(school.xpath);

						structure.show();
						textarea.hide();
						btn_samples.removeClass('disabled');
					}
					break;
			}
		},
		post_render_gists: function() {
			var xslt = $('.gist-code.type-xslt'),
				line,
				str,
				script;
			for (var i=0, il=xslt.length; i<il; i++) {
				line = $('.line-pre div', xslt[i]);
				script = false;
				for (var j=0, jl=line.length; j<jl; j++) {
					str = line[j].innerHTML;
					// javascript
					if (str.match(/\&lt;\/script\&gt;/ig) !== null) script = false;
					if (script) {
						// strings
						str = str.replace(/(".*?"|'.*?')/ig, '<span class="s2">$1</span>');
						// key words
						str = str.replace(/\b(window|document|var|if|while|for|else|switch|case|default|this|return|delete|break|continue|true|false|null|undefinded|NaN|Infinity|typeof|instanceof|new|function|Defiant)\b/ig, '<span class="kd">$1</span>');
						// numeric values
						str = str.replace(/: ([\d\.]{1,})\b/ig, ': <span class="mf">$1</span>');
						// method names
						str = str.replace(/>.(\w+)\(/ig, '>.<span class="mn">$1</span>(');
						str = str.replace(/(\/\/.*?$)/ig, '<span class="jc">$1</span>');
					} else {
						// html etc
						script = str.match(/script type="text\/javascript"/ig);
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
					}
					line[j].innerHTML = str;
				}
			}
		},
		school: {
			tab_str: '   ',
			init: function() {
				var xpath = '//book[3]';

				this.mode = 'json';
				this.search(xpath);

				$('.school-buttons input').bind('keyup', this.do_event).val(xpath);

				$('a[href="#xpath-samples"]').trigger('click');
				
				//$('a[href="#switch-to-xml"]').trigger('mousedown').trigger('click');
				//$('a[href="#toggle-edit"]').trigger('mousedown').trigger('click');
			},
			do_event: function(event) {
				var target = $(this);
				switch (event.type) {
					case 'keyup':
						site.do_cmd('evaluate-xpath', target);
						break;
				}
			},
			search: function(xpath) {
				this.xpath = xpath;
				switch (this.mode) {
					case 'json':
						var time = Date.now(),
							jss = JSON.search( snapshot, xpath );
						//	jres = JSON.search( json_data, xpath, null );
						
						this.render_json(json_data, jss);
						// Developer hint
						console.log('DEV HINT! Try XPath from the console directly by pasting this in to edit field:\n',
									'JSON.search(json_data, "'+ xpath +'")', '->', jss);
						break;
					case 'xml':
						var doc  = JSON.toXML( json_data ),
							xres = Defiant.node.selectNodes( doc, xpath ),
							uniq = this.simple_id(),
							i    = 0,
							il   = xres.length,
							ll;
						for (; i<il; i++) {
							if (xres[i].ownerDocument.documentElement === xres[i]) continue;
							switch (xres[i].nodeType) {
								case 1: // type: node
									ll = Defiant.node.prettyPrint(xres[i]).match(/\n/g);
									ll = (ll === null) ? 0 : ll.length;
									xres[i].setAttribute(uniq, ll);
									break;
								case 2: // type: attribute
									xres[i].ownerElement.setAttribute(uniq, xres[i].name);
									break;
								case 3: // type: text
									xres[i].parentNode.setAttribute(uniq, '#text');
									break;
							}
						}
						this.uniq = uniq;
						this.render_xml(doc);
						// Developer hint
						console.log('DEV HINT: Try XPath from the console directly by pasting this into edit field:\n',
									'Defiant.node.selectNodes( xml_data, "'+ xpath +'")', '->', xres);
						break;
				}
				return true;
			},
			render_xml: function(obj) {
				var doc    = (obj.constructor === Object) ? JSON.toXML(obj) : obj,
					str    = Defiant.node
									.prettyPrint(doc)
									.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;'),
					lines  = str.split('\n'),
					gutter = '',
					ld     = '',
					i      = 0,
					il     = lines.length,
					hl     = {
						index : 0,
						rgx   : new RegExp('( '+ this.uniq +')="(.*?)"'),
						attr  : false,
						check : false
					},
					ls,
					mlc,
					htm;
				for (; i<il; i++) {
					mlc = '';
					// highlighting
					ls = lines[i].replace(/\t/g, this.tab_str);
					// xml declaration
					ls = ls.replace(/(&lt;\?.*?\?&gt;)/i, '<span class="dc">$1</span>');
					if (i > 0) {
						// collect info; matching lines
						hl.check = ls.match(hl.rgx);
						if (hl.check !== null) {
							hl.line    = +hl.check[2];
							hl.attr    = isNaN(hl.line);
							hl.is_text = hl.check[2] === '#text';
							hl.index   = i + hl.line + 1;
							ls         = ls.replace(hl.rgx, '');
						}
						// attributes
						ls = ls.replace(/([\w-\:]+)="(.*?)"/g, '<span class="na">$1</span>="<span class="s">$2</span>"');
						// nodes
						ls = ls.replace(/(\&lt;[\w\d:]+\&gt;|\&lt;\/[\w\d:]+\&gt;|\&lt;[\w\d:]+\/\&gt;)/g, '<span class="nt">$1</span>');
						ls = ls.replace(/(\&lt;\w+ )(.*?)(\&gt;)/g, '<span class="nt">$1</span>$2<span class="nt">$3</span>');
						ls = ls.replace(/(\&lt;|\&gt;)/g, '<span class="p">$1</span>');
						// highlight matching lines
						if (hl.is_text) {
							ls = ls.replace(/(<\/span><\/span>)(.*?)(<span class="nt"><span)/, '$1<span class="mal">$2</span>$3');
							hl.is_text = false;
						} else if (hl.check !== null && hl.attr) {
							hl.rx2 = new RegExp('(<span class="na">'+ hl.check[2] +'<.span>="<span .*?<.span>")', 'i');
							ls = ls.replace(hl.rx2, '<span class="mal">$1</span>');
						} else if (hl.check !== null || i < hl.index) {
							mlc = 'ml';
							ls = '<span class="ml">'+ ls +'</span>';
						}
					}
					// prepare html
					ld     += '<div class="line '+ mlc +'">'+ ls +'</div>';
					gutter += '<span>'+ (i+1) +'</span>';
				}
				htm = '<table><tr>'+
					  '<td class="gutter">'+ gutter +'</td>'+
					  '<td class="line-data"><pre>'+ ld +'</pre></td>'+
					  '</tr></table>';
				$('.structure').html( htm );

				str = Defiant.node.prettyPrint(doc).replace(/\t/g, this.tab_str);
				$('textarea.paste_data').val( str );

				this.mode = 'xml';
				// making xml global - see notes in the begining of this file
				xml_data = doc;
			},
			render_json: function(obj, matches) {
				// this re-builds the JSON object
				//JSON.toXML( obj );

				var str    = JSON.stringify(obj, null, '\t'),
					_trace = JSON.trace || [],
					lines  = str.split('\n'),
					gutter = '',
					ld     = '',
					i      = 0,
					il     = lines.length,
					j      = 0,
					jl     = _trace.length,
					hl     = [],
					ls,
					mlc,
					htm;
				//console.log(_trace);
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
				$('.structure').html( htm );

				$('textarea.paste_data').val(str.replace(/\t/g, this.tab_str));

				this.mode = 'json';
			},
			simple_id: function() {
				var s = 'abcdefghijklmnopqrstuvwxyz',
					b = +(Math.random().toString().slice(2)),
					t = ((new Date()).valueOf() + b).toString(),
					u = '';
				s = s + s.toUpperCase();
				for (var i=0, l, n; i<(t.length/2); i++) {
					l = i*2;
					n = +(t.slice(l, l+2));
					u += s.charAt(n%s.length);
				}
				return u;
			}
		}
	};
	site.init();

});
