
@@include('./codemirror/codemirror.js')
@@include('./codemirror/javascript.js')

(function(window, document) {
	'use strict';

	var site = {
		init: function() {
			// fast references
			this.body = $('body');

			var el = $('pre textarea');
			var gutterOptions = ['CodeMirror-linenumbers'];
			var types = {
				js: 'text/javascript'
			};
			var editor = CodeMirror.fromTextArea(el[0], {
			        mode: types[el.attr('data-language')],
					lineWrapping: false,
					lineNumbers: true,
			        gutters: gutterOptions
				});
			
			editor.on('blur', function(event) {
				var el = $(event.display.wrapper).parents('pre');
				el.removeClass('active');
				site.body.removeClass('editor-focus');
			});
			editor.on('focus', function(event) {
				var el = $(event.display.wrapper).parents('pre');
				el.addClass('active');
				site.body.addClass('editor-focus');
			});
		}
	};

	var $ = @@include('./junior.js')

	window.onload = site.init.bind(site);
	
})(window, document);