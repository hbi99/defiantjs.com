
@@include('./qure.js')

(function(window, document) {
	'use strict';

	var site = {
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
		},
		doEvent: function(event, el, orgEvent) {
			var self = site,
				cmd  = (typeof(event) === 'string') ? event : event.type,
				tabEl,
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
      			// custom events
				case 'switch-tab':
					tabEl = self.body.find('.article .tab-body:nth('+ el.index() +')');
					tabEl.parent().find('.tab-body.active').removeClass('active');
					tabEl.addClass('active');

					el.parent().find('.active').removeClass('active');
					el.addClass('active');
					break;
			}
		}
	};

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
