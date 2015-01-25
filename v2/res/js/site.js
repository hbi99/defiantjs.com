
// Javascript by Hakan Bilgin (c) 2013-2015

$(function() {
	'use strict';

	var app = {
		init: function() {
			// fast references
			this.win  = $(window);
			this.body = $('body');

			// initate app
			for (var n in this) {
				if (typeof(this[n].init) === 'function') {
					this[n].init();
				}
			}
			// bind click handlers
			this.body.on('click', '.nolink, [data-cmd]', this.doEvent);
			
			// auto login user
			this.doEvent('/post-parse-xslt-gist/');

		},
		doEvent: function(event, el) {
			var self = app,
				cmd  = (typeof(event) === 'string')? event : event.type,
				cmd_target = self,
				cmd_parts,
				srcEl;

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
					cmd_parts.filter(function(sub) {
						if (cmd_target[sub]) cmd_target = cmd_target[sub];
					});
					// call target command
					cmd_target.doEvent(cmd, srcEl, event);
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

			},
			doEvent: function(event, el, eOriginal) {
				var root = app,
					self = root.recipe,
					cmd  = (typeof(event) === 'string')? event : event.type,
					dialog,
					srcEl,
					val;

				switch(cmd) {
					// custom events
					case '/evaluator/eval-xpath/':
						break;
					case '/evaluator/switch-to-json/':
						break;
					case '/evaluator/switch-to-xml/':
						break;
					case '/evaluator/toggle-edit/':
						break;
					case '/evaluator/xpath-samples/':
						break;
				}
			}
		}
	};

	app.init();

});