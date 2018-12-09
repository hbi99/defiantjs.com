
@@include('./codemirror/codemirror.js')
@@include('./codemirror/javascript.js')

(function(window, document) {
	'use strict';

	var site = {
		init: function() {
			// fast references
			this.body = $('body');

			var gutterOptions = ['CodeMirror-linenumbers'];

			var editor = CodeMirror.fromTextArea($('pre textarea')[0], {
			        mode: 'text/javascript',
					lineWrapping: false,
					lineNumbers: true,
			        gutters: gutterOptions
				});
			
		}
	};

	var $ = @@include('./junior.js')

	window.onload = site.init;
	
})(window, document);