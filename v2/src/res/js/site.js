
@@include('./codemirror/codemirror.js')
@@include('./codemirror/javascript.js')

(function(window, document) {
	'use strict';

	var cm = {
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

			this.doEvent('init-editors');
		},
		doEvent: function(event, el, orgEvent) {
			var self = qure,
				cmd  = (typeof(event) === 'string') ? event : event.type,
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
					self.body.find('span:contains(/* qure:active */)').map(function(i, item) {
						var el = $(item).parents('code:first'),
							language = el.prop('className').split('-')[1],
							code = el.text().split('\n').slice(1).join('\n'),
							cmOptions = {
						        mode: cm.types[language],
						        gutters: cm.gutterOptions,
								extraKeys: cm.extraKeys,
								lineWrapping: false,
								lineNumbers: true
							},
							textarea;
						if (el.find('span:first')[0] !== item) return;
						
						el.addClass('active');
						el.html('<textarea>'+ code +'</textarea><sidebar><div class="rows"></div></sidebar>');
						textarea = el.find('textarea:first')[0];
						CodeMirror.fromTextArea(textarea, cmOptions);
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
					});
					break;
			}
		},
		sandbox: function(editor) {
			var code = editor.getValue(),
				wrapper = $(editor.display.wrapper.parentNode).addClass('sandbox-on'),
				sidebar = wrapper.find('sidebar .rows'),
				labs = {
					log : function(line, str) {
						var el = sidebar.find('> div.stdOut.line-'+ line).removeClass('ping'),
							htm,
							style = [],
							height = editor.defaultTextHeight();
						if (!el.length) {
							style.push('height: '+ height +'px');
							style.push('top: '+ (((line - 1) * height) + 4) +'px');
							htm = '<div class="stdOut line-'+ line +'" style="'+ style.join('; ') +';"></div>';
							el = sidebar.append(htm);
						}
						setTimeout(function() {
							// update log line
							el.addClass('ping').html(str.toString());
						}, 1);
					}
				},
				sandboxed = function(lines) {
					var code = 'var console={log: labs.log};'+ lines.join('\n');
					(new Function('labs', code).call({}, labs));
				},
				lines = code.split('\n'),
				len = lines.length;

			while (len--) {
				// adjust 'console.log'
				lines[len] = lines[len].replace(/console.log\(/g, 'console.log('+ (len+1) +',');
			}
			// eval code in sandbox mode
			sandboxed(lines);
		}
	};

	var $ = @@include('./junior.js')

	window.onload = qure.init.bind(qure);
	
})(window, document);
