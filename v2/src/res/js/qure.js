
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
			this.body = document.querySelector('body');

			// bind handlers
			this.body.addEventListener('click', this.doEvent)
			//this.body.on('click', '[data-cmd]', this.doEvent);

			// default tasks
			this.doEvent('init-editors');
		},
		doEvent: function(event, el, orgEvent) {
			var self = qure,
				cmd  = (typeof(event) === 'string') ? event : event.type,
				wrapper,
				index,
				code,
				srcEl;
			//console.log(cmd);
			switch(cmd) {
      			// native events
      			case 'click2':
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
      			case 'click':
      				srcEl = event.target;
      				cmd = srcEl.getAttribute('data-cmd');
      				if (!cmd) return;
      				// prevent default behaviour
					event.stopPropagation();
					event.preventDefault();

					return self.doEvent(cmd, srcEl, event);
      			// custom events
				case 'init-editors':
					document.querySelectorAll('pre > code').forEach(function(item, index) {
						if (item.firstChild.innerHTML !== '/* qure:active */') return;
						var _cm = cm,
							language = item.className.split('-')[1],
							code = item.textContent.split('\n').slice(1),
							cmOptions = {
						        mode: _cm.types[language],
						        gutters: _cm.gutterOptions,
								extraKeys: _cm.extraKeys,
								lineWrapping: false,
								lineNumbers: true
							},
							textarea,
							editor;
						code.unshift(code.pop());
						item.setAttribute('data-editor_index', index);
						item.classList.add('active');
						item.innerHTML = '<textarea>'+ code.join('\n') +'</textarea>'+
								'<div data-cmd="active-play-toggle"></div>'+
								'<sidebar><div class="rows"></div></sidebar>';
						textarea = item.querySelector('textarea');
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

						if (index === 1) qure.sandbox(editor);
						//console.log(index, editor.getValue());
					});
					break;
				case 'explore-arguments':
					//var tmp = el.attr('data-editor_index').split(',');
					//console.log( cm.labs[tmp[0]] );
					break;
				case 'active-play-toggle':
					wrapper = el.parentNode;
					index = wrapper.getAttribute('data-editor_index');
					if (cm.labs[index]) {
						cm.labs[index].stop(index);
						wrapper.classList.remove('sandbox-on');
					} else {
						qure.sandbox(cm.editors[index]);
					}
					break;
			}
		},
		sandbox: function(editor) {
			var code = editor.getValue(),
				wrapper = editor.display.wrapper.parentNode,
				editor_index = wrapper.getAttribute('data-editor_index'),
				sidebar = wrapper.querySelector('sidebar .rows'),
				labs = {
					view: function(line, options) {
						var span = document.createElement('span'),
							el = sidebar.querySelector('div.view.stdOut.line-'+ line),
							height = editor.defaultTextHeight(),
							style = [],
							key, htm;
						if (!el) {
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
							span.innerHTML = htm;
							el = sidebar.appendChild(span.firstChild);
						}
						return {
							el: el,
							width: el.offsetWidth - 2,
							height: el.offsetHeight - 2
						};
					},
					log: function(line) {
						var span = document.createElement('span'),
							args = [].slice.call(arguments).slice(1),
							el = sidebar.querySelector('div.stdOut.line-'+ line),
							height = editor.defaultTextHeight(),
							style = [],
							htm;
						if (!el) {
							style.push('height: '+ (height + 1) +'px');
							style.push('top: '+ (((line - 1) * height) + 4) +'px');
							htm = '<div class="stdOut line-'+ line +'" style="'+ style.join('; ') +';"></div>';
							span.innerHTML = htm;
							el = sidebar.appendChild(span.firstChild);
						}
						el.classList.remove('ping');
						// forward to real console
						window.console.log.apply({}, args);
						requestAnimationFrame(function() {
							var content = args.map(function(item, index) {
									if (!item) return 'undefined';
									switch (item.constructor) {
										case Number:
										case String:   return item;
										case Array:    return '<span data-cmd="explore-arguments" data-editor_index="'+ editor_index +','+ index +'">'+ JSON.stringify(item) +'</span>';
										case Object:   return '<span data-cmd="explore-arguments" data-editor_index="'+ editor_index +','+ index +'">'+ item.toString() +'</span>';
										case Function: return '<span data-cmd="explore-arguments" data-editor_index="'+ editor_index +','+ index +'">Function</span>';
									}
									return '<span data-cmd="explore-arguments" data-index="'+ editor_index +','+ index +'">'+ (typeof item) +'</span>';
								});
							// update log line
							el.classList.add('ping');
							el.innerHTML = content.join(',');
						});
					},
					fetchScript: async function(url) {
						return new Promise(function(resolve, reject) {
							fetch(url +'?'+ Math.random())
								.then(resp => resp.text())
						    	.then(code => {
						    		var str = 'return (function() {var module={};'+ code +'; return module.exports;})();';
					    			return new Function(str).call();
						    	})
						    	.then(data => resolve(data))
						    	.catch(error => reject(error));
						});
					},
					fetchJSON: async function(url) {
						return new Promise(function(resolve, reject) {
							fetch(url)
						    	.then(resp => resp.json())
						    	.then(data => resolve(data))
						    	.catch(error => reject(error));
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
							fetchScript=labs.fetchScript.bind(labs);
							fetchJSON=labs.fetchJSON.bind(labs);
						(function() {
							if (labs._stopped) return;
							${lines.join('\n')}})();`;
					(new Function('labs', code).call({}, labs));

					cm.labs[editor_index] = labs;
				},
				lines = code.split('\n'),
				len = lines.length;

			wrapper.classList.add('sandbox-on');
			sidebar.innerHTML = '';

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

	var fn, init = function() {
			// init object
			qure.init();
			// call default onload handler, if any
			if (typeof(fn) === 'function') fn();
		};

	if (document.readyState === 'complete') {
		init();
	} else {
		fn = window.onload;
		window.onload = init;
	}
	
})(window, document);
