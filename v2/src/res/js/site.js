
@@include('./codemirror/codemirror.js')
@@include('./codemirror/javascript.js')

(function(window, document) {
	'use strict';

	var site = {
		init: function() {
			// fast references
			this.body = $('body');
		}
	};

	var $ = @@include('./junior.js')

	window.onload = site.init;
	
})(window, document);