
@@include('./qure.js')
@@include('./modules/defiant.js')

(function(window, document) {
	'use strict';

	// enable search trace, for visual highlighting
	defiant.env = 'development';
	
	var site = {
		origin: self.origin,
		evaluator: { markers: [] },
		init: function() {
			// fast references
			this.body = $('body');
			this.xpathInput = this.body.find('.xpath-input input');
			this.xpathMatches = this.body.find('.xpath-matches');

			// init sub-objects
			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init();
				}
			}

			// bind handlers
			this.body.on('click', '[data-cmd]', this.doEvent);
			this.xpathInput.on('keyup', this.doEvent);

			//this.doEvent('check-url-query');

			if (document.location.hostname === 'localhost') {
				// temp
				setTimeout(function() {
					//site.body.find('.file-actions .button[data-cmd="custom-file"]').trigger('click');
					//site.body.find('[data-cmd="toggle-samples"]').trigger('click');
					//site.body.find('[data-arg="/res/json/medium.json"]').trigger('click');
				}, 1);
			}
		},
		doEvent: function(event, el, orgEvent) {
			var self = site,
				cmd  = (typeof(event) === 'string') ? event : event.type,
				editor = self.evaluator.editor,
				callback,
				value,
				state,
				data,
				xpath,
				markers,
				matches,
				tabEl,
				srcEl,
				str;
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
      			case 'keyup':
					xpath = self.xpathInput.val();
					if (self.evaluator.xpath === xpath || !self.evaluator.snapshot) return;
					self.doEvent('evaluate-xpath', xpath);
      				break;
      			// custom events
				case 'check-url-query':
					state = $.history.unserialize(document.location.search);
					if (state.url) {
						self.body.find('.xpath-evaluator .file-input input').val(state.url);
						$.wait_for('window.site.evaluator.editor', function() {
							self.doEvent('load-custom-file', function() {
								self.doEvent('query-eval-xpath');
							});
						});
					}
					if (state.xpath || state.url) {
						self.body.find('nav .tab:nth(2)').trigger('click');
						self.doEvent('query-eval-xpath');
					}
      				break;
      			case 'query-eval-xpath':
					state = $.history.unserialize(document.location.search);
      				self.xpathInput.val(state.xpath);
					self.xpathInput.focus();
					
					self.doEvent('evaluate-xpath', state.xpath);
      				break;
				case 'switch-tab':
					value = el.index();
					tabEl = self.body.find('.article .tab-body:nth('+ value +')');
					tabEl.parent().find('.tab-body.active').removeClass('active');
					tabEl.addClass('active');

					el.parent().find('.active').removeClass('active');
					el.addClass('active');

					switch (value.toString()) {
						case '0':
							break;
						case '1':
							break;
						case '2':
							if (!self.evaluator.editor) {
								self.doEvent('init-xpath-evaluator');
								self.doEvent('load-file');
							}
							break;
					}
					break;
				case 'init-xpath-evaluator':
					var cmOptions = {
					        mode: 'text/javascript',
					        gutters: ['CodeMirror-linenumbers'],
							readOnly: 'nocursor',
							lineWrapping: false,
							lineNumbers: true
						},
						textarea = self.body.find('.xpath-evaluator textarea')[0];
					self.evaluator.editor = CodeMirror.fromTextArea(textarea, cmOptions);

					self.doEvent('set-file-info', {
						name: 'store.json',
						path: self.origin + '/res/json/store.json',
						text: self.evaluator.editor.doc.getValue()
					});
					break;
				case 'set-file-info':
					data = arguments[1];
					value = (data.text.length / 1024).toFixed(2);

					str = '<span class="file-origin">'+ data.path.slice(0, -data.name.length-1) +'</span>'+
							'<span class="file-name">/'+ data.name +'</span> '+
							'<span class="file-info-divider"></span> '+ value +' KB';

					// set file info
					self.body.find('.xpath-evaluator .file-info').html(str);
					break;
				case 'load-file':
					if (el) {
						el.parent().find('.active').removeClass('active');
						el.addClass('active');

						value = el.attr('data-arg');
						data = value.split('/');
						str = data[data.length-1];
						srcEl = self.body.find('sidebar div[data-xpaths="'+ str +'"]');
						
						srcEl.parent().find('.active').removeClass('active');
						srcEl.addClass('active');

						return fetch(value)
							.then(resp => resp.text())
							.then(text => {
								data = {
									name: str,
									path: self.origin + value,
									text: text
								};
								self.doEvent('set-file-info', data);
								editor.getDoc().setValue(text);

								self.doEvent('load-file');
							});
					}

					data = JSON.parse(editor.doc.getValue());
					self.evaluator.snapshot = defiant.getSnapshot(data);
					break;
				case 'custom-file':
					el.parents('.box-header').addClass('custom-json-url');
	  				self.doEvent('clear-markers');
					break;
				case 'load-custom-file':
					callback = arguments[1];
					el = self.body.find('.xpath-evaluator .file-input input').removeClass('error');
					value = el.val();

					if (!value) {
						el.addClass('error');
						return;
					}

					$.getJSON(value, function(res) {
						var data = JSON.stringify(res, false, '   '),
							str = value.split('/');

						// update file info
						self.doEvent('set-file-info', {
							name: str[str.length-1],
							path: value,
							text: data
						});

						editor.getDoc().setValue(data);
						// refresh snapshot
						data = JSON.parse(editor.doc.getValue());
						self.evaluator.snapshot = defiant.getSnapshot(data);

						// indicate custom button
						el = self.body.find('.box-header .button[data-cmd="custom-file"]');
						el.parent().find('.active').removeClass('active');
						el.addClass('active');

						self.doEvent('close-custom-url');

						if (typeof callback === 'function') {
							callback();
						}
					});
					break;
				case 'close-custom-url':
					self.body.find('.xpath-evaluator .file-input input').val('');
					self.body.find('.xpath-evaluator .box-header').removeClass('custom-json-url');
					break;
				case 'toggle-samples':
					value = el.hasClass('active');
					el.toggleClass('active', value);
					self.body.find('.xpath-evaluator').toggleClass('show-sidebar', value);
					break;
				case 'edit-json':
					value = el.hasClass('active');
					el.toggleClass('active', value);
					el.parent().find('.button').toggleClass('disabled', value);

					if (value) {
						editor.setOption('readOnly', 'nocursor');
						// refresh snapshot
						data = JSON.parse(editor.doc.getValue());
						self.evaluator.snapshot = defiant.getSnapshot(data);
					} else {
	  					self.doEvent('clear-markers');
	  					self.body.find('sidebar span.active').removeClass('active');
						editor.setOption('readOnly', '');
						editor.focus();
					}
					break;
				case 'evaluate-xpath':
	  				xpath = (typeof el === 'string') ? el : el.text();
	  				self.evaluator.xpath = xpath;

	  				// clear
	  				self.doEvent('clear-markers');
	  				self.xpathMatches.html('');
		  			
					try {
						matches = defiant.search(self.evaluator.snapshot, xpath);
					} catch (err) {
						console.log(err);
						return self.xpathInput.parent().addClass('error');
					}

					// matches count
	  				self.xpathMatches.html(matches.length +' matches');

					matches.trace.map(item => {
						const lineStart = item[0] - 1;
						const lineEnd = lineStart + item[1];
						const lstr = editor.doc.getLine(lineEnd);
						self.evaluator.markers.push(editor.markText(
							{line: lineStart, ch: 0},
							{line: lineEnd, ch: lstr.length},
							{className: 'matched-json'}
						));
					});

					if (typeof el !== 'string') {
						el.parent().find('.active').removeClass('active');
						el.addClass('active');

						self.xpathInput.val(xpath);
					}
					break;
				case 'clear-markers':
					self.evaluator.markers.map(m => m.clear());
					self.evaluator.markers = [];
					break;
			}
		}
	};

	window.site = site;

	var $ = @@include('./junior.js')
	window.jr = $;

	var fn, init = function() {
			// init object
			site.init();
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
