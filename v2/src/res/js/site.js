
@@include('./codemirror/codemirror.js')
@@include('./codemirror/javascript.js')
@@include('./raf.js')

(function(window, document) {
	'use strict';

	var cm = {
		editors: {},
		labs: {},
		types: {
			js: 'text/javascript'
		},
		gutterOptions: ['CodeMirror-linenumbers'],
		extraKeys: {
			'Alt-Enter': function(editor) {
				qure.sandbox(editor);
			}
		}
	};

	var qure = {
		init: function() {
			// fast references
			this.body = $('body');

			// init sub-objects
			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init();
				}
			}

			// bind handlers
			this.body.on('click', '[data-cmd]', this.doEvent);

			// default tasks
			this.doEvent('init-editors');
		},
		doEvent: function(event, el, orgEvent) {
			var self = qure,
				cmd  = (typeof(event) === 'string') ? event : event.type,
				index,
				code,
				srcEl;
			//console.log(cmd);
			switch(cmd) {
      			// native events
      			case 'click':
					srcEl = $(event.target);
					cmd = srcEl.attr('href') || srcEl.attr('data-cmd');
					if (!cmd) {
						srcEl = srcEl.hasClass('nolink') || srcEl.attr('data-cmd') ? srcEl : srcEl.parents('.nolink, [data-cmd]');
						if (!srcEl.length) return;
					}

					if (['input'].indexOf(event.target.nodeName.toLowerCase()) === -1) {
						event.stopPropagation();
						event.preventDefault();
					}
					if (srcEl.hasClass('disabled')) return;

					cmd = srcEl.attr('href') || srcEl.attr('data-cmd');
					return self.doEvent(cmd, srcEl, event);
				case 'keypress':
					break;
      			// custom events
				case 'init-editors':
					self.body.find('span:contains(/* qure:active */)').map(function(index, item) {
						var _cm = cm,
							el = $(item).parents('code:first'),
							language = el.prop('className').split('-')[1],
							code = el.text().split('\n').slice(1).join('\n'),
							cmOptions = {
						        mode: _cm.types[language],
						        gutters: _cm.gutterOptions,
								extraKeys: _cm.extraKeys,
								lineWrapping: false,
								lineNumbers: true
							},
							textarea,
							editor;
						if (el.find('span:first')[0] !== item) return;
						
						el.attr({'data-editor_index': index}).addClass('active');
						el.html('<textarea>'+ code +'</textarea>'+
								'<div data-index="'+ index +'" data-cmd="active-play-toggle"></div>'+
								'<sidebar><div class="rows"></div></sidebar>');
						textarea = el.find('textarea:first')[0];
						editor = CodeMirror.fromTextArea(textarea, cmOptions);
						/*
						editor.on('blur', function(event) {
								var el = $(event.display.wrapper).parents('pre');
								el.removeClass('active');
								qure.body.removeClass('editor-focus');
							});
						editor.on('focus', function(event) {
								var el = $(event.display.wrapper).parents('pre');
								el.addClass('active');
								qure.body.addClass('editor-focus');
							});
						*/
						_cm.editors[index] = editor;

						//if (index === 1) qure.sandbox(editor);
						//console.log(index, editor.getValue());
					});
					break;
				case 'explore-args':
					console.log(el.attr('data-index'));
					break;
				case 'active-play-toggle':
					index = el.attr('data-index');
					if (cm.labs[index]) {
						cm.labs[index].stop(index);
					} else {
						qure.sandbox(cm.editors[index]);
					}
					break;
			}
		},
		sandbox: function(editor) {
			var code = editor.getValue(),
				wrapper = $(editor.display.wrapper.parentNode).addClass('sandbox-on'),
				editor_index = wrapper.attr('data-editor_index'),
				sidebar = wrapper.find('sidebar .rows'),
				labs = {
					view: function(line, options) {
						var el = sidebar.find('div.view.stdOut.line-'+ line),
							height = editor.defaultTextHeight(),
							style = [],
							key, htm;
						if (!el.length) {
							style.push('top: '+ (((line - 1) * height) + 4) +'px');
							if (typeof options === 'object') {
								for (key in options) {
									switch (key) {
										case 'width': continue;
										case 'height': style.push(key +': '+ options[key] +'px'); break;
									}
								}
							}
							htm = '<div class="stdOut view line-'+ line +'" style="'+ style.join('; ') +';"></div>';
							el = sidebar.append(htm);
						}
						return {
							el: el,
							width: el.prop('offsetWidth') - 2,
							height: el.prop('offsetHeight') - 2
						};
					},
					log: function(line) {
						var args = [].slice.call(arguments).slice(1),
							el = sidebar.find('> div.stdOut.line-'+ line).removeClass('ping'),
							height = editor.defaultTextHeight(),
							style = [],
							htm;
						if (!el.length) {
							style.push('height: '+ (height + 1) +'px');
							style.push('top: '+ (((line - 1) * height) + 4) +'px');
							htm = '<div class="stdOut line-'+ line +'" style="'+ style.join('; ') +';"></div>';
							el = sidebar.append(htm);
						}
						requestAnimationFrame(function() {
							var content = args.map(function(item, index) {
									switch (item.constructor) {
										case Array:    return '<span data-cmd="explore-args" data-index="'+ editor_index +','+ index +'">'+ JSON.stringify(item) +'</span>';
										case Object:   return '<span data-cmd="explore-args" data-index="'+ editor_index +','+ index +'">'+ JSON.stringify(item) +'</span>';
										case Function: return '<span data-cmd="explore-args" data-index="'+ editor_index +','+ index +'">Function</span>';
									}
									return item;
								});
							// update log line
							el.addClass('ping').html(content.join(','));
						});
					},
					_rafs: [],
					_timeouts: [],
					_intervals: [],
					requestAnimationFrame: function(func) {
						this._rafs.push(requestAnimationFrame(func));
					},
					setTimeout: function(func, time) {
						this._timeouts.push(setTimeout(func, time));
					},
					setInterval: function(func, time) {
						this._intervals.push(setInterval(func, time));
					},
					stop: function(index) {
						this._stopped = true;
						this._rafs.map(function(func) {
							cancelAnimationFrame(func);
						});
						this._intervals.map(function(func) {
							clearInterval(func);
						});
						this._timeouts.map(function(func) {
							clearTimeout(func);
						});
						delete cm.labs[index];
					}
				},
				sandboxed = function(lines) {
					var code = `var console={log:labs.log, view:labs.view},
							requestAnimationFrame=labs.requestAnimationFrame.bind(labs),
							setTimeout=labs.setTimeout.bind(labs),
							setInterval=labs.setInterval.bind(labs);
						(function() {
							if (labs._stopped) return;
							${lines.join('\n')}})();`;
					(new Function('labs', code).call({}, labs));

					cm.labs[editor_index] = labs;
				},
				lines = code.split('\n'),
				len = lines.length;

			while (len--) {
				// adjust 'console.log'
				lines[len] = lines[len]
								.replace(/console.log\(/g, 'console.log('+ (len+1) +',')
								.replace(/console.view\(/g, 'console.view('+ (len+1) +',');
			}
			// eval code in sandbox mode
			sandboxed(lines);
		}
	};

	var $ = @@include('./junior.js')

	window.onload = qure.init.bind(qure);
	
})(window, document);
