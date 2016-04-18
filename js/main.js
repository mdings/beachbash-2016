/*!
 * fancyBox - jQuery Plugin
 * version: 2.1.5 (Fri, 14 Jun 2013)
 * @requires jQuery v1.6 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
 *
 */

(function (window, document, $, undefined) {
	"use strict";

	var H = $("html"),
		W = $(window),
		D = $(document),
		F = $.fancybox = function () {
			F.open.apply( this, arguments );
		},
		IE =  navigator.userAgent.match(/msie/i),
		didUpdate	= null,
		isTouch		= document.createTouch !== undefined,

		isQuery	= function(obj) {
			return obj && obj.hasOwnProperty && obj instanceof $;
		},
		isString = function(str) {
			return str && $.type(str) === "string";
		},
		isPercentage = function(str) {
			return isString(str) && str.indexOf('%') > 0;
		},
		isScrollable = function(el) {
			return (el && !(el.style.overflow && el.style.overflow === 'hidden') && ((el.clientWidth && el.scrollWidth > el.clientWidth) || (el.clientHeight && el.scrollHeight > el.clientHeight)));
		},
		getScalar = function(orig, dim) {
			var value = parseInt(orig, 10) || 0;

			if (dim && isPercentage(orig)) {
				value = F.getViewport()[ dim ] / 100 * value;
			}

			return Math.ceil(value);
		},
		getValue = function(value, dim) {
			return getScalar(value, dim) + 'px';
		};

	$.extend(F, {
		// The current version of fancyBox
		version: '2.1.5',

		defaults: {
			padding : 15,
			margin  : 20,

			width     : 800,
			height    : 600,
			minWidth  : 100,
			minHeight : 100,
			maxWidth  : 9999,
			maxHeight : 9999,
			pixelRatio: 1, // Set to 2 for retina display support

			autoSize   : true,
			autoHeight : false,
			autoWidth  : false,

			autoResize  : true,
			autoCenter  : !isTouch,
			fitToView   : true,
			aspectRatio : false,
			topRatio    : 0.5,
			leftRatio   : 0.5,

			scrolling : 'auto', // 'auto', 'yes' or 'no'
			wrapCSS   : '',

			arrows     : true,
			closeBtn   : true,
			closeClick : false,
			nextClick  : false,
			mouseWheel : true,
			autoPlay   : false,
			playSpeed  : 3000,
			preload    : 3,
			modal      : false,
			loop       : true,

			ajax  : {
				dataType : 'html',
				headers  : { 'X-fancyBox': true }
			},
			iframe : {
				scrolling : 'auto',
				preload   : true
			},
			swf : {
				wmode: 'transparent',
				allowfullscreen   : 'true',
				allowscriptaccess : 'always'
			},

			keys  : {
				next : {
					13 : 'left', // enter
					34 : 'up',   // page down
					39 : 'left', // right arrow
					40 : 'up'    // down arrow
				},
				prev : {
					8  : 'right',  // backspace
					33 : 'down',   // page up
					37 : 'right',  // left arrow
					38 : 'down'    // up arrow
				},
				close  : [27], // escape key
				play   : [32], // space - start/stop slideshow
				toggle : [70]  // letter "f" - toggle fullscreen
			},

			direction : {
				next : 'left',
				prev : 'right'
			},

			scrollOutside  : true,

			// Override some properties
			index   : 0,
			type    : null,
			href    : null,
			content : null,
			title   : null,

			// HTML templates
			tpl: {
				wrap     : '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
				image    : '<img class="fancybox-image" src="{href}" alt="" />',
				iframe   : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (IE ? ' allowtransparency="true"' : '') + '></iframe>',
				error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
				next     : '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
				prev     : '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
			},

			// Properties for each animation type
			// Opening fancyBox
			openEffect  : 'fade', // 'elastic', 'fade' or 'none'
			openSpeed   : 250,
			openEasing  : 'swing',
			openOpacity : true,
			openMethod  : 'zoomIn',

			// Closing fancyBox
			closeEffect  : 'fade', // 'elastic', 'fade' or 'none'
			closeSpeed   : 250,
			closeEasing  : 'swing',
			closeOpacity : true,
			closeMethod  : 'zoomOut',

			// Changing next gallery item
			nextEffect : 'elastic', // 'elastic', 'fade' or 'none'
			nextSpeed  : 250,
			nextEasing : 'swing',
			nextMethod : 'changeIn',

			// Changing previous gallery item
			prevEffect : 'elastic', // 'elastic', 'fade' or 'none'
			prevSpeed  : 250,
			prevEasing : 'swing',
			prevMethod : 'changeOut',

			// Enable default helpers
			helpers : {
				overlay : true,
				title   : true
			},

			// Callbacks
			onCancel     : $.noop, // If canceling
			beforeLoad   : $.noop, // Before loading
			afterLoad    : $.noop, // After loading
			beforeShow   : $.noop, // Before changing in current item
			afterShow    : $.noop, // After opening
			beforeChange : $.noop, // Before changing gallery item
			beforeClose  : $.noop, // Before closing
			afterClose   : $.noop  // After closing
		},

		//Current state
		group    : {}, // Selected group
		opts     : {}, // Group options
		previous : null,  // Previous element
		coming   : null,  // Element being loaded
		current  : null,  // Currently loaded element
		isActive : false, // Is activated
		isOpen   : false, // Is currently open
		isOpened : false, // Have been fully opened at least once

		wrap  : null,
		skin  : null,
		outer : null,
		inner : null,

		player : {
			timer    : null,
			isActive : false
		},

		// Loaders
		ajaxLoad   : null,
		imgPreload : null,

		// Some collections
		transitions : {},
		helpers     : {},

		/*
		 *	Static methods
		 */

		open: function (group, opts) {
			if (!group) {
				return;
			}

			if (!$.isPlainObject(opts)) {
				opts = {};
			}

			// Close if already active
			if (false === F.close(true)) {
				return;
			}

			// Normalize group
			if (!$.isArray(group)) {
				group = isQuery(group) ? $(group).get() : [group];
			}

			// Recheck if the type of each element is `object` and set content type (image, ajax, etc)
			$.each(group, function(i, element) {
				var obj = {},
					href,
					title,
					content,
					type,
					rez,
					hrefParts,
					selector;

				if ($.type(element) === "object") {
					// Check if is DOM element
					if (element.nodeType) {
						element = $(element);
					}

					if (isQuery(element)) {
						obj = {
							href    : element.data('fancybox-href') || element.attr('href'),
							title   : element.data('fancybox-title') || element.attr('title'),
							isDom   : true,
							element : element
						};

						if ($.metadata) {
							$.extend(true, obj, element.metadata());
						}

					} else {
						obj = element;
					}
				}

				href  = opts.href  || obj.href || (isString(element) ? element : null);
				title = opts.title !== undefined ? opts.title : obj.title || '';

				content = opts.content || obj.content;
				type    = content ? 'html' : (opts.type  || obj.type);

				if (!type && obj.isDom) {
					type = element.data('fancybox-type');

					if (!type) {
						rez  = element.prop('class').match(/fancybox\.(\w+)/);
						type = rez ? rez[1] : null;
					}
				}

				if (isString(href)) {
					// Try to guess the content type
					if (!type) {
						if (F.isImage(href)) {
							type = 'image';

						} else if (F.isSWF(href)) {
							type = 'swf';

						} else if (href.charAt(0) === '#') {
							type = 'inline';

						} else if (isString(element)) {
							type    = 'html';
							content = element;
						}
					}

					// Split url into two pieces with source url and content selector, e.g,
					// "/mypage.html #my_id" will load "/mypage.html" and display element having id "my_id"
					if (type === 'ajax') {
						hrefParts = href.split(/\s+/, 2);
						href      = hrefParts.shift();
						selector  = hrefParts.shift();
					}
				}

				if (!content) {
					if (type === 'inline') {
						if (href) {
							content = $( isString(href) ? href.replace(/.*(?=#[^\s]+$)/, '') : href ); //strip for ie7

						} else if (obj.isDom) {
							content = element;
						}

					} else if (type === 'html') {
						content = href;

					} else if (!type && !href && obj.isDom) {
						type    = 'inline';
						content = element;
					}
				}

				$.extend(obj, {
					href     : href,
					type     : type,
					content  : content,
					title    : title,
					selector : selector
				});

				group[ i ] = obj;
			});

			// Extend the defaults
			F.opts = $.extend(true, {}, F.defaults, opts);

			// All options are merged recursive except keys
			if (opts.keys !== undefined) {
				F.opts.keys = opts.keys ? $.extend({}, F.defaults.keys, opts.keys) : false;
			}

			F.group = group;

			return F._start(F.opts.index);
		},

		// Cancel image loading or abort ajax request
		cancel: function () {
			var coming = F.coming;

			if (!coming || false === F.trigger('onCancel')) {
				return;
			}

			F.hideLoading();

			if (F.ajaxLoad) {
				F.ajaxLoad.abort();
			}

			F.ajaxLoad = null;

			if (F.imgPreload) {
				F.imgPreload.onload = F.imgPreload.onerror = null;
			}

			if (coming.wrap) {
				coming.wrap.stop(true, true).trigger('onReset').remove();
			}

			F.coming = null;

			// If the first item has been canceled, then clear everything
			if (!F.current) {
				F._afterZoomOut( coming );
			}
		},

		// Start closing animation if is open; remove immediately if opening/closing
		close: function (event) {
			F.cancel();

			if (false === F.trigger('beforeClose')) {
				return;
			}

			F.unbindEvents();

			if (!F.isActive) {
				return;
			}

			if (!F.isOpen || event === true) {
				$('.fancybox-wrap').stop(true).trigger('onReset').remove();

				F._afterZoomOut();

			} else {
				F.isOpen = F.isOpened = false;
				F.isClosing = true;

				$('.fancybox-item, .fancybox-nav').remove();

				F.wrap.stop(true, true).removeClass('fancybox-opened');

				F.transitions[ F.current.closeMethod ]();
			}
		},

		// Manage slideshow:
		//   $.fancybox.play(); - toggle slideshow
		//   $.fancybox.play( true ); - start
		//   $.fancybox.play( false ); - stop
		play: function ( action ) {
			var clear = function () {
					clearTimeout(F.player.timer);
				},
				set = function () {
					clear();

					if (F.current && F.player.isActive) {
						F.player.timer = setTimeout(F.next, F.current.playSpeed);
					}
				},
				stop = function () {
					clear();

					D.unbind('.player');

					F.player.isActive = false;

					F.trigger('onPlayEnd');
				},
				start = function () {
					if (F.current && (F.current.loop || F.current.index < F.group.length - 1)) {
						F.player.isActive = true;

						D.bind({
							'onCancel.player beforeClose.player' : stop,
							'onUpdate.player'   : set,
							'beforeLoad.player' : clear
						});

						set();

						F.trigger('onPlayStart');
					}
				};

			if (action === true || (!F.player.isActive && action !== false)) {
				start();
			} else {
				stop();
			}
		},

		// Navigate to next gallery item
		next: function ( direction ) {
			var current = F.current;

			if (current) {
				if (!isString(direction)) {
					direction = current.direction.next;
				}

				F.jumpto(current.index + 1, direction, 'next');
			}
		},

		// Navigate to previous gallery item
		prev: function ( direction ) {
			var current = F.current;

			if (current) {
				if (!isString(direction)) {
					direction = current.direction.prev;
				}

				F.jumpto(current.index - 1, direction, 'prev');
			}
		},

		// Navigate to gallery item by index
		jumpto: function ( index, direction, router ) {
			var current = F.current;

			if (!current) {
				return;
			}

			index = getScalar(index);

			F.direction = direction || current.direction[ (index >= current.index ? 'next' : 'prev') ];
			F.router    = router || 'jumpto';

			if (current.loop) {
				if (index < 0) {
					index = current.group.length + (index % current.group.length);
				}

				index = index % current.group.length;
			}

			if (current.group[ index ] !== undefined) {
				F.cancel();

				F._start(index);
			}
		},

		// Center inside viewport and toggle position type to fixed or absolute if needed
		reposition: function (e, onlyAbsolute) {
			var current = F.current,
				wrap    = current ? current.wrap : null,
				pos;

			if (wrap) {
				pos = F._getPosition(onlyAbsolute);

				if (e && e.type === 'scroll') {
					delete pos.position;

					wrap.stop(true, true).animate(pos, 200);

				} else {
					wrap.css(pos);

					current.pos = $.extend({}, current.dim, pos);
				}
			}
		},

		update: function (e) {
			var type = (e && e.type),
				anyway = !type || type === 'orientationchange';

			if (anyway) {
				clearTimeout(didUpdate);

				didUpdate = null;
			}

			if (!F.isOpen || didUpdate) {
				return;
			}

			didUpdate = setTimeout(function() {
				var current = F.current;

				if (!current || F.isClosing) {
					return;
				}

				F.wrap.removeClass('fancybox-tmp');

				if (anyway || type === 'load' || (type === 'resize' && current.autoResize)) {
					F._setDimension();
				}

				if (!(type === 'scroll' && current.canShrink)) {
					F.reposition(e);
				}

				F.trigger('onUpdate');

				didUpdate = null;

			}, (anyway && !isTouch ? 0 : 300));
		},

		// Shrink content to fit inside viewport or restore if resized
		toggle: function ( action ) {
			if (F.isOpen) {
				F.current.fitToView = $.type(action) === "boolean" ? action : !F.current.fitToView;

				// Help browser to restore document dimensions
				if (isTouch) {
					F.wrap.removeAttr('style').addClass('fancybox-tmp');

					F.trigger('onUpdate');
				}

				F.update();
			}
		},

		hideLoading: function () {
			D.unbind('.loading');

			$('#fancybox-loading').remove();
		},

		showLoading: function () {
			var el, viewport;

			F.hideLoading();

			el = $('<div id="fancybox-loading"><div></div></div>').click(F.cancel).appendTo('body');

			// If user will press the escape-button, the request will be canceled
			D.bind('keydown.loading', function(e) {
				if ((e.which || e.keyCode) === 27) {
					e.preventDefault();

					F.cancel();
				}
			});

			if (!F.defaults.fixed) {
				viewport = F.getViewport();

				el.css({
					position : 'absolute',
					top  : (viewport.h * 0.5) + viewport.y,
					left : (viewport.w * 0.5) + viewport.x
				});
			}
		},

		getViewport: function () {
			var locked = (F.current && F.current.locked) || false,
				rez    = {
					x: W.scrollLeft(),
					y: W.scrollTop()
				};

			if (locked) {
				rez.w = locked[0].clientWidth;
				rez.h = locked[0].clientHeight;

			} else {
				// See http://bugs.jquery.com/ticket/6724
				rez.w = isTouch && window.innerWidth  ? window.innerWidth  : W.width();
				rez.h = isTouch && window.innerHeight ? window.innerHeight : W.height();
			}

			return rez;
		},

		// Unbind the keyboard / clicking actions
		unbindEvents: function () {
			if (F.wrap && isQuery(F.wrap)) {
				F.wrap.unbind('.fb');
			}

			D.unbind('.fb');
			W.unbind('.fb');
		},

		bindEvents: function () {
			var current = F.current,
				keys;

			if (!current) {
				return;
			}

			// Changing document height on iOS devices triggers a 'resize' event,
			// that can change document height... repeating infinitely
			W.bind('orientationchange.fb' + (isTouch ? '' : ' resize.fb') + (current.autoCenter && !current.locked ? ' scroll.fb' : ''), F.update);

			keys = current.keys;

			if (keys) {
				D.bind('keydown.fb', function (e) {
					var code   = e.which || e.keyCode,
						target = e.target || e.srcElement;

					// Skip esc key if loading, because showLoading will cancel preloading
					if (code === 27 && F.coming) {
						return false;
					}

					// Ignore key combinations and key events within form elements
					if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && !(target && (target.type || $(target).is('[contenteditable]')))) {
						$.each(keys, function(i, val) {
							if (current.group.length > 1 && val[ code ] !== undefined) {
								F[ i ]( val[ code ] );

								e.preventDefault();
								return false;
							}

							if ($.inArray(code, val) > -1) {
								F[ i ] ();

								e.preventDefault();
								return false;
							}
						});
					}
				});
			}

			if ($.fn.mousewheel && current.mouseWheel) {
				F.wrap.bind('mousewheel.fb', function (e, delta, deltaX, deltaY) {
					var target = e.target || null,
						parent = $(target),
						canScroll = false;

					while (parent.length) {
						if (canScroll || parent.is('.fancybox-skin') || parent.is('.fancybox-wrap')) {
							break;
						}

						canScroll = isScrollable( parent[0] );
						parent    = $(parent).parent();
					}

					if (delta !== 0 && !canScroll) {
						if (F.group.length > 1 && !current.canShrink) {
							if (deltaY > 0 || deltaX > 0) {
								F.prev( deltaY > 0 ? 'down' : 'left' );

							} else if (deltaY < 0 || deltaX < 0) {
								F.next( deltaY < 0 ? 'up' : 'right' );
							}

							e.preventDefault();
						}
					}
				});
			}
		},

		trigger: function (event, o) {
			var ret, obj = o || F.coming || F.current;

			if (!obj) {
				return;
			}

			if ($.isFunction( obj[event] )) {
				ret = obj[event].apply(obj, Array.prototype.slice.call(arguments, 1));
			}

			if (ret === false) {
				return false;
			}

			if (obj.helpers) {
				$.each(obj.helpers, function (helper, opts) {
					if (opts && F.helpers[helper] && $.isFunction(F.helpers[helper][event])) {
						F.helpers[helper][event]($.extend(true, {}, F.helpers[helper].defaults, opts), obj);
					}
				});
			}

			D.trigger(event);
		},

		isImage: function (str) {
			return isString(str) && str.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i);
		},

		isSWF: function (str) {
			return isString(str) && str.match(/\.(swf)((\?|#).*)?$/i);
		},

		_start: function (index) {
			var coming = {},
				obj,
				href,
				type,
				margin,
				padding;

			index = getScalar( index );
			obj   = F.group[ index ] || null;

			if (!obj) {
				return false;
			}

			coming = $.extend(true, {}, F.opts, obj);

			// Convert margin and padding properties to array - top, right, bottom, left
			margin  = coming.margin;
			padding = coming.padding;

			if ($.type(margin) === 'number') {
				coming.margin = [margin, margin, margin, margin];
			}

			if ($.type(padding) === 'number') {
				coming.padding = [padding, padding, padding, padding];
			}

			// 'modal' propery is just a shortcut
			if (coming.modal) {
				$.extend(true, coming, {
					closeBtn   : false,
					closeClick : false,
					nextClick  : false,
					arrows     : false,
					mouseWheel : false,
					keys       : null,
					helpers: {
						overlay : {
							closeClick : false
						}
					}
				});
			}

			// 'autoSize' property is a shortcut, too
			if (coming.autoSize) {
				coming.autoWidth = coming.autoHeight = true;
			}

			if (coming.width === 'auto') {
				coming.autoWidth = true;
			}

			if (coming.height === 'auto') {
				coming.autoHeight = true;
			}

			/*
			 * Add reference to the group, so it`s possible to access from callbacks, example:
			 * afterLoad : function() {
			 *     this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
			 * }
			 */

			coming.group  = F.group;
			coming.index  = index;

			// Give a chance for callback or helpers to update coming item (type, title, etc)
			F.coming = coming;

			if (false === F.trigger('beforeLoad')) {
				F.coming = null;

				return;
			}

			type = coming.type;
			href = coming.href;

			if (!type) {
				F.coming = null;

				//If we can not determine content type then drop silently or display next/prev item if looping through gallery
				if (F.current && F.router && F.router !== 'jumpto') {
					F.current.index = index;

					return F[ F.router ]( F.direction );
				}

				return false;
			}

			F.isActive = true;

			if (type === 'image' || type === 'swf') {
				coming.autoHeight = coming.autoWidth = false;
				coming.scrolling  = 'visible';
			}

			if (type === 'image') {
				coming.aspectRatio = true;
			}

			if (type === 'iframe' && isTouch) {
				coming.scrolling = 'scroll';
			}

			// Build the neccessary markup
			coming.wrap = $(coming.tpl.wrap).addClass('fancybox-' + (isTouch ? 'mobile' : 'desktop') + ' fancybox-type-' + type + ' fancybox-tmp ' + coming.wrapCSS).appendTo( coming.parent || 'body' );

			$.extend(coming, {
				skin  : $('.fancybox-skin',  coming.wrap),
				outer : $('.fancybox-outer', coming.wrap),
				inner : $('.fancybox-inner', coming.wrap)
			});

			$.each(["Top", "Right", "Bottom", "Left"], function(i, v) {
				coming.skin.css('padding' + v, getValue(coming.padding[ i ]));
			});

			F.trigger('onReady');

			// Check before try to load; 'inline' and 'html' types need content, others - href
			if (type === 'inline' || type === 'html') {
				if (!coming.content || !coming.content.length) {
					return F._error( 'content' );
				}

			} else if (!href) {
				return F._error( 'href' );
			}

			if (type === 'image') {
				F._loadImage();

			} else if (type === 'ajax') {
				F._loadAjax();

			} else if (type === 'iframe') {
				F._loadIframe();

			} else {
				F._afterLoad();
			}
		},

		_error: function ( type ) {
			$.extend(F.coming, {
				type       : 'html',
				autoWidth  : true,
				autoHeight : true,
				minWidth   : 0,
				minHeight  : 0,
				scrolling  : 'no',
				hasError   : type,
				content    : F.coming.tpl.error
			});

			F._afterLoad();
		},

		_loadImage: function () {
			// Reset preload image so it is later possible to check "complete" property
			var img = F.imgPreload = new Image();

			img.onload = function () {
				this.onload = this.onerror = null;

				F.coming.width  = this.width / F.opts.pixelRatio;
				F.coming.height = this.height / F.opts.pixelRatio;

				F._afterLoad();
			};

			img.onerror = function () {
				this.onload = this.onerror = null;

				F._error( 'image' );
			};

			img.src = F.coming.href;

			if (img.complete !== true) {
				F.showLoading();
			}
		},

		_loadAjax: function () {
			var coming = F.coming;

			F.showLoading();

			F.ajaxLoad = $.ajax($.extend({}, coming.ajax, {
				url: coming.href,
				error: function (jqXHR, textStatus) {
					if (F.coming && textStatus !== 'abort') {
						F._error( 'ajax', jqXHR );

					} else {
						F.hideLoading();
					}
				},
				success: function (data, textStatus) {
					if (textStatus === 'success') {
						coming.content = data;

						F._afterLoad();
					}
				}
			}));
		},

		_loadIframe: function() {
			var coming = F.coming,
				iframe = $(coming.tpl.iframe.replace(/\{rnd\}/g, new Date().getTime()))
					.attr('scrolling', isTouch ? 'auto' : coming.iframe.scrolling)
					.attr('src', coming.href);

			// This helps IE
			$(coming.wrap).bind('onReset', function () {
				try {
					$(this).find('iframe').hide().attr('src', '//about:blank').end().empty();
				} catch (e) {}
			});

			if (coming.iframe.preload) {
				F.showLoading();

				iframe.one('load', function() {
					$(this).data('ready', 1);

					// iOS will lose scrolling if we resize
					if (!isTouch) {
						$(this).bind('load.fb', F.update);
					}

					// Without this trick:
					//   - iframe won't scroll on iOS devices
					//   - IE7 sometimes displays empty iframe
					$(this).parents('.fancybox-wrap').width('100%').removeClass('fancybox-tmp').show();

					F._afterLoad();
				});
			}

			coming.content = iframe.appendTo( coming.inner );

			if (!coming.iframe.preload) {
				F._afterLoad();
			}
		},

		_preloadImages: function() {
			var group   = F.group,
				current = F.current,
				len     = group.length,
				cnt     = current.preload ? Math.min(current.preload, len - 1) : 0,
				item,
				i;

			for (i = 1; i <= cnt; i += 1) {
				item = group[ (current.index + i ) % len ];

				if (item.type === 'image' && item.href) {
					new Image().src = item.href;
				}
			}
		},

		_afterLoad: function () {
			var coming   = F.coming,
				previous = F.current,
				placeholder = 'fancybox-placeholder',
				current,
				content,
				type,
				scrolling,
				href,
				embed;

			F.hideLoading();

			if (!coming || F.isActive === false) {
				return;
			}

			if (false === F.trigger('afterLoad', coming, previous)) {
				coming.wrap.stop(true).trigger('onReset').remove();

				F.coming = null;

				return;
			}

			if (previous) {
				F.trigger('beforeChange', previous);

				previous.wrap.stop(true).removeClass('fancybox-opened')
					.find('.fancybox-item, .fancybox-nav')
					.remove();
			}

			F.unbindEvents();

			current   = coming;
			content   = coming.content;
			type      = coming.type;
			scrolling = coming.scrolling;

			$.extend(F, {
				wrap  : current.wrap,
				skin  : current.skin,
				outer : current.outer,
				inner : current.inner,
				current  : current,
				previous : previous
			});

			href = current.href;

			switch (type) {
				case 'inline':
				case 'ajax':
				case 'html':
					if (current.selector) {
						content = $('<div>').html(content).find(current.selector);

					} else if (isQuery(content)) {
						if (!content.data(placeholder)) {
							content.data(placeholder, $('<div class="' + placeholder + '"></div>').insertAfter( content ).hide() );
						}

						content = content.show().detach();

						current.wrap.bind('onReset', function () {
							if ($(this).find(content).length) {
								content.hide().replaceAll( content.data(placeholder) ).data(placeholder, false);
							}
						});
					}
				break;

				case 'image':
					content = current.tpl.image.replace('{href}', href);
				break;

				case 'swf':
					content = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + href + '"></param>';
					embed   = '';

					$.each(current.swf, function(name, val) {
						content += '<param name="' + name + '" value="' + val + '"></param>';
						embed   += ' ' + name + '="' + val + '"';
					});

					content += '<embed src="' + href + '" type="application/x-shockwave-flash" width="100%" height="100%"' + embed + '></embed></object>';
				break;
			}

			if (!(isQuery(content) && content.parent().is(current.inner))) {
				current.inner.append( content );
			}

			// Give a chance for helpers or callbacks to update elements
			F.trigger('beforeShow');

			// Set scrolling before calculating dimensions
			current.inner.css('overflow', scrolling === 'yes' ? 'scroll' : (scrolling === 'no' ? 'hidden' : scrolling));

			// Set initial dimensions and start position
			F._setDimension();

			F.reposition();

			F.isOpen = false;
			F.coming = null;

			F.bindEvents();

			if (!F.isOpened) {
				$('.fancybox-wrap').not( current.wrap ).stop(true).trigger('onReset').remove();

			} else if (previous.prevMethod) {
				F.transitions[ previous.prevMethod ]();
			}

			F.transitions[ F.isOpened ? current.nextMethod : current.openMethod ]();

			F._preloadImages();
		},

		_setDimension: function () {
			var viewport   = F.getViewport(),
				steps      = 0,
				canShrink  = false,
				canExpand  = false,
				wrap       = F.wrap,
				skin       = F.skin,
				inner      = F.inner,
				current    = F.current,
				width      = current.width,
				height     = current.height,
				minWidth   = current.minWidth,
				minHeight  = current.minHeight,
				maxWidth   = current.maxWidth,
				maxHeight  = current.maxHeight,
				scrolling  = current.scrolling,
				scrollOut  = current.scrollOutside ? current.scrollbarWidth : 0,
				margin     = current.margin,
				wMargin    = getScalar(margin[1] + margin[3]),
				hMargin    = getScalar(margin[0] + margin[2]),
				wPadding,
				hPadding,
				wSpace,
				hSpace,
				origWidth,
				origHeight,
				origMaxWidth,
				origMaxHeight,
				ratio,
				width_,
				height_,
				maxWidth_,
				maxHeight_,
				iframe,
				body;

			// Reset dimensions so we could re-check actual size
			wrap.add(skin).add(inner).width('auto').height('auto').removeClass('fancybox-tmp');

			wPadding = getScalar(skin.outerWidth(true)  - skin.width());
			hPadding = getScalar(skin.outerHeight(true) - skin.height());

			// Any space between content and viewport (margin, padding, border, title)
			wSpace = wMargin + wPadding;
			hSpace = hMargin + hPadding;

			origWidth  = isPercentage(width)  ? (viewport.w - wSpace) * getScalar(width)  / 100 : width;
			origHeight = isPercentage(height) ? (viewport.h - hSpace) * getScalar(height) / 100 : height;

			if (current.type === 'iframe') {
				iframe = current.content;

				if (current.autoHeight && iframe.data('ready') === 1) {
					try {
						if (iframe[0].contentWindow.document.location) {
							inner.width( origWidth ).height(9999);

							body = iframe.contents().find('body');

							if (scrollOut) {
								body.css('overflow-x', 'hidden');
							}

							origHeight = body.outerHeight(true);
						}

					} catch (e) {}
				}

			} else if (current.autoWidth || current.autoHeight) {
				inner.addClass( 'fancybox-tmp' );

				// Set width or height in case we need to calculate only one dimension
				if (!current.autoWidth) {
					inner.width( origWidth );
				}

				if (!current.autoHeight) {
					inner.height( origHeight );
				}

				if (current.autoWidth) {
					origWidth = inner.width();
				}

				if (current.autoHeight) {
					origHeight = inner.height();
				}

				inner.removeClass( 'fancybox-tmp' );
			}

			width  = getScalar( origWidth );
			height = getScalar( origHeight );

			ratio  = origWidth / origHeight;

			// Calculations for the content
			minWidth  = getScalar(isPercentage(minWidth) ? getScalar(minWidth, 'w') - wSpace : minWidth);
			maxWidth  = getScalar(isPercentage(maxWidth) ? getScalar(maxWidth, 'w') - wSpace : maxWidth);

			minHeight = getScalar(isPercentage(minHeight) ? getScalar(minHeight, 'h') - hSpace : minHeight);
			maxHeight = getScalar(isPercentage(maxHeight) ? getScalar(maxHeight, 'h') - hSpace : maxHeight);

			// These will be used to determine if wrap can fit in the viewport
			origMaxWidth  = maxWidth;
			origMaxHeight = maxHeight;

			if (current.fitToView) {
				maxWidth  = Math.min(viewport.w - wSpace, maxWidth);
				maxHeight = Math.min(viewport.h - hSpace, maxHeight);
			}

			maxWidth_  = viewport.w - wMargin;
			maxHeight_ = viewport.h - hMargin;

			if (current.aspectRatio) {
				if (width > maxWidth) {
					width  = maxWidth;
					height = getScalar(width / ratio);
				}

				if (height > maxHeight) {
					height = maxHeight;
					width  = getScalar(height * ratio);
				}

				if (width < minWidth) {
					width  = minWidth;
					height = getScalar(width / ratio);
				}

				if (height < minHeight) {
					height = minHeight;
					width  = getScalar(height * ratio);
				}

			} else {
				width = Math.max(minWidth, Math.min(width, maxWidth));

				if (current.autoHeight && current.type !== 'iframe') {
					inner.width( width );

					height = inner.height();
				}

				height = Math.max(minHeight, Math.min(height, maxHeight));
			}

			// Try to fit inside viewport (including the title)
			if (current.fitToView) {
				inner.width( width ).height( height );

				wrap.width( width + wPadding );

				// Real wrap dimensions
				width_  = wrap.width();
				height_ = wrap.height();

				if (current.aspectRatio) {
					while ((width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
						if (steps++ > 19) {
							break;
						}

						height = Math.max(minHeight, Math.min(maxHeight, height - 10));
						width  = getScalar(height * ratio);

						if (width < minWidth) {
							width  = minWidth;
							height = getScalar(width / ratio);
						}

						if (width > maxWidth) {
							width  = maxWidth;
							height = getScalar(width / ratio);
						}

						inner.width( width ).height( height );

						wrap.width( width + wPadding );

						width_  = wrap.width();
						height_ = wrap.height();
					}

				} else {
					width  = Math.max(minWidth,  Math.min(width,  width  - (width_  - maxWidth_)));
					height = Math.max(minHeight, Math.min(height, height - (height_ - maxHeight_)));
				}
			}

			if (scrollOut && scrolling === 'auto' && height < origHeight && (width + wPadding + scrollOut) < maxWidth_) {
				width += scrollOut;
			}

			inner.width( width ).height( height );

			wrap.width( width + wPadding );

			width_  = wrap.width();
			height_ = wrap.height();

			canShrink = (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight;
			canExpand = current.aspectRatio ? (width < origMaxWidth && height < origMaxHeight && width < origWidth && height < origHeight) : ((width < origMaxWidth || height < origMaxHeight) && (width < origWidth || height < origHeight));

			$.extend(current, {
				dim : {
					width	: getValue( width_ ),
					height	: getValue( height_ )
				},
				origWidth  : origWidth,
				origHeight : origHeight,
				canShrink  : canShrink,
				canExpand  : canExpand,
				wPadding   : wPadding,
				hPadding   : hPadding,
				wrapSpace  : height_ - skin.outerHeight(true),
				skinSpace  : skin.height() - height
			});

			if (!iframe && current.autoHeight && height > minHeight && height < maxHeight && !canExpand) {
				inner.height('auto');
			}
		},

		_getPosition: function (onlyAbsolute) {
			var current  = F.current,
				viewport = F.getViewport(),
				margin   = current.margin,
				width    = F.wrap.width()  + margin[1] + margin[3],
				height   = F.wrap.height() + margin[0] + margin[2],
				rez      = {
					position: 'absolute',
					top  : margin[0],
					left : margin[3]
				};

			if (current.autoCenter && current.fixed && !onlyAbsolute && height <= viewport.h && width <= viewport.w) {
				rez.position = 'fixed';

			} else if (!current.locked) {
				rez.top  += viewport.y;
				rez.left += viewport.x;
			}

			rez.top  = getValue(Math.max(rez.top,  rez.top  + ((viewport.h - height) * current.topRatio)));
			rez.left = getValue(Math.max(rez.left, rez.left + ((viewport.w - width)  * current.leftRatio)));

			return rez;
		},

		_afterZoomIn: function () {
			var current = F.current;

			if (!current) {
				return;
			}

			F.isOpen = F.isOpened = true;

			F.wrap.css('overflow', 'visible').addClass('fancybox-opened');

			F.update();

			// Assign a click event
			if ( current.closeClick || (current.nextClick && F.group.length > 1) ) {
				F.inner.css('cursor', 'pointer').bind('click.fb', function(e) {
					if (!$(e.target).is('a') && !$(e.target).parent().is('a')) {
						e.preventDefault();

						F[ current.closeClick ? 'close' : 'next' ]();
					}
				});
			}

			// Create a close button
			if (current.closeBtn) {
				$(current.tpl.closeBtn).appendTo(F.skin).bind('click.fb', function(e) {
					e.preventDefault();

					F.close();
				});
			}

			// Create navigation arrows
			if (current.arrows && F.group.length > 1) {
				if (current.loop || current.index > 0) {
					$(current.tpl.prev).appendTo(F.outer).bind('click.fb', F.prev);
				}

				if (current.loop || current.index < F.group.length - 1) {
					$(current.tpl.next).appendTo(F.outer).bind('click.fb', F.next);
				}
			}

			F.trigger('afterShow');

			// Stop the slideshow if this is the last item
			if (!current.loop && current.index === current.group.length - 1) {
				F.play( false );

			} else if (F.opts.autoPlay && !F.player.isActive) {
				F.opts.autoPlay = false;

				F.play();
			}
		},

		_afterZoomOut: function ( obj ) {
			obj = obj || F.current;

			$('.fancybox-wrap').trigger('onReset').remove();

			$.extend(F, {
				group  : {},
				opts   : {},
				router : false,
				current   : null,
				isActive  : false,
				isOpened  : false,
				isOpen    : false,
				isClosing : false,
				wrap   : null,
				skin   : null,
				outer  : null,
				inner  : null
			});

			F.trigger('afterClose', obj);
		}
	});

	/*
	 *	Default transitions
	 */

	F.transitions = {
		getOrigPosition: function () {
			var current  = F.current,
				element  = current.element,
				orig     = current.orig,
				pos      = {},
				width    = 50,
				height   = 50,
				hPadding = current.hPadding,
				wPadding = current.wPadding,
				viewport = F.getViewport();

			if (!orig && current.isDom && element.is(':visible')) {
				orig = element.find('img:first');

				if (!orig.length) {
					orig = element;
				}
			}

			if (isQuery(orig)) {
				pos = orig.offset();

				if (orig.is('img')) {
					width  = orig.outerWidth();
					height = orig.outerHeight();
				}

			} else {
				pos.top  = viewport.y + (viewport.h - height) * current.topRatio;
				pos.left = viewport.x + (viewport.w - width)  * current.leftRatio;
			}

			if (F.wrap.css('position') === 'fixed' || current.locked) {
				pos.top  -= viewport.y;
				pos.left -= viewport.x;
			}

			pos = {
				top     : getValue(pos.top  - hPadding * current.topRatio),
				left    : getValue(pos.left - wPadding * current.leftRatio),
				width   : getValue(width  + wPadding),
				height  : getValue(height + hPadding)
			};

			return pos;
		},

		step: function (now, fx) {
			var ratio,
				padding,
				value,
				prop       = fx.prop,
				current    = F.current,
				wrapSpace  = current.wrapSpace,
				skinSpace  = current.skinSpace;

			if (prop === 'width' || prop === 'height') {
				ratio = fx.end === fx.start ? 1 : (now - fx.start) / (fx.end - fx.start);

				if (F.isClosing) {
					ratio = 1 - ratio;
				}

				padding = prop === 'width' ? current.wPadding : current.hPadding;
				value   = now - padding;

				F.skin[ prop ](  getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) ) );
				F.inner[ prop ]( getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) - (skinSpace * ratio) ) );
			}
		},

		zoomIn: function () {
			var current  = F.current,
				startPos = current.pos,
				effect   = current.openEffect,
				elastic  = effect === 'elastic',
				endPos   = $.extend({opacity : 1}, startPos);

			// Remove "position" property that breaks older IE
			delete endPos.position;

			if (elastic) {
				startPos = this.getOrigPosition();

				if (current.openOpacity) {
					startPos.opacity = 0.1;
				}

			} else if (effect === 'fade') {
				startPos.opacity = 0.1;
			}

			F.wrap.css(startPos).animate(endPos, {
				duration : effect === 'none' ? 0 : current.openSpeed,
				easing   : current.openEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomIn
			});
		},

		zoomOut: function () {
			var current  = F.current,
				effect   = current.closeEffect,
				elastic  = effect === 'elastic',
				endPos   = {opacity : 0.1};

			if (elastic) {
				endPos = this.getOrigPosition();

				if (current.closeOpacity) {
					endPos.opacity = 0.1;
				}
			}

			F.wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : current.closeSpeed,
				easing   : current.closeEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomOut
			});
		},

		changeIn: function () {
			var current   = F.current,
				effect    = current.nextEffect,
				startPos  = current.pos,
				endPos    = { opacity : 1 },
				direction = F.direction,
				distance  = 200,
				field;

			startPos.opacity = 0.1;

			if (effect === 'elastic') {
				field = direction === 'down' || direction === 'up' ? 'top' : 'left';

				if (direction === 'down' || direction === 'right') {
					startPos[ field ] = getValue(getScalar(startPos[ field ]) - distance);
					endPos[ field ]   = '+=' + distance + 'px';

				} else {
					startPos[ field ] = getValue(getScalar(startPos[ field ]) + distance);
					endPos[ field ]   = '-=' + distance + 'px';
				}
			}

			// Workaround for http://bugs.jquery.com/ticket/12273
			if (effect === 'none') {
				F._afterZoomIn();

			} else {
				F.wrap.css(startPos).animate(endPos, {
					duration : current.nextSpeed,
					easing   : current.nextEasing,
					complete : F._afterZoomIn
				});
			}
		},

		changeOut: function () {
			var previous  = F.previous,
				effect    = previous.prevEffect,
				endPos    = { opacity : 0.1 },
				direction = F.direction,
				distance  = 200;

			if (effect === 'elastic') {
				endPos[ direction === 'down' || direction === 'up' ? 'top' : 'left' ] = ( direction === 'up' || direction === 'left' ? '-' : '+' ) + '=' + distance + 'px';
			}

			previous.wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : previous.prevSpeed,
				easing   : previous.prevEasing,
				complete : function () {
					$(this).trigger('onReset').remove();
				}
			});
		}
	};

	/*
	 *	Overlay helper
	 */

	F.helpers.overlay = {
		defaults : {
			closeClick : true,      // if true, fancyBox will be closed when user clicks on the overlay
			speedOut   : 200,       // duration of fadeOut animation
			showEarly  : true,      // indicates if should be opened immediately or wait until the content is ready
			css        : {},        // custom CSS properties
			locked     : !isTouch,  // if true, the content will be locked into overlay
			fixed      : true       // if false, the overlay CSS position property will not be set to "fixed"
		},

		overlay : null,      // current handle
		fixed   : false,     // indicates if the overlay has position "fixed"
		el      : $('html'), // element that contains "the lock"

		// Public methods
		create : function(opts) {
			opts = $.extend({}, this.defaults, opts);

			if (this.overlay) {
				this.close();
			}

			this.overlay = $('<div class="fancybox-overlay"></div>').appendTo( F.coming ? F.coming.parent : opts.parent );
			this.fixed   = false;

			if (opts.fixed && F.defaults.fixed) {
				this.overlay.addClass('fancybox-overlay-fixed');

				this.fixed = true;
			}
		},

		open : function(opts) {
			var that = this;

			opts = $.extend({}, this.defaults, opts);

			if (this.overlay) {
				this.overlay.unbind('.overlay').width('auto').height('auto');

			} else {
				this.create(opts);
			}

			if (!this.fixed) {
				W.bind('resize.overlay', $.proxy( this.update, this) );

				this.update();
			}

			if (opts.closeClick) {
				this.overlay.bind('click.overlay', function(e) {
					if ($(e.target).hasClass('fancybox-overlay')) {
						if (F.isActive) {
							F.close();
						} else {
							that.close();
						}

						return false;
					}
				});
			}

			this.overlay.css( opts.css ).show();
		},

		close : function() {
			var scrollV, scrollH;

			W.unbind('resize.overlay');

			if (this.el.hasClass('fancybox-lock')) {
				$('.fancybox-margin').removeClass('fancybox-margin');

				scrollV = W.scrollTop();
				scrollH = W.scrollLeft();

				this.el.removeClass('fancybox-lock');

				W.scrollTop( scrollV ).scrollLeft( scrollH );
			}

			$('.fancybox-overlay').remove().hide();

			$.extend(this, {
				overlay : null,
				fixed   : false
			});
		},

		// Private, callbacks

		update : function () {
			var width = '100%', offsetWidth;

			// Reset width/height so it will not mess
			this.overlay.width(width).height('100%');

			// jQuery does not return reliable result for IE
			if (IE) {
				offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);

				if (D.width() > offsetWidth) {
					width = D.width();
				}

			} else if (D.width() > W.width()) {
				width = D.width();
			}

			this.overlay.width(width).height(D.height());
		},

		// This is where we can manipulate DOM, because later it would cause iframes to reload
		onReady : function (opts, obj) {
			var overlay = this.overlay;

			$('.fancybox-overlay').stop(true, true);

			if (!overlay) {
				this.create(opts);
			}

			if (opts.locked && this.fixed && obj.fixed) {
				if (!overlay) {
					this.margin = D.height() > W.height() ? $('html').css('margin-right').replace("px", "") : false;
				}

				obj.locked = this.overlay.append( obj.wrap );
				obj.fixed  = false;
			}

			if (opts.showEarly === true) {
				this.beforeShow.apply(this, arguments);
			}
		},

		beforeShow : function(opts, obj) {
			var scrollV, scrollH;

			if (obj.locked) {
				if (this.margin !== false) {
					$('*').filter(function(){
						return ($(this).css('position') === 'fixed' && !$(this).hasClass("fancybox-overlay") && !$(this).hasClass("fancybox-wrap") );
					}).addClass('fancybox-margin');

					this.el.addClass('fancybox-margin');
				}

				scrollV = W.scrollTop();
				scrollH = W.scrollLeft();

				this.el.addClass('fancybox-lock');

				W.scrollTop( scrollV ).scrollLeft( scrollH );
			}

			this.open(opts);
		},

		onUpdate : function() {
			if (!this.fixed) {
				this.update();
			}
		},

		afterClose: function (opts) {
			// Remove overlay if exists and fancyBox is not opening
			// (e.g., it is not being open using afterClose callback)
			//if (this.overlay && !F.isActive) {
			if (this.overlay && !F.coming) {
				this.overlay.fadeOut(opts.speedOut, $.proxy( this.close, this ));
			}
		}
	};

	/*
	 *	Title helper
	 */

	F.helpers.title = {
		defaults : {
			type     : 'float', // 'float', 'inside', 'outside' or 'over',
			position : 'bottom' // 'top' or 'bottom'
		},

		beforeShow: function (opts) {
			var current = F.current,
				text    = current.title,
				type    = opts.type,
				title,
				target;

			if ($.isFunction(text)) {
				text = text.call(current.element, current);
			}

			if (!isString(text) || $.trim(text) === '') {
				return;
			}

			title = $('<div class="fancybox-title fancybox-title-' + type + '-wrap">' + text + '</div>');

			switch (type) {
				case 'inside':
					target = F.skin;
				break;

				case 'outside':
					target = F.wrap;
				break;

				case 'over':
					target = F.inner;
				break;

				default: // 'float'
					target = F.skin;

					title.appendTo('body');

					if (IE) {
						title.width( title.width() );
					}

					title.wrapInner('<span class="child"></span>');

					//Increase bottom margin so this title will also fit into viewport
					F.current.margin[2] += Math.abs( getScalar(title.css('margin-bottom')) );
				break;
			}

			title[ (opts.position === 'top' ? 'prependTo'  : 'appendTo') ](target);
		}
	};

	// jQuery plugin initialization
	$.fn.fancybox = function (options) {
		var index,
			that     = $(this),
			selector = this.selector || '',
			run      = function(e) {
				var what = $(this).blur(), idx = index, relType, relVal;

				if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) && !what.is('.fancybox-wrap')) {
					relType = options.groupAttr || 'data-fancybox-group';
					relVal  = what.attr(relType);

					if (!relVal) {
						relType = 'rel';
						relVal  = what.get(0)[ relType ];
					}

					if (relVal && relVal !== '' && relVal !== 'nofollow') {
						what = selector.length ? $(selector) : that;
						what = what.filter('[' + relType + '="' + relVal + '"]');
						idx  = what.index(this);
					}

					options.index = idx;

					// Stop an event from bubbling if everything is fine
					if (F.open(what, options) !== false) {
						e.preventDefault();
					}
				}
			};

		options = options || {};
		index   = options.index || 0;

		if (!selector || options.live === false) {
			that.unbind('click.fb-start').bind('click.fb-start', run);

		} else {
			D.undelegate(selector, 'click.fb-start').delegate(selector + ":not('.fancybox-item, .fancybox-nav')", 'click.fb-start', run);
		}

		this.filter('[data-fancybox-start=1]').trigger('click');

		return this;
	};

	// Tests that need a body at doc ready
	D.ready(function() {
		var w1, w2;

		if ( $.scrollbarWidth === undefined ) {
			// http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
			$.scrollbarWidth = function() {
				var parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body'),
					child  = parent.children(),
					width  = child.innerWidth() - child.height( 99 ).innerWidth();

				parent.remove();

				return width;
			};
		}

		if ( $.support.fixedPosition === undefined ) {
			$.support.fixedPosition = (function() {
				var elem  = $('<div style="position:fixed;top:20px;"></div>').appendTo('body'),
					fixed = ( elem[0].offsetTop === 20 || elem[0].offsetTop === 15 );

				elem.remove();

				return fixed;
			}());
		}

		$.extend(F.defaults, {
			scrollbarWidth : $.scrollbarWidth(),
			fixed  : $.support.fixedPosition,
			parent : $('body')
		});

		//Get real width of page scroll-bar
		w1 = $(window).width();

		H.addClass('fancybox-lock-test');

		w2 = $(window).width();

		H.removeClass('fancybox-lock-test');

		$("<style type='text/css'>.fancybox-margin{margin-right:" + (w2 - w1) + "px;}</style>").appendTo("head");
	});

}(window, document, jQuery));
/*!
 * Media helper for fancyBox
 * version: 1.0.6 (Fri, 14 Jun 2013)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: true
 *         }
 *     });
 *
 * Set custom URL parameters:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: {
 *                 youtube : {
 *                     params : {
 *                         autoplay : 0
 *                     }
 *                 }
 *             }
 *         }
 *     });
 *
 * Or:
 *     $(".fancybox").fancybox({,
 *         helpers : {
 *             media: true
 *         },
 *         youtube : {
 *             autoplay: 0
 *         }
 *     });
 *
 *  Supports:
 *
 *      Youtube
 *          http://www.youtube.com/watch?v=opj24KnzrWo
 *          http://www.youtube.com/embed/opj24KnzrWo
 *          http://youtu.be/opj24KnzrWo
 *			http://www.youtube-nocookie.com/embed/opj24KnzrWo
 *      Vimeo
 *          http://vimeo.com/40648169
 *          http://vimeo.com/channels/staffpicks/38843628
 *          http://vimeo.com/groups/surrealism/videos/36516384
 *          http://player.vimeo.com/video/45074303
 *      Metacafe
 *          http://www.metacafe.com/watch/7635964/dr_seuss_the_lorax_movie_trailer/
 *          http://www.metacafe.com/watch/7635964/
 *      Dailymotion
 *          http://www.dailymotion.com/video/xoytqh_dr-seuss-the-lorax-premiere_people
 *      Twitvid
 *          http://twitvid.com/QY7MD
 *      Twitpic
 *          http://twitpic.com/7p93st
 *      Instagram
 *          http://instagr.am/p/IejkuUGxQn/
 *          http://instagram.com/p/IejkuUGxQn/
 *      Google maps
 *          http://maps.google.com/maps?q=Eiffel+Tower,+Avenue+Gustave+Eiffel,+Paris,+France&t=h&z=17
 *          http://maps.google.com/?ll=48.857995,2.294297&spn=0.007666,0.021136&t=m&z=16
 *          http://maps.google.com/?ll=48.859463,2.292626&spn=0.000965,0.002642&t=m&z=19&layer=c&cbll=48.859524,2.292532&panoid=YJ0lq28OOy3VT2IqIuVY0g&cbp=12,151.58,,0,-15.56
 */
(function ($) {
	"use strict";

	//Shortcut for fancyBox object
	var F = $.fancybox,
		format = function( url, rez, params ) {
			params = params || '';

			if ( $.type( params ) === "object" ) {
				params = $.param(params, true);
			}

			$.each(rez, function(key, value) {
				url = url.replace( '$' + key, value || '' );
			});

			if (params.length) {
				url += ( url.indexOf('?') > 0 ? '&' : '?' ) + params;
			}

			return url;
		};

	//Add helper object
	F.helpers.media = {
		defaults : {
			youtube : {
				matcher : /(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*)).*/i,
				params  : {
					autoplay    : 1,
					autohide    : 1,
					fs          : 1,
					rel         : 0,
					hd          : 1,
					wmode       : 'opaque',
					enablejsapi : 1
				},
				type : 'iframe',
				url  : '//www.youtube.com/embed/$3'
			},
			vimeo : {
				matcher : /(?:vimeo(?:pro)?.com)\/(?:[^\d]+)?(\d+)(?:.*)/,
				params  : {
					autoplay      : 1,
					hd            : 1,
					show_title    : 1,
					show_byline   : 1,
					show_portrait : 0,
					fullscreen    : 1
				},
				type : 'iframe',
				url  : '//player.vimeo.com/video/$1'
			},
			metacafe : {
				matcher : /metacafe.com\/(?:watch|fplayer)\/([\w\-]{1,10})/,
				params  : {
					autoPlay : 'yes'
				},
				type : 'swf',
				url  : function( rez, params, obj ) {
					obj.swf.flashVars = 'playerVars=' + $.param( params, true );

					return '//www.metacafe.com/fplayer/' + rez[1] + '/.swf';
				}
			},
			dailymotion : {
				matcher : /dailymotion.com\/video\/(.*)\/?(.*)/,
				params  : {
					additionalInfos : 0,
					autoStart : 1
				},
				type : 'swf',
				url  : '//www.dailymotion.com/swf/video/$1'
			},
			twitvid : {
				matcher : /twitvid\.com\/([a-zA-Z0-9_\-\?\=]+)/i,
				params  : {
					autoplay : 0
				},
				type : 'iframe',
				url  : '//www.twitvid.com/embed.php?guid=$1'
			},
			twitpic : {
				matcher : /twitpic\.com\/(?!(?:place|photos|events)\/)([a-zA-Z0-9\?\=\-]+)/i,
				type : 'image',
				url  : '//twitpic.com/show/full/$1/'
			},
			instagram : {
				matcher : /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,
				type : 'image',
				url  : '//$1/p/$2/media/?size=l'
			},
			google_maps : {
				matcher : /maps\.google\.([a-z]{2,3}(\.[a-z]{2})?)\/(\?ll=|maps\?)(.*)/i,
				type : 'iframe',
				url  : function( rez ) {
					return '//maps.google.' + rez[1] + '/' + rez[3] + '' + rez[4] + '&output=' + (rez[4].indexOf('layer=c') > 0 ? 'svembed' : 'embed');
				}
			}
		},

		beforeLoad : function(opts, obj) {
			var url   = obj.href || '',
				type  = false,
				what,
				item,
				rez,
				params;

			for (what in opts) {
				if (opts.hasOwnProperty(what)) {
					item = opts[ what ];
					rez  = url.match( item.matcher );

					if (rez) {
						type   = item.type;
						params = $.extend(true, {}, item.params, obj[ what ] || ($.isPlainObject(opts[ what ]) ? opts[ what ].params : null));

						url = $.type( item.url ) === "function" ? item.url.call( this, rez, params, obj ) : format( item.url, rez, params );

						break;
					}
				}
			}

			if (type) {
				obj.href = url;
				obj.type = type;

				obj.autoHeight = false;
			}
		}
	};

}(jQuery));
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod);
		global.Impetus = mod.exports;
	}
})(this, function (exports, module) {
	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var stopThresholdDefault = 0.3;
	var bounceDeceleration = 0.04;
	var bounceAcceleration = 0.11;

	var Impetus = function Impetus(_ref) {
		var _ref$source = _ref.source;
		var sourceEl = _ref$source === undefined ? document : _ref$source;
		var updateCallback = _ref.update;
		var _ref$multiplier = _ref.multiplier;
		var multiplier = _ref$multiplier === undefined ? 1 : _ref$multiplier;
		var _ref$friction = _ref.friction;
		var friction = _ref$friction === undefined ? 0.92 : _ref$friction;
		var initialValues = _ref.initialValues;
		var boundX = _ref.boundX;
		var boundY = _ref.boundY;
		var _ref$bounce = _ref.bounce;
		var bounce = _ref$bounce === undefined ? true : _ref$bounce;

		_classCallCheck(this, Impetus);

		var boundXmin, boundXmax, boundYmin, boundYmax, pointerLastX, pointerLastY, pointerCurrentX, pointerCurrentY, pointerId, decVelX, decVelY;
		var targetX = 0;
		var targetY = 0;
		var stopThreshold = stopThresholdDefault * multiplier;
		var ticking = false;
		var pointerActive = false;
		var paused = false;
		var decelerating = false;
		var trackingPoints = [];

		/**
   * Initialize instance
   */
		(function init() {
			sourceEl = typeof sourceEl === 'string' ? document.querySelector(sourceEl) : sourceEl;
			if (!sourceEl) {
				throw new Error('IMPETUS: source not found.');
			}

			if (!updateCallback) {
				throw new Error('IMPETUS: update function not defined.');
			}

			if (initialValues) {
				if (initialValues[0]) {
					targetX = initialValues[0];
				}
				if (initialValues[1]) {
					targetY = initialValues[1];
				}
				callUpdateCallback();
			}

			// Initialize bound values
			if (boundX) {
				boundXmin = boundX[0];
				boundXmax = boundX[1];
			}
			if (boundY) {
				boundYmin = boundY[0];
				boundYmax = boundY[1];
			}

			sourceEl.addEventListener('touchstart', onDown);
			sourceEl.addEventListener('mousedown', onDown);
		})();

		/**
   * Disable movement processing
   * @public
   */
		this.pause = function () {
			pointerActive = false;
			paused = true;
		};

		/**
   * Enable movement processing
   * @public
   */
		this.resume = function () {
			paused = false;
		};

		/**
   * Update the current x and y values
   * @public
   * @param {Number} x
   * @param {Number} y
   */
		this.setValues = function (x, y) {
			if (typeof x === 'number') {
				targetX = x;
			}
			if (typeof y === 'number') {
				targetY = y;
			}
		};

		/**
   * Update the multiplier value
   * @public
   * @param {Number} val
   */
		this.setMultiplier = function (val) {
			multiplier = val;
			stopThreshold = stopThresholdDefault * multiplier;
		};

		/**
   * Executes the update function
   */
		function callUpdateCallback() {
			updateCallback.call(sourceEl, targetX, targetY);
		}

		/**
   * Creates a custom normalized event object from touch and mouse events
   * @param  {Event} ev
   * @returns {Object} with x, y, and id properties
   */
		function normalizeEvent(ev) {
			if (ev.type === 'touchmove' || ev.type === 'touchstart' || ev.type === 'touchend') {
				var touch = ev.targetTouches[0] || ev.changedTouches[0];
				return {
					x: touch.clientX,
					y: touch.clientY,
					id: touch.identifier
				};
			} else {
				// mouse events
				return {
					x: ev.clientX,
					y: ev.clientY,
					id: null
				};
			}
		}

		/**
   * Initializes movement tracking
   * @param  {Object} ev Normalized event
   */
		function onDown(ev) {
			var event = normalizeEvent(ev);
			if (!pointerActive && !paused) {
				pointerActive = true;
				decelerating = false;
				pointerId = event.id;

				pointerLastX = pointerCurrentX = event.x;
				pointerLastY = pointerCurrentY = event.y;
				trackingPoints = [];
				addTrackingPoint(pointerLastX, pointerLastY);

				document.addEventListener('touchmove', onMove);
				document.addEventListener('touchend', onUp);
				document.addEventListener('touchcancel', stopTracking);
				document.addEventListener('mousemove', onMove);
				document.addEventListener('mouseup', onUp);
			}
		}

		/**
   * Handles move events
   * @param  {Object} ev Normalized event
   */
		function onMove(ev) {
			ev.preventDefault();
			var event = normalizeEvent(ev);

			if (pointerActive && event.id === pointerId) {
				pointerCurrentX = event.x;
				pointerCurrentY = event.y;
				addTrackingPoint(pointerLastX, pointerLastY);
				requestTick();
			}
		}

		/**
   * Handles up/end events
   * @param {Object} ev Normalized event
   */
		function onUp(ev) {
			var event = normalizeEvent(ev);

			if (pointerActive && event.id === pointerId) {
				stopTracking();
			}
		}

		/**
   * Stops movement tracking, starts animation
   */
		function stopTracking() {
			pointerActive = false;
			addTrackingPoint(pointerLastX, pointerLastY);
			startDecelAnim();

			document.removeEventListener('touchmove', onMove);
			document.removeEventListener('touchend', onUp);
			document.removeEventListener('touchcancel', stopTracking);
			document.removeEventListener('mouseup', onUp);
			document.removeEventListener('mousemove', onMove);
		}

		/**
   * Records movement for the last 100ms
   * @param {number} x
   * @param {number} y [description]
   */
		function addTrackingPoint(x, y) {
			var time = Date.now();
			while (trackingPoints.length > 0) {
				if (time - trackingPoints[0].time <= 100) {
					break;
				}
				trackingPoints.shift();
			}

			trackingPoints.push({ x: x, y: y, time: time });
		}

		/**
   * Calculate new values, call update function
   */
		function updateAndRender() {
			var pointerChangeX = pointerCurrentX - pointerLastX;
			var pointerChangeY = pointerCurrentY - pointerLastY;

			targetX += pointerChangeX * multiplier;
			targetY += pointerChangeY * multiplier;

			if (bounce) {
				var diff = checkBounds();
				if (diff.x !== 0) {
					targetX -= pointerChangeX * dragOutOfBoundsMultiplier(diff.x) * multiplier;
				}
				if (diff.y !== 0) {
					targetY -= pointerChangeY * dragOutOfBoundsMultiplier(diff.y) * multiplier;
				}
			} else {
				checkBounds(true);
			}

			callUpdateCallback();

			pointerLastX = pointerCurrentX;
			pointerLastY = pointerCurrentY;
			ticking = false;
		}

		/**
   * Returns a value from around 0.5 to 1, based on distance
   * @param {Number} val
   */
		function dragOutOfBoundsMultiplier(val) {
			return 0.000005 * Math.pow(val, 2) + 0.0001 * val + 0.55;
		}

		/**
   * prevents animating faster than current framerate
   */
		function requestTick() {
			if (!ticking) {
				requestAnimFrame(updateAndRender);
			}
			ticking = true;
		}

		/**
   * Determine position relative to bounds
   * @param {Boolean} restrict Whether to restrict target to bounds
   */
		function checkBounds(restrict) {
			var xDiff = 0;
			var yDiff = 0;

			if (boundXmin !== undefined && targetX < boundXmin) {
				xDiff = boundXmin - targetX;
			} else if (boundXmax !== undefined && targetX > boundXmax) {
				xDiff = boundXmax - targetX;
			}

			if (boundYmin !== undefined && targetY < boundYmin) {
				yDiff = boundYmin - targetY;
			} else if (boundYmax !== undefined && targetY > boundYmax) {
				yDiff = boundYmax - targetY;
			}

			if (restrict) {
				if (xDiff !== 0) {
					targetX = xDiff > 0 ? boundXmin : boundXmax;
				}
				if (yDiff !== 0) {
					targetY = yDiff > 0 ? boundYmin : boundYmax;
				}
			}

			return {
				x: xDiff,
				y: yDiff,
				inBounds: xDiff === 0 && yDiff === 0
			};
		}

		/**
   * Initialize animation of values coming to a stop
   */
		function startDecelAnim() {
			var firstPoint = trackingPoints[0];
			var lastPoint = trackingPoints[trackingPoints.length - 1];

			var xOffset = lastPoint.x - firstPoint.x;
			var yOffset = lastPoint.y - firstPoint.y;
			var timeOffset = lastPoint.time - firstPoint.time;

			var D = timeOffset / 15 / multiplier;

			decVelX = xOffset / D || 0; // prevent NaN
			decVelY = yOffset / D || 0;

			var diff = checkBounds();

			if (Math.abs(decVelX) > 1 || Math.abs(decVelY) > 1 || !diff.inBounds) {
				decelerating = true;
				requestAnimFrame(stepDecelAnim);
			}
		}

		/**
   * Animates values slowing down
   */
		function stepDecelAnim() {
			if (!decelerating) {
				return;
			}

			decVelX *= friction;
			decVelY *= friction;

			targetX += decVelX;
			targetY += decVelY;

			var diff = checkBounds();

			if (Math.abs(decVelX) > stopThreshold || Math.abs(decVelY) > stopThreshold || !diff.inBounds) {

				if (bounce) {
					var reboundAdjust = 2.5;

					if (diff.x !== 0) {
						if (diff.x * decVelX <= 0) {
							decVelX += diff.x * bounceDeceleration;
						} else {
							var adjust = diff.x > 0 ? reboundAdjust : -reboundAdjust;
							decVelX = (diff.x + adjust) * bounceAcceleration;
						}
					}
					if (diff.y !== 0) {
						if (diff.y * decVelY <= 0) {
							decVelY += diff.y * bounceDeceleration;
						} else {
							var adjust = diff.y > 0 ? reboundAdjust : -reboundAdjust;
							decVelY = (diff.y + adjust) * bounceAcceleration;
						}
					}
				} else {
					if (diff.x !== 0) {
						if (diff.x > 0) {
							targetX = boundXmin;
						} else {
							targetX = boundXmax;
						}
						decVelX = 0;
					}
					if (diff.y !== 0) {
						if (diff.y > 0) {
							targetY = boundYmin;
						} else {
							targetY = boundYmax;
						}
						decVelY = 0;
					}
				}

				callUpdateCallback();

				requestAnimFrame(stepDecelAnim);
			} else {
				decelerating = false;
			}
		}
	}

	/**
  * @see http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  */
	;

	module.exports = Impetus;
	var requestAnimFrame = (function () {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
	})();
});

/* interact.js v1.2.6 | https://raw.github.com/taye/interact.js/master/LICENSE */ (function(F){function ma(){}function t(a){if(!a||"object"!==typeof a)return!1;var b=V(a)||q;return/object|function/.test(typeof b.Element)?a instanceof b.Element:1===a.nodeType&&"string"===typeof a.nodeName}function Ba(a){return a===q||!(!a||!a.Window)&&a instanceof a.Window}function da(a){return z(a)&&void 0!==typeof a.length&&A(a.splice)}function z(a){return!!a&&"object"===typeof a}function A(a){return"function"===typeof a}function K(a){return"number"===typeof a}function H(a){return"boolean"===
typeof a}function N(a){return"string"===typeof a}function ea(a){if(!N(a))return!1;Q.querySelector(a);return!0}function x(a,b){for(var c in b)a[c]=b[c];return a}function ra(a,b){for(var c in b){var d=!1,e;for(e in Ca)if(0===c.indexOf(e)&&Ca[e].test(c)){d=!0;break}d||(a[c]=b[c])}return a}function sa(a,b){a.page=a.page||{};a.page.x=b.page.x;a.page.y=b.page.y;a.client=a.client||{};a.client.x=b.client.x;a.client.y=b.client.y;a.timeStamp=b.timeStamp}function Ta(a,b,c){a.page.x=c.page.x-b.page.x;a.page.y=
c.page.y-b.page.y;a.client.x=c.client.x-b.client.x;a.client.y=c.client.y-b.client.y;a.timeStamp=(new Date).getTime()-b.timeStamp;b=Math.max(a.timeStamp/1E3,.001);a.page.speed=fa(a.page.x,a.page.y)/b;a.page.vx=a.page.x/b;a.page.vy=a.page.y/b;a.client.speed=fa(a.client.x,a.page.y)/b;a.client.vx=a.client.x/b;a.client.vy=a.client.y/b}function Ua(a){return a instanceof q.Event||ga&&q.Touch&&a instanceof q.Touch}function ta(a,b,c){c=c||{};a=a||"page";c.x=b[a+"X"];c.y=b[a+"Y"];return c}function Da(a,b){b=
b||{};Va&&Ua(a)?(ta("screen",a,b),b.x+=q.scrollX,b.y+=q.scrollY):ta("page",a,b);return b}function Wa(a,b){b=b||{};Va&&Ua(a)?ta("screen",a,b):ta("client",a,b);return b}function O(a){return K(a.pointerId)?a.pointerId:a.identifier}function Ea(a){return a instanceof nb?a.correspondingUseElement:a}function V(a){if(Ba(a))return a;a=a.ownerDocument||a;return a.defaultView||a.parentWindow||q}function Fa(a){return(a=a instanceof Xa?a.getBoundingClientRect():a.getClientRects()[0])&&{left:a.left,right:a.right,
top:a.top,bottom:a.bottom,width:a.width||a.right-a.left,height:a.height||a.bottom-a.top}}function ua(a){var b,c=Fa(a);!ob&&c&&(b=(b=V(a))||q,a=b.scrollX||b.document.documentElement.scrollLeft,b=b.scrollY||b.document.documentElement.scrollTop,c.left+=a,c.right+=a,c.top+=b,c.bottom+=b);return c}function Ga(a){var b=[];da(a)?(b[0]=a[0],b[1]=a[1]):"touchend"===a.type?1===a.touches.length?(b[0]=a.touches[0],b[1]=a.changedTouches[0]):0===a.touches.length&&(b[0]=a.changedTouches[0],b[1]=a.changedTouches[1]):
(b[0]=a.touches[0],b[1]=a.touches[1]);return b}function Ya(a){for(var b={pageX:0,pageY:0,clientX:0,clientY:0,screenX:0,screenY:0},c,d=0;d<a.length;d++)for(c in b)b[c]+=a[d][c];for(c in b)b[c]/=a.length;return b}function Ha(a){if(a.length||a.touches&&1<a.touches.length){a=Ga(a);var b=Math.min(a[0].pageX,a[1].pageX),c=Math.min(a[0].pageY,a[1].pageY);return{x:b,y:c,left:b,top:c,width:Math.max(a[0].pageX,a[1].pageX)-b,height:Math.max(a[0].pageY,a[1].pageY)-c}}}function Ia(a,b){b=b||D.deltaSource;var c=
b+"X",d=b+"Y",e=Ga(a);return fa(e[0][c]-e[1][c],e[0][d]-e[1][d])}function Ja(a,b,c){c=c||D.deltaSource;var d=c+"X";c+="Y";a=Ga(a);d=180*Math.atan((a[0][c]-a[1][c])/(a[0][d]-a[1][d]))/Math.PI;K(b)&&(b=(d-b)%360,315<b?d-=360+d/360|0:135<b?d-=180+d/360|0:-315>b?d+=360+d/360|0:-135>b&&(d+=180+d/360|0));return d}function na(a,b){var c=a?a.options.origin:D.origin;"parent"===c?c=L(b):"self"===c?c=a.getRect(b):ea(c)&&(c=Ka(b,c)||{x:0,y:0});A(c)&&(c=c(a&&b));t(c)&&(c=ua(c));c.x="x"in c?c.x:c.left;c.y="y"in
c?c.y:c.top;return c}function Za(a,b,c,d){var e=1-a;return e*e*b+2*e*a*c+a*a*d}function Y(a,b){for(;b;){if(b===a)return!0;b=b.parentNode}return!1}function Ka(a,b){for(var c=L(a);t(c);){if(R(c,b))return c;c=L(c)}return null}function L(a){if((a=a.parentNode)&&a instanceof $a)for(;(a=a.host)&&a&&a instanceof $a;);return a}function va(a,b){return a._context===b.ownerDocument||Y(a._context,b)}function Z(a,b,c){return(a=a.options.ignoreFrom)&&t(c)?N(a)?La(c,a,b):t(a)?Y(a,c):!1:!1}function aa(a,b,c){return(a=
a.options.allowFrom)?t(c)?N(a)?La(c,a,b):t(a)?Y(a,c):!1:!1:!0}function ab(a,b){if(!b)return!1;var c=b.options.drag.axis;return"xy"===a||"xy"===c||c===a}function Ma(a,b){var c=a.options;/^resize/.test(b)&&(b="resize");return c[b].snap&&c[b].snap.enabled}function Na(a,b){var c=a.options;/^resize/.test(b)&&(b="resize");return c[b].restrict&&c[b].restrict.enabled}function ha(a,b,c){for(var d=a.options,e=d[c.name].max,d=d[c.name].maxPerElement,h=0,f=0,g=0,k=0,y=r.length;k<y;k++){var n=r[k],u=n.prepared.name;
if(n.interacting()&&(h++,h>=wa||n.target===a&&(f+=u===c.name|0,f>=e||n.element===b&&(g++,u!==c.name||g>=d))))return!1}return 0<wa}function xa(){this.prevDropElement=this.prevDropTarget=this.dropElement=this.dropTarget=this.element=this.target=null;this.prepared={name:null,axis:null,edges:null};this.matches=[];this.matchElements=[];this.inertiaStatus={active:!1,smoothEnd:!1,ending:!1,startEvent:null,upCoords:{},xe:0,ye:0,sx:0,sy:0,t0:0,vx0:0,vys:0,duration:0,resumeDx:0,resumeDy:0,lambda_v0:0,one_ve_v0:0,
i:null};if(A(Function.prototype.bind))this.boundInertiaFrame=this.inertiaFrame.bind(this),this.boundSmoothEndFrame=this.smoothEndFrame.bind(this);else{var a=this;this.boundInertiaFrame=function(){return a.inertiaFrame()};this.boundSmoothEndFrame=function(){return a.smoothEndFrame()}}this.activeDrops={dropzones:[],elements:[],rects:[]};this.pointers=[];this.pointerIds=[];this.downTargets=[];this.downTimes=[];this.holdTimers=[];this.prevCoords={page:{x:0,y:0},client:{x:0,y:0},timeStamp:0};this.curCoords=
{page:{x:0,y:0},client:{x:0,y:0},timeStamp:0};this.startCoords={page:{x:0,y:0},client:{x:0,y:0},timeStamp:0};this.pointerDelta={page:{x:0,y:0,vx:0,vy:0,speed:0},client:{x:0,y:0,vx:0,vy:0,speed:0},timeStamp:0};this.downEvent=null;this.downPointer={};this.prevEvent=this._curEventTarget=this._eventTarget=null;this.tapTime=0;this.prevTap=null;this.startOffset={left:0,right:0,top:0,bottom:0};this.restrictOffset={left:0,right:0,top:0,bottom:0};this.snapOffsets=[];this.gesture={start:{x:0,y:0},startDistance:0,
prevDistance:0,distance:0,scale:1,startAngle:0,prevAngle:0};this.snapStatus={x:0,y:0,dx:0,dy:0,realX:0,realY:0,snappedX:0,snappedY:0,targets:[],locked:!1,changed:!1};this.restrictStatus={dx:0,dy:0,restrictedX:0,restrictedY:0,snap:null,restricted:!1,changed:!1};this.restrictStatus.snap=this.snapStatus;this.resizing=this.dragging=this.gesturing=this.pointerWasMoved=this.pointerIsDown=!1;this.resizeAxes="xy";this.mouse=!1;r.push(this)}function bb(a,b,c){var d=0,e=r.length,h=/mouse/i.test(a.pointerType||
b)||4===a.pointerType,f;a=O(a);if(/down|start/i.test(b))for(d=0;d<e;d++){f=r[d];var g=c;if(f.inertiaStatus.active&&f.target.options[f.prepared.name].inertia.allowResume&&f.mouse===h)for(;g;){if(g===f.element)return f;g=L(g)}}if(h||!ga&&!oa){for(d=0;d<e;d++)if(r[d].mouse&&!r[d].inertiaStatus.active)return r[d];for(d=0;d<e;d++)if(r[d].mouse&&(!/down/.test(b)||!r[d].inertiaStatus.active))return f;f=new xa;f.mouse=!0;return f}for(d=0;d<e;d++)if(-1!==v(r[d].pointerIds,a))return r[d];if(/up|end|out/i.test(b))return null;
for(d=0;d<e;d++)if(f=r[d],!(f.prepared.name&&!f.target.options.gesture.enabled||f.interacting()||!h&&f.mouse))return f;return new xa}function cb(a){return function(b){var c,d=Ea(b.path?b.path[0]:b.target),e=Ea(b.currentTarget),h;if(ga&&/touch/.test(b.type))for(db=(new Date).getTime(),h=0;h<b.changedTouches.length;h++){var f=b.changedTouches[h];if(c=bb(f,b.type,d))c._updateEventTargets(d,e),c[a](f,b,d,e)}else{if(!oa&&/mouse/.test(b.type)){for(h=0;h<r.length;h++)if(!r[h].mouse&&r[h].pointerIsDown)return;
if(500>(new Date).getTime()-db)return}if(c=bb(b,b.type,d))c._updateEventTargets(d,e),c[a](b,b,d,e)}}}function G(a,b,c,d,e,h){var f,g,k=a.target,y=a.snapStatus,n=a.restrictStatus,u=a.pointers,E=(k&&k.options||D).deltaSource,eb=E+"X",l=E+"Y",ia=k?k.options:D,w=na(k,e),m="start"===d,p="end"===d;f=m?a.startCoords:a.curCoords;e=e||a.element;g=x({},f.page);f=x({},f.client);g.x-=w.x;g.y-=w.y;f.x-=w.x;f.y-=w.y;var I=ia[c].snap&&ia[c].snap.relativePoints;!Ma(k,c)||m&&I&&I.length||(this.snap={range:y.range,
locked:y.locked,x:y.snappedX,y:y.snappedY,realX:y.realX,realY:y.realY,dx:y.dx,dy:y.dy},y.locked&&(g.x+=y.dx,g.y+=y.dy,f.x+=y.dx,f.y+=y.dy));!Na(k,c)||m&&ia[c].restrict.elementRect||!n.restricted||(g.x+=n.dx,g.y+=n.dy,f.x+=n.dx,f.y+=n.dy,this.restrict={dx:n.dx,dy:n.dy});this.pageX=g.x;this.pageY=g.y;this.clientX=f.x;this.clientY=f.y;this.x0=a.startCoords.page.x-w.x;this.y0=a.startCoords.page.y-w.y;this.clientX0=a.startCoords.client.x-w.x;this.clientY0=a.startCoords.client.y-w.y;this.ctrlKey=b.ctrlKey;
this.altKey=b.altKey;this.shiftKey=b.shiftKey;this.metaKey=b.metaKey;this.button=b.button;this.buttons=b.buttons;this.target=e;this.t0=a.downTimes[0];this.type=c+(d||"");this.interaction=a;this.interactable=k;e=a.inertiaStatus;e.active&&(this.detail="inertia");h&&(this.relatedTarget=h);p?"client"===E?(this.dx=f.x-a.startCoords.client.x,this.dy=f.y-a.startCoords.client.y):(this.dx=g.x-a.startCoords.page.x,this.dy=g.y-a.startCoords.page.y):m?this.dy=this.dx=0:"inertiastart"===d?(this.dx=a.prevEvent.dx,
this.dy=a.prevEvent.dy):"client"===E?(this.dx=f.x-a.prevEvent.clientX,this.dy=f.y-a.prevEvent.clientY):(this.dx=g.x-a.prevEvent.pageX,this.dy=g.y-a.prevEvent.pageY);a.prevEvent&&"inertia"===a.prevEvent.detail&&!e.active&&ia[c].inertia&&ia[c].inertia.zeroResumeDelta&&(e.resumeDx+=this.dx,e.resumeDy+=this.dy,this.dx=this.dy=0);"resize"===c&&a.resizeAxes?ia.resize.square?("y"===a.resizeAxes?this.dx=this.dy:this.dy=this.dx,this.axes="xy"):(this.axes=a.resizeAxes,"x"===a.resizeAxes?this.dy=0:"y"===a.resizeAxes&&
(this.dx=0)):"gesture"===c&&(this.touches=[u[0],u[1]],m?(this.distance=Ia(u,E),this.box=Ha(u),this.scale=1,this.ds=0,this.angle=Ja(u,void 0,E),this.da=0):p||b instanceof G?(this.distance=a.prevEvent.distance,this.box=a.prevEvent.box,this.scale=a.prevEvent.scale,this.ds=this.scale-1,this.angle=a.prevEvent.angle,this.da=this.angle-a.gesture.startAngle):(this.distance=Ia(u,E),this.box=Ha(u),this.scale=this.distance/a.gesture.startDistance,this.angle=Ja(u,a.gesture.prevAngle,E),this.ds=this.scale-a.gesture.prevScale,
this.da=this.angle-a.gesture.prevAngle));m?(this.timeStamp=a.downTimes[0],this.velocityY=this.velocityX=this.speed=this.duration=this.dt=0):"inertiastart"===d?(this.timeStamp=a.prevEvent.timeStamp,this.dt=a.prevEvent.dt,this.duration=a.prevEvent.duration,this.speed=a.prevEvent.speed,this.velocityX=a.prevEvent.velocityX,this.velocityY=a.prevEvent.velocityY):(this.timeStamp=(new Date).getTime(),this.dt=this.timeStamp-a.prevEvent.timeStamp,this.duration=this.timeStamp-a.downTimes[0],b instanceof G?(b=
this[eb]-a.prevEvent[eb],l=this[l]-a.prevEvent[l],c=this.dt/1E3,this.speed=fa(b,l)/c,this.velocityX=b/c,this.velocityY=l/c):(this.speed=a.pointerDelta[E].speed,this.velocityX=a.pointerDelta[E].vx,this.velocityY=a.pointerDelta[E].vy));(p||"inertiastart"===d)&&600<a.prevEvent.speed&&150>this.timeStamp-a.prevEvent.timeStamp&&(d=180*Math.atan2(a.prevEvent.velocityY,a.prevEvent.velocityX)/Math.PI,0>d&&(d+=360),p=112.5<=d&&247.5>d,l=202.5<=d&&337.5>d,this.swipe={up:l,down:!l&&22.5<=d&&157.5>d,left:p,right:!p&&
(292.5<=d||67.5>d),angle:d,speed:a.prevEvent.speed,velocity:{x:a.prevEvent.velocityX,y:a.prevEvent.velocityY}})}function fb(){this.originalEvent.preventDefault()}function gb(a){var b="";"drag"===a.name&&(b=za.drag);if("resize"===a.name)if(a.axis)b=za[a.name+a.axis];else if(a.edges){for(var b="resize",c=["top","bottom","left","right"],d=0;4>d;d++)a.edges[c[d]]&&(b+=c[d]);b=za[b]}return b}function hb(a,b,c){a=this.getRect(c);var d=!1,e=null,h=null,f,g=x({},b.curCoords.page),e=this.options;if(!a)return null;
if(S.resize&&e.resize.enabled)if(d=e.resize,f={left:!1,right:!1,top:!1,bottom:!1},z(d.edges)){for(var k in f){var y=f,n=k,u;a:{u=k;var E=d.edges[k],l=g,m=b._eventTarget,p=c,w=a,ya=d.margin||pa;if(E){if(!0===E){var q=K(w.width)?w.width:w.right-w.left,I=K(w.height)?w.height:w.bottom-w.top;0>q&&("left"===u?u="right":"right"===u&&(u="left"));0>I&&("top"===u?u="bottom":"bottom"===u&&(u="top"));if("left"===u){u=l.x<(0<=q?w.left:w.right)+ya;break a}if("top"===u){u=l.y<(0<=I?w.top:w.bottom)+ya;break a}if("right"===
u){u=l.x>(0<=q?w.right:w.left)-ya;break a}if("bottom"===u){u=l.y>(0<=I?w.bottom:w.top)-ya;break a}}u=t(m)?t(E)?E===m:La(m,E,p):!1}else u=!1}y[n]=u}f.left=f.left&&!f.right;f.top=f.top&&!f.bottom;d=f.left||f.right||f.top||f.bottom}else c="y"!==e.resize.axis&&g.x>a.right-pa,a="x"!==e.resize.axis&&g.y>a.bottom-pa,d=c||a,h=(c?"x":"")+(a?"y":"");e=d?"resize":S.drag&&e.drag.enabled?"drag":null;S.gesture&&2<=b.pointerIds.length&&!b.dragging&&!b.resizing&&(e="gesture");return e?{name:e,axis:h,edges:f}:null}
function W(a,b){if(!z(a))return null;var c=a.name,d=b.options;return("resize"===c&&d.resize.enabled||"drag"===c&&d.drag.enabled||"gesture"===c&&d.gesture.enabled)&&S[c]?a:null}function qa(a,b){var c={},d=P[a.type],e=Ea(a.path?a.path[0]:a.target),h=e;b=b?!0:!1;for(var f in a)c[f]=a[f];c.originalEvent=a;for(c.preventDefault=fb;t(h);){for(f=0;f<d.selectors.length;f++){var g=d.contexts[f];if(R(h,d.selectors[f])&&Y(g,e)&&Y(g,h)){g=d.listeners[f];c.currentTarget=h;for(var k=0;k<g.length;k++)if(g[k][1]===
b)g[k][0](c)}}h=L(h)}}function Aa(a){return qa.call(this,a,!0)}function l(a,b){return B.get(a,b)||new C(a,b)}function C(a,b){this._element=a;this._iEvents=this._iEvents||{};var c;if(ea(a)){this.selector=a;var d=b&&b.context;c=d?V(d):q;d&&(c.Node?d instanceof c.Node:t(d)||d===c.document)&&(this._context=d)}else c=V(a),t(a,c)&&(ba?(n.add(this._element,J.down,m.pointerDown),n.add(this._element,J.move,m.pointerHover)):(n.add(this._element,"mousedown",m.pointerDown),n.add(this._element,"mousemove",m.pointerHover),
n.add(this._element,"touchstart",m.pointerDown),n.add(this._element,"touchmove",m.pointerHover)));this._doc=c.document;-1===v(ja,this._doc)&&ib(this._doc);B.push(this);this.set(b)}function M(a,b){var c=!1;return function(){c||(q.console.warn(b),c=!0);return a.apply(this,arguments)}}function jb(a){for(var b=0;b<r.length;b++)r[b].pointerEnd(a,a)}function ib(a){if(-1===v(ja,a)){var b=a.defaultView||a.parentWindow,c;for(c in P)n.add(a,c,qa),n.add(a,c,Aa,!0);ba?(J=ba===b.MSPointerEvent?{up:"MSPointerUp",
down:"MSPointerDown",over:"mouseover",out:"mouseout",move:"MSPointerMove",cancel:"MSPointerCancel"}:{up:"pointerup",down:"pointerdown",over:"pointerover",out:"pointerout",move:"pointermove",cancel:"pointercancel"},n.add(a,J.down,m.selectorDown),n.add(a,J.move,m.pointerMove),n.add(a,J.over,m.pointerOver),n.add(a,J.out,m.pointerOut),n.add(a,J.up,m.pointerUp),n.add(a,J.cancel,m.pointerCancel),n.add(a,J.move,m.autoScrollMove)):(n.add(a,"mousedown",m.selectorDown),n.add(a,"mousemove",m.pointerMove),n.add(a,
"mouseup",m.pointerUp),n.add(a,"mouseover",m.pointerOver),n.add(a,"mouseout",m.pointerOut),n.add(a,"touchstart",m.selectorDown),n.add(a,"touchmove",m.pointerMove),n.add(a,"touchend",m.pointerUp),n.add(a,"touchcancel",m.pointerCancel),n.add(a,"mousemove",m.autoScrollMove),n.add(a,"touchmove",m.autoScrollMove));n.add(b,"blur",jb);try{if(b.frameElement){var d=b.frameElement.ownerDocument,e=d.defaultView;n.add(d,"mouseup",m.pointerEnd);n.add(d,"touchend",m.pointerEnd);n.add(d,"touchcancel",m.pointerEnd);
n.add(d,"pointerup",m.pointerEnd);n.add(d,"MSPointerUp",m.pointerEnd);n.add(e,"blur",jb)}}catch(h){l.windowParentError=h}n.add(a,"dragstart",function(a){for(var b=0;b<r.length;b++){var c=r[b];if(c.element&&(c.element===a.target||Y(c.element,a.target))){c.checkAndPreventDefault(a,c.target,c.element);break}}});n.useAttachEvent&&(n.add(a,"selectstart",function(a){var b=r[0];b.currentAction()&&b.checkAndPreventDefault(a)}),n.add(a,"dblclick",cb("ie8Dblclick")));ja.push(a)}}function v(a,b){for(var c=0,
d=a.length;c<d;c++)if(a[c]===b)return c;return-1}function R(a,b,c){if(ka)return ka(a,b,c);q!==F&&(b=b.replace(/\/deep\//g," "));return a[Oa](b)}function La(a,b,c){for(;t(a);){if(R(a,b))return!0;a=L(a);if(a===c)return R(a,b)}return!1}if(F){var q=function(){var a=F.document.createTextNode("");return a.ownerDocument!==F.document&&"function"===typeof F.wrap&&F.wrap(a)===a?F.wrap(F):F}(),Q=q.document,$a=q.DocumentFragment||ma,Xa=q.SVGElement||ma,pb=q.SVGSVGElement||ma,nb=q.SVGElementInstance||ma,qb=q.HTMLElement||
q.Element,ba=q.PointerEvent||q.MSPointerEvent,J,fa=Math.hypot||function(a,b){return Math.sqrt(a*a+b*b)},la={},ja=[],B=[],r=[],Pa=!1,P={},D={base:{accept:null,actionChecker:null,styleCursor:!0,preventDefault:"auto",origin:{x:0,y:0},deltaSource:"page",allowFrom:null,ignoreFrom:null,_context:Q,dropChecker:null},drag:{enabled:!1,manualStart:!0,max:Infinity,maxPerElement:1,snap:null,restrict:null,inertia:null,autoScroll:null,axis:"xy"},drop:{enabled:!1,accept:null,overlap:"pointer"},resize:{enabled:!1,
manualStart:!1,max:Infinity,maxPerElement:1,snap:null,restrict:null,inertia:null,autoScroll:null,square:!1,preserveAspectRatio:!1,axis:"xy",margin:NaN,edges:null,invert:"none"},gesture:{manualStart:!1,enabled:!1,max:Infinity,maxPerElement:1,restrict:null},perAction:{manualStart:!1,max:Infinity,maxPerElement:1,snap:{enabled:!1,endOnly:!1,range:Infinity,targets:null,offsets:null,relativePoints:null},restrict:{enabled:!1,endOnly:!1},autoScroll:{enabled:!1,container:null,margin:60,speed:300},inertia:{enabled:!1,
resistance:10,minSpeed:100,endSpeed:10,allowResume:!0,zeroResumeDelta:!0,smoothEndDuration:300}},_holdDuration:600},p={interaction:null,i:null,x:0,y:0,scroll:function(){var a=p.interaction.target.options[p.interaction.prepared.name].autoScroll,b=a.container||V(p.interaction.element),c=(new Date).getTime(),d=(c-p.prevTimeX)/1E3,e=(c-p.prevTimeY)/1E3,h;a.velocity?(h=a.velocity.x,a=a.velocity.y):h=a=a.speed;d*=h;e*=a;if(1<=d||1<=e)Ba(b)?b.scrollBy(p.x*d,p.y*e):b&&(b.scrollLeft+=p.x*d,b.scrollTop+=p.y*
e),1<=d&&(p.prevTimeX=c),1<=e&&(p.prevTimeY=c);p.isScrolling&&(X(p.i),p.i=T(p.scroll))},isScrolling:!1,prevTimeX:0,prevTimeY:0,start:function(a){p.isScrolling=!0;X(p.i);p.interaction=a;p.prevTimeX=(new Date).getTime();p.prevTimeY=(new Date).getTime();p.i=T(p.scroll)},stop:function(){p.isScrolling=!1;X(p.i)}},ga="ontouchstart"in q||q.DocumentTouch&&Q instanceof q.DocumentTouch,oa=!!ba,pa=ga||oa?20:10,Qa=1,db=0,wa=Infinity,za=Q.all&&!q.atob?{drag:"move",resizex:"e-resize",resizey:"s-resize",resizexy:"se-resize",
resizetop:"n-resize",resizeleft:"w-resize",resizebottom:"s-resize",resizeright:"e-resize",resizetopleft:"se-resize",resizebottomright:"se-resize",resizetopright:"ne-resize",resizebottomleft:"ne-resize",gesture:""}:{drag:"move",resizex:"ew-resize",resizey:"ns-resize",resizexy:"nwse-resize",resizetop:"ns-resize",resizeleft:"ew-resize",resizebottom:"ns-resize",resizeright:"ew-resize",resizetopleft:"nwse-resize",resizebottomright:"nwse-resize",resizetopright:"nesw-resize",resizebottomleft:"nesw-resize",
gesture:""},S={drag:!0,resize:!0,gesture:!0},kb="onmousewheel"in Q?"mousewheel":"wheel",ca="dragstart dragmove draginertiastart dragend dragenter dragleave dropactivate dropdeactivate dropmove drop resizestart resizemove resizeinertiastart resizeend gesturestart gesturemove gestureinertiastart gestureend down move up cancel tap doubletap hold".split(" "),U={},Va="Opera"==navigator.appName&&ga&&navigator.userAgent.match("Presto"),ob=/iP(hone|od|ad)/.test(navigator.platform)&&/OS 7[^\d]/.test(navigator.appVersion),
Oa="matches"in Element.prototype?"matches":"webkitMatchesSelector"in Element.prototype?"webkitMatchesSelector":"mozMatchesSelector"in Element.prototype?"mozMatchesSelector":"oMatchesSelector"in Element.prototype?"oMatchesSelector":"msMatchesSelector",ka,T=F.requestAnimationFrame,X=F.cancelAnimationFrame,n=function(){function a(b,c,d,h){var l,m=v(k,b),p=y[m],q,I,r=d;if(p&&p.events)if(e&&(q=n[m],I=v(q.supplied,d),r=q.wrapped[I]),"all"===c)for(c in p.events)p.events.hasOwnProperty(c)&&a(b,c,"all");else{if(p.events[c]){var t=
p.events[c].length;if("all"===d){for(l=0;l<t;l++)a(b,c,p.events[c][l],Boolean(h));return}for(l=0;l<t;l++)if(p.events[c][l]===d){b[f](g+c,r,h||!1);p.events[c].splice(l,1);e&&q&&(q.useCount[I]--,0===q.useCount[I]&&(q.supplied.splice(I,1),q.wrapped.splice(I,1),q.useCount.splice(I,1)));break}p.events[c]&&0===p.events[c].length&&(p.events[c]=null,p.typeCount--)}p.typeCount||(y.splice(m,1),k.splice(m,1),n.splice(m,1))}}function b(){this.returnValue=!1}function c(){this.cancelBubble=!0}function d(){this.immediatePropagationStopped=
this.cancelBubble=!0}var e="attachEvent"in q&&!("addEventListener"in q),h=e?"attachEvent":"addEventListener",f=e?"detachEvent":"removeEventListener",g=e?"on":"",k=[],y=[],n=[];return{add:function(a,f,l,p){var m=v(k,a),q=y[m];q||(q={events:{},typeCount:0},m=k.push(a)-1,y.push(q),n.push(e?{supplied:[],wrapped:[],useCount:[]}:null));q.events[f]||(q.events[f]=[],q.typeCount++);if(-1===v(q.events[f],l)){if(e){var m=n[m],r=v(m.supplied,l),t=m.wrapped[r]||function(e){e.immediatePropagationStopped||(e.target=
e.srcElement,e.currentTarget=a,e.preventDefault=e.preventDefault||b,e.stopPropagation=e.stopPropagation||c,e.stopImmediatePropagation=e.stopImmediatePropagation||d,/mouse|click/.test(e.type)&&(e.pageX=e.clientX+V(a).document.documentElement.scrollLeft,e.pageY=e.clientY+V(a).document.documentElement.scrollTop),l(e))};p=a[h](g+f,t,Boolean(p));-1===r?(m.supplied.push(l),m.wrapped.push(t),m.useCount.push(1)):m.useCount[r]++}else p=a[h](f,l,p||!1);q.events[f].push(l);return p}},remove:a,useAttachEvent:e,
_elements:k,_targets:y,_attachedListeners:n}}(),Ca={webkit:/(Movement[XY]|Radius[XY]|RotationAngle|Force)$/};xa.prototype={getPageXY:function(a,b){return Da(a,b,this)},getClientXY:function(a,b){return Wa(a,b,this)},setEventXY:function(a,b){var c=1<b.length?Ya(b):b[0];Da(c,la,this);a.page.x=la.x;a.page.y=la.y;Wa(c,la,this);a.client.x=la.x;a.client.y=la.y;a.timeStamp=(new Date).getTime()},pointerOver:function(a,b,c){function d(a,b){a&&va(a,c)&&!Z(a,c,c)&&aa(a,c,c)&&R(c,b)&&(e.push(a),h.push(c))}if(!this.prepared.name&&
this.mouse){var e=[],h=[],f=this.element;this.addPointer(a);!this.target||!Z(this.target,this.element,c)&&aa(this.target,this.element,c)||(this.element=this.target=null,this.matches=[],this.matchElements=[]);var g=B.get(c),k=g&&!Z(g,c,c)&&aa(g,c,c)&&W(g.getAction(a,b,this,c),g);k&&!ha(g,c,k)&&(k=null);k?(this.target=g,this.element=c,this.matches=[],this.matchElements=[]):(B.forEachSelector(d),this.validateSelector(a,b,e,h)?(this.matches=e,this.matchElements=h,this.pointerHover(a,b,this.matches,this.matchElements),
n.add(c,ba?J.move:"mousemove",m.pointerHover)):this.target&&(Y(f,c)?(this.pointerHover(a,b,this.matches,this.matchElements),n.add(this.element,ba?J.move:"mousemove",m.pointerHover)):(this.element=this.target=null,this.matches=[],this.matchElements=[])))}},pointerHover:function(a,b,c,d,e,h){c=this.target;if(!this.prepared.name&&this.mouse){var f;this.setEventXY(this.curCoords,[a]);e?f=this.validateSelector(a,b,e,h):c&&(f=W(c.getAction(this.pointers[0],b,this,this.element),this.target));c&&c.options.styleCursor&&
(c._doc.documentElement.style.cursor=f?gb(f):"")}else this.prepared.name&&this.checkAndPreventDefault(b,c,this.element)},pointerOut:function(a,b,c){this.prepared.name||(B.get(c)||n.remove(c,ba?J.move:"mousemove",m.pointerHover),this.target&&this.target.options.styleCursor&&!this.interacting()&&(this.target._doc.documentElement.style.cursor=""))},selectorDown:function(a,b,c,d){function e(a,b,d){d=ka?d.querySelectorAll(b):void 0;va(a,g)&&!Z(a,g,c)&&aa(a,g,c)&&R(g,b,d)&&(h.matches.push(a),h.matchElements.push(g))}
var h=this,f=n.useAttachEvent?x({},b):b,g=c,k=this.addPointer(a),l;this.holdTimers[k]=setTimeout(function(){h.pointerHold(n.useAttachEvent?f:a,f,c,d)},D._holdDuration);this.pointerIsDown=!0;if(this.inertiaStatus.active&&this.target.selector)for(;t(g);){if(g===this.element&&W(this.target.getAction(a,b,this,this.element),this.target).name===this.prepared.name){X(this.inertiaStatus.i);this.inertiaStatus.active=!1;this.collectEventTargets(a,b,c,"down");return}g=L(g)}if(!this.interacting()){this.setEventXY(this.curCoords,
[a]);for(this.downEvent=b;t(g)&&!l;)this.matches=[],this.matchElements=[],B.forEachSelector(e),l=this.validateSelector(a,b,this.matches,this.matchElements),g=L(g);if(l)return this.prepared.name=l.name,this.prepared.axis=l.axis,this.prepared.edges=l.edges,this.collectEventTargets(a,b,c,"down"),this.pointerDown(a,b,c,d,l);this.downTimes[k]=(new Date).getTime();this.downTargets[k]=c;ra(this.downPointer,a);sa(this.prevCoords,this.curCoords);this.pointerWasMoved=!1}this.collectEventTargets(a,b,c,"down")},
pointerDown:function(a,b,c,d,e){if(!e&&!this.inertiaStatus.active&&this.pointerWasMoved&&this.prepared.name)this.checkAndPreventDefault(b,this.target,this.element);else{this.pointerIsDown=!0;this.downEvent=b;var h=this.addPointer(a),f;if(1<this.pointerIds.length&&this.target._element===this.element){var g=W(e||this.target.getAction(a,b,this,this.element),this.target);ha(this.target,this.element,g)&&(f=g);this.prepared.name=null}else this.prepared.name||(g=B.get(d))&&!Z(g,d,c)&&aa(g,d,c)&&(f=W(e||
g.getAction(a,b,this,d),g,c))&&ha(g,d,f)&&(this.target=g,this.element=d);var k=(g=this.target)&&g.options;!g||!e&&this.prepared.name?this.inertiaStatus.active&&d===this.element&&W(g.getAction(a,b,this,this.element),g).name===this.prepared.name&&(X(this.inertiaStatus.i),this.inertiaStatus.active=!1,this.checkAndPreventDefault(b,g,this.element)):(f=f||W(e||g.getAction(a,b,this,d),g,this.element),this.setEventXY(this.startCoords,this.pointers),f&&(k.styleCursor&&(g._doc.documentElement.style.cursor=
gb(f)),this.resizeAxes="resize"===f.name?f.axis:null,"gesture"===f&&2>this.pointerIds.length&&(f=null),this.prepared.name=f.name,this.prepared.axis=f.axis,this.prepared.edges=f.edges,this.snapStatus.snappedX=this.snapStatus.snappedY=this.restrictStatus.restrictedX=this.restrictStatus.restrictedY=NaN,this.downTimes[h]=(new Date).getTime(),this.downTargets[h]=c,ra(this.downPointer,a),sa(this.prevCoords,this.startCoords),this.pointerWasMoved=!1,this.checkAndPreventDefault(b,g,this.element)))}},setModifications:function(a,
b){var c=this.target,d=!0,e=Ma(c,this.prepared.name)&&(!c.options[this.prepared.name].snap.endOnly||b),c=Na(c,this.prepared.name)&&(!c.options[this.prepared.name].restrict.endOnly||b);e?this.setSnapping(a):this.snapStatus.locked=!1;c?this.setRestriction(a):this.restrictStatus.restricted=!1;e&&this.snapStatus.locked&&!this.snapStatus.changed?d=c&&this.restrictStatus.restricted&&this.restrictStatus.changed:c&&this.restrictStatus.restricted&&!this.restrictStatus.changed&&(d=!1);return d},setStartOffsets:function(a,
b,c){a=b.getRect(c);var d=na(b,c);c=b.options[this.prepared.name].snap;b=b.options[this.prepared.name].restrict;var e,h;a?(this.startOffset.left=this.startCoords.page.x-a.left,this.startOffset.top=this.startCoords.page.y-a.top,this.startOffset.right=a.right-this.startCoords.page.x,this.startOffset.bottom=a.bottom-this.startCoords.page.y,e="width"in a?a.width:a.right-a.left,h="height"in a?a.height:a.bottom-a.top):this.startOffset.left=this.startOffset.top=this.startOffset.right=this.startOffset.bottom=
0;this.snapOffsets.splice(0);d=c&&"startCoords"===c.offset?{x:this.startCoords.page.x-d.x,y:this.startCoords.page.y-d.y}:c&&c.offset||{x:0,y:0};if(a&&c&&c.relativePoints&&c.relativePoints.length)for(var f=0;f<c.relativePoints.length;f++)this.snapOffsets.push({x:this.startOffset.left-e*c.relativePoints[f].x+d.x,y:this.startOffset.top-h*c.relativePoints[f].y+d.y});else this.snapOffsets.push(d);a&&b.elementRect?(this.restrictOffset.left=this.startOffset.left-e*b.elementRect.left,this.restrictOffset.top=
this.startOffset.top-h*b.elementRect.top,this.restrictOffset.right=this.startOffset.right-e*(1-b.elementRect.right),this.restrictOffset.bottom=this.startOffset.bottom-h*(1-b.elementRect.bottom)):this.restrictOffset.left=this.restrictOffset.top=this.restrictOffset.right=this.restrictOffset.bottom=0},start:function(a,b,c){this.interacting()||!this.pointerIsDown||this.pointerIds.length<("gesture"===a.name?2:1)||(-1===v(r,this)&&r.push(this),this.prepared.name||this.setEventXY(this.startCoords),this.prepared.name=
a.name,this.prepared.axis=a.axis,this.prepared.edges=a.edges,this.target=b,this.element=c,this.setStartOffsets(a.name,b,c),this.setModifications(this.startCoords.page),this.prevEvent=this[this.prepared.name+"Start"](this.downEvent))},pointerMove:function(a,b,c,d,e){if(this.inertiaStatus.active){d=this.inertiaStatus.upCoords.page;var h=this.inertiaStatus.upCoords.client;this.setEventXY(this.curCoords,[{pageX:d.x+this.inertiaStatus.sx,pageY:d.y+this.inertiaStatus.sy,clientX:h.x+this.inertiaStatus.sx,
clientY:h.y+this.inertiaStatus.sy}])}else this.recordPointer(a),this.setEventXY(this.curCoords,this.pointers);d=this.curCoords.page.x===this.prevCoords.page.x&&this.curCoords.page.y===this.prevCoords.page.y&&this.curCoords.client.x===this.prevCoords.client.x&&this.curCoords.client.y===this.prevCoords.client.y;var f,g,h=this.mouse?0:v(this.pointerIds,O(a));this.pointerIsDown&&!this.pointerWasMoved&&(f=this.curCoords.client.x-this.startCoords.client.x,g=this.curCoords.client.y-this.startCoords.client.y,
this.pointerWasMoved=fa(f,g)>Qa);d||this.pointerIsDown&&!this.pointerWasMoved||(this.pointerIsDown&&clearTimeout(this.holdTimers[h]),this.collectEventTargets(a,b,c,"move"));if(this.pointerIsDown)if(d&&this.pointerWasMoved&&!e)this.checkAndPreventDefault(b,this.target,this.element);else if(Ta(this.pointerDelta,this.prevCoords,this.curCoords),this.prepared.name){if(this.pointerWasMoved&&(!this.inertiaStatus.active||a instanceof G&&/inertiastart/.test(a.type))){if(!this.interacting()&&(Ta(this.pointerDelta,
this.prevCoords,this.curCoords),"drag"===this.prepared.name)){f=Math.abs(f);g=Math.abs(g);d=this.target.options.drag.axis;var k=f>g?"x":f<g?"y":"xy";if("xy"!==k&&"xy"!==d&&d!==k){this.prepared.name=null;for(var l=c;t(l);){if((g=B.get(l))&&g!==this.target&&!g.options.drag.manualStart&&"drag"===g.getAction(this.downPointer,this.downEvent,this,l).name&&ab(k,g)){this.prepared.name="drag";this.target=g;this.element=l;break}l=L(l)}if(!this.prepared.name){var n=this;g=function(a,b,d){d=ka?d.querySelectorAll(b):
void 0;if(a!==n.target&&va(a,c)&&!a.options.drag.manualStart&&!Z(a,l,c)&&aa(a,l,c)&&R(l,b,d)&&"drag"===a.getAction(n.downPointer,n.downEvent,n,l).name&&ab(k,a)&&ha(a,l,"drag"))return a};for(l=c;t(l);){if(f=B.forEachSelector(g)){this.prepared.name="drag";this.target=f;this.element=l;break}l=L(l)}}}}if((g=!!this.prepared.name&&!this.interacting())&&(this.target.options[this.prepared.name].manualStart||!ha(this.target,this.element,this.prepared))){this.stop(b);return}if(this.prepared.name&&this.target){g&&
this.start(this.prepared,this.target,this.element);if(this.setModifications(this.curCoords.page,e)||g)this.prevEvent=this[this.prepared.name+"Move"](b);this.checkAndPreventDefault(b,this.target,this.element)}}sa(this.prevCoords,this.curCoords);(this.dragging||this.resizing)&&this.autoScrollMove(a)}},dragStart:function(a){var b=new G(this,a,"drag","start",this.element);this.dragging=!0;this.target.fire(b);this.activeDrops.dropzones=[];this.activeDrops.elements=[];this.activeDrops.rects=[];this.dynamicDrop||
this.setActiveDrops(this.element);a=this.getDropEvents(a,b);a.activate&&this.fireActiveDrops(a.activate);return b},dragMove:function(a){var b=this.target,c=new G(this,a,"drag","move",this.element),d=this.getDrop(c,a,this.element);this.dropTarget=d.dropzone;this.dropElement=d.element;a=this.getDropEvents(a,c);b.fire(c);a.leave&&this.prevDropTarget.fire(a.leave);a.enter&&this.dropTarget.fire(a.enter);a.move&&this.dropTarget.fire(a.move);this.prevDropTarget=this.dropTarget;this.prevDropElement=this.dropElement;
return c},resizeStart:function(a){a=new G(this,a,"resize","start",this.element);if(this.prepared.edges){var b=this.target.getRect(this.element);if(this.target.options.resize.square||this.target.options.resize.preserveAspectRatio){var c=x({},this.prepared.edges);c.top=c.top||c.left&&!c.bottom;c.left=c.left||c.top&&!c.right;c.bottom=c.bottom||c.right&&!c.top;c.right=c.right||c.bottom&&!c.left;this.prepared._linkedEdges=c}else this.prepared._linkedEdges=null;this.target.options.resize.preserveAspectRatio&&
(this.resizeStartAspectRatio=b.width/b.height);this.resizeRects={start:b,current:x({},b),restricted:x({},b),previous:x({},b),delta:{left:0,right:0,width:0,top:0,bottom:0,height:0}};a.rect=this.resizeRects.restricted;a.deltaRect=this.resizeRects.delta}this.target.fire(a);this.resizing=!0;return a},resizeMove:function(a){a=new G(this,a,"resize","move",this.element);var b=this.prepared.edges,c=this.target.options.resize.invert,d="reposition"===c||"negate"===c;if(b){var e=a.dx,h=a.dy,f=this.resizeRects.start,
g=this.resizeRects.current,k=this.resizeRects.restricted,l=this.resizeRects.delta,n=x(this.resizeRects.previous,k),m=b;if(this.target.options.resize.preserveAspectRatio){var p=this.resizeStartAspectRatio,b=this.prepared._linkedEdges;if(m.left&&m.bottom||m.right&&m.top)h=-e/p;else if(m.left||m.right)h=e/p;else if(m.top||m.bottom)e=h*p}else if(this.target.options.resize.square)if(b=this.prepared._linkedEdges,m.left&&m.bottom||m.right&&m.top)h=-e;else if(m.left||m.right)h=e;else if(m.top||m.bottom)e=
h;b.top&&(g.top+=h);b.bottom&&(g.bottom+=h);b.left&&(g.left+=e);b.right&&(g.right+=e);d?(x(k,g),"reposition"===c&&(k.top>k.bottom&&(b=k.top,k.top=k.bottom,k.bottom=b),k.left>k.right&&(b=k.left,k.left=k.right,k.right=b))):(k.top=Math.min(g.top,f.bottom),k.bottom=Math.max(g.bottom,f.top),k.left=Math.min(g.left,f.right),k.right=Math.max(g.right,f.left));k.width=k.right-k.left;k.height=k.bottom-k.top;for(var q in k)l[q]=k[q]-n[q];a.edges=this.prepared.edges;a.rect=k;a.deltaRect=l}this.target.fire(a);
return a},gestureStart:function(a){a=new G(this,a,"gesture","start",this.element);a.ds=0;this.gesture.startDistance=this.gesture.prevDistance=a.distance;this.gesture.startAngle=this.gesture.prevAngle=a.angle;this.gesture.scale=1;this.gesturing=!0;this.target.fire(a);return a},gestureMove:function(a){if(!this.pointerIds.length)return this.prevEvent;a=new G(this,a,"gesture","move",this.element);a.ds=a.scale-this.gesture.scale;this.target.fire(a);this.gesture.prevAngle=a.angle;this.gesture.prevDistance=
a.distance;Infinity===a.scale||null===a.scale||void 0===a.scale||isNaN(a.scale)||(this.gesture.scale=a.scale);return a},pointerHold:function(a,b,c){this.collectEventTargets(a,b,c,"hold")},pointerUp:function(a,b,c,d){var e=this.mouse?0:v(this.pointerIds,O(a));clearTimeout(this.holdTimers[e]);this.collectEventTargets(a,b,c,"up");this.collectEventTargets(a,b,c,"tap");this.pointerEnd(a,b,c,d);this.removePointer(a)},pointerCancel:function(a,b,c,d){var e=this.mouse?0:v(this.pointerIds,O(a));clearTimeout(this.holdTimers[e]);
this.collectEventTargets(a,b,c,"cancel");this.pointerEnd(a,b,c,d);this.removePointer(a)},ie8Dblclick:function(a,b,c){this.prevTap&&b.clientX===this.prevTap.clientX&&b.clientY===this.prevTap.clientY&&c===this.prevTap.target&&(this.downTargets[0]=c,this.downTimes[0]=(new Date).getTime(),this.collectEventTargets(a,b,c,"tap"))},pointerEnd:function(a,b,c,d){var e,h=this.target,f=h&&h.options,g=f&&this.prepared.name&&f[this.prepared.name].inertia;e=this.inertiaStatus;if(this.interacting()){if(e.active&&
!e.ending)return;var k=(new Date).getTime(),l=!1,m=!1,n=!1,p=Ma(h,this.prepared.name)&&f[this.prepared.name].snap.endOnly,q=Na(h,this.prepared.name)&&f[this.prepared.name].restrict.endOnly,r=0,t=0,f=this.dragging?"x"===f.drag.axis?Math.abs(this.pointerDelta.client.vx):"y"===f.drag.axis?Math.abs(this.pointerDelta.client.vy):this.pointerDelta.client.speed:this.pointerDelta.client.speed,m=(l=g&&g.enabled&&"gesture"!==this.prepared.name&&b!==e.startEvent)&&50>k-this.curCoords.timeStamp&&f>g.minSpeed&&
f>g.endSpeed;l&&!m&&(p||q)&&(g={},g.snap=g.restrict=g,p&&(this.setSnapping(this.curCoords.page,g),g.locked&&(r+=g.dx,t+=g.dy)),q&&(this.setRestriction(this.curCoords.page,g),g.restricted&&(r+=g.dx,t+=g.dy)),r||t)&&(n=!0);if(m||n){sa(e.upCoords,this.curCoords);this.pointers[0]=e.startEvent=new G(this,b,this.prepared.name,"inertiastart",this.element);e.t0=k;h.fire(e.startEvent);m?(e.vx0=this.pointerDelta.client.vx,e.vy0=this.pointerDelta.client.vy,e.v0=f,this.calcInertia(e),b=x({},this.curCoords.page),
h=na(h,this.element),b.x=b.x+e.xe-h.x,b.y=b.y+e.ye-h.y,h={useStatusXY:!0,x:b.x,y:b.y,dx:0,dy:0,snap:null},h.snap=h,r=t=0,p&&(b=this.setSnapping(this.curCoords.page,h),b.locked&&(r+=b.dx,t+=b.dy)),q&&(h=this.setRestriction(this.curCoords.page,h),h.restricted&&(r+=h.dx,t+=h.dy)),e.modifiedXe+=r,e.modifiedYe+=t,e.i=T(this.boundInertiaFrame)):(e.smoothEnd=!0,e.xe=r,e.ye=t,e.sx=e.sy=0,e.i=T(this.boundSmoothEndFrame));e.active=!0;return}(p||q)&&this.pointerMove(a,b,c,d,!0)}this.dragging?(e=new G(this,b,
"drag","end",this.element),q=this.getDrop(e,b,this.element),this.dropTarget=q.dropzone,this.dropElement=q.element,q=this.getDropEvents(b,e),q.leave&&this.prevDropTarget.fire(q.leave),q.enter&&this.dropTarget.fire(q.enter),q.drop&&this.dropTarget.fire(q.drop),q.deactivate&&this.fireActiveDrops(q.deactivate),h.fire(e)):this.resizing?(e=new G(this,b,"resize","end",this.element),h.fire(e)):this.gesturing&&(e=new G(this,b,"gesture","end",this.element),h.fire(e));this.stop(b)},collectDrops:function(a){var b=
[],c=[],d;a=a||this.element;for(d=0;d<B.length;d++)if(B[d].options.drop.enabled){var e=B[d],h=e.options.drop.accept;if(!(t(h)&&h!==a||N(h)&&!R(a,h)))for(var h=e.selector?e._context.querySelectorAll(e.selector):[e._element],f=0,g=h.length;f<g;f++){var k=h[f];k!==a&&(b.push(e),c.push(k))}}return{dropzones:b,elements:c}},fireActiveDrops:function(a){var b,c,d,e;for(b=0;b<this.activeDrops.dropzones.length;b++)c=this.activeDrops.dropzones[b],d=this.activeDrops.elements[b],d!==e&&(a.target=d,c.fire(a)),
e=d},setActiveDrops:function(a){a=this.collectDrops(a,!0);this.activeDrops.dropzones=a.dropzones;this.activeDrops.elements=a.elements;this.activeDrops.rects=[];for(a=0;a<this.activeDrops.dropzones.length;a++)this.activeDrops.rects[a]=this.activeDrops.dropzones[a].getRect(this.activeDrops.elements[a])},getDrop:function(a,b,c){var d=[];Pa&&this.setActiveDrops(c);for(var e=0;e<this.activeDrops.dropzones.length;e++){var h=this.activeDrops.elements[e];d.push(this.activeDrops.dropzones[e].dropCheck(a,b,
this.target,c,h,this.activeDrops.rects[e])?h:null)}c=(b=d[0])?0:-1;for(var f,e=[],g=[],h=1;h<d.length;h++)if((a=d[h])&&a!==b)if(!b)b=a,c=h;else if(a.parentNode!==a.ownerDocument)if(b.parentNode===a.ownerDocument)b=a,c=h;else{if(!e.length)for(f=b;f.parentNode&&f.parentNode!==f.ownerDocument;)e.unshift(f),f=f.parentNode;if(b instanceof qb&&a instanceof Xa&&!(a instanceof pb)){if(a===b.parentNode)continue;f=a.ownerSVGElement}else f=a;for(g=[];f.parentNode!==f.ownerDocument;)g.unshift(f),f=f.parentNode;
for(f=0;g[f]&&g[f]===e[f];)f++;f=[g[f-1],g[f],e[f]];for(g=f[0].lastChild;g;){if(g===f[1]){b=a;c=h;e=[];break}else if(g===f[2])break;g=g.previousSibling}}d=c;return{dropzone:this.activeDrops.dropzones[d]||null,element:this.activeDrops.elements[d]||null}},getDropEvents:function(a,b){var c={enter:null,leave:null,activate:null,deactivate:null,move:null,drop:null};this.dropElement!==this.prevDropElement&&(this.prevDropTarget&&(c.leave={target:this.prevDropElement,dropzone:this.prevDropTarget,relatedTarget:b.target,
draggable:b.interactable,dragEvent:b,interaction:this,timeStamp:b.timeStamp,type:"dragleave"},b.dragLeave=this.prevDropElement,b.prevDropzone=this.prevDropTarget),this.dropTarget&&(c.enter={target:this.dropElement,dropzone:this.dropTarget,relatedTarget:b.target,draggable:b.interactable,dragEvent:b,interaction:this,timeStamp:b.timeStamp,type:"dragenter"},b.dragEnter=this.dropElement,b.dropzone=this.dropTarget));"dragend"===b.type&&this.dropTarget&&(c.drop={target:this.dropElement,dropzone:this.dropTarget,
relatedTarget:b.target,draggable:b.interactable,dragEvent:b,interaction:this,timeStamp:b.timeStamp,type:"drop"},b.dropzone=this.dropTarget);"dragstart"===b.type&&(c.activate={target:null,dropzone:null,relatedTarget:b.target,draggable:b.interactable,dragEvent:b,interaction:this,timeStamp:b.timeStamp,type:"dropactivate"});"dragend"===b.type&&(c.deactivate={target:null,dropzone:null,relatedTarget:b.target,draggable:b.interactable,dragEvent:b,interaction:this,timeStamp:b.timeStamp,type:"dropdeactivate"});
"dragmove"===b.type&&this.dropTarget&&(c.move={target:this.dropElement,dropzone:this.dropTarget,relatedTarget:b.target,draggable:b.interactable,dragEvent:b,interaction:this,dragmove:b,timeStamp:b.timeStamp,type:"dropmove"},b.dropzone=this.dropTarget);return c},currentAction:function(){return this.dragging&&"drag"||this.resizing&&"resize"||this.gesturing&&"gesture"||null},interacting:function(){return this.dragging||this.resizing||this.gesturing},clearTargets:function(){this.dropTarget=this.dropElement=
this.prevDropTarget=this.prevDropElement=this.target=this.element=null},stop:function(a){if(this.interacting()){p.stop();this.matches=[];this.matchElements=[];var b=this.target;b.options.styleCursor&&(b._doc.documentElement.style.cursor="");a&&A(a.preventDefault)&&this.checkAndPreventDefault(a,b,this.element);this.dragging&&(this.activeDrops.dropzones=this.activeDrops.elements=this.activeDrops.rects=null)}this.clearTargets();this.pointerIsDown=this.snapStatus.locked=this.dragging=this.resizing=this.gesturing=
!1;this.prepared.name=this.prevEvent=null;for(a=this.inertiaStatus.resumeDx=this.inertiaStatus.resumeDy=0;a<this.pointers.length;a++)-1===v(this.pointerIds,O(this.pointers[a]))&&this.pointers.splice(a,1)},inertiaFrame:function(){var a,b,c=this.inertiaStatus;a=this.target.options[this.prepared.name].inertia.resistance;b=(new Date).getTime()/1E3-c.t0;if(b<c.te){b=1-(Math.exp(-a*b)-c.lambda_v0)/c.one_ve_v0;if(c.modifiedXe===c.xe&&c.modifiedYe===c.ye)c.sx=c.xe*b,c.sy=c.ye*b;else{var d=c.ye,e=c.modifiedYe;
a=Za(b,0,c.xe,c.modifiedXe);b=Za(b,0,d,e);c.sx=a;c.sy=b}this.pointerMove(c.startEvent,c.startEvent);c.i=T(this.boundInertiaFrame)}else c.ending=!0,c.sx=c.modifiedXe,c.sy=c.modifiedYe,this.pointerMove(c.startEvent,c.startEvent),this.pointerEnd(c.startEvent,c.startEvent),c.active=c.ending=!1},smoothEndFrame:function(){var a=this.inertiaStatus,b=(new Date).getTime()-a.t0,c=this.target.options[this.prepared.name].inertia.smoothEndDuration;if(b<c){var d;d=b/c;a.sx=-a.xe*d*(d-2)+0;b/=c;a.sy=-a.ye*b*(b-
2)+0;this.pointerMove(a.startEvent,a.startEvent);a.i=T(this.boundSmoothEndFrame)}else a.ending=!0,a.sx=a.xe,a.sy=a.ye,this.pointerMove(a.startEvent,a.startEvent),this.pointerEnd(a.startEvent,a.startEvent),a.smoothEnd=a.active=a.ending=!1},addPointer:function(a){var b=O(a),c=this.mouse?0:v(this.pointerIds,b);-1===c&&(c=this.pointerIds.length);this.pointerIds[c]=b;this.pointers[c]=a;return c},removePointer:function(a){a=O(a);a=this.mouse?0:v(this.pointerIds,a);-1!==a&&(this.pointers.splice(a,1),this.pointerIds.splice(a,
1),this.downTargets.splice(a,1),this.downTimes.splice(a,1),this.holdTimers.splice(a,1))},recordPointer:function(a){var b=this.mouse?0:v(this.pointerIds,O(a));-1!==b&&(this.pointers[b]=a)},collectEventTargets:function(a,b,c,d){function e(a,b,e){e=ka?e.querySelectorAll(b):void 0;a._iEvents[d]&&t(k)&&va(a,k)&&!Z(a,k,c)&&aa(a,k,c)&&R(k,b,e)&&(f.push(a),g.push(k))}var h=this.mouse?0:v(this.pointerIds,O(a));if("tap"!==d||!this.pointerWasMoved&&this.downTargets[h]&&this.downTargets[h]===c){for(var f=[],
g=[],k=c;k;)l.isSet(k)&&l(k)._iEvents[d]&&(f.push(l(k)),g.push(k)),B.forEachSelector(e),k=L(k);(f.length||"tap"===d)&&this.firePointers(a,b,c,f,g,d)}},firePointers:function(a,b,c,d,e,h){var f=this.mouse?0:v(this.pointerIds,O(a)),g={},k,l;"doubletap"===h?g=a:(ra(g,b),b!==a&&ra(g,a),g.preventDefault=fb,g.stopPropagation=G.prototype.stopPropagation,g.stopImmediatePropagation=G.prototype.stopImmediatePropagation,g.interaction=this,g.timeStamp=(new Date).getTime(),g.originalEvent=b,g.originalPointer=a,
g.type=h,g.pointerId=O(a),g.pointerType=this.mouse?"mouse":oa?N(a.pointerType)?a.pointerType:[,,"touch","pen","mouse"][a.pointerType]:"touch");"tap"===h&&(g.dt=g.timeStamp-this.downTimes[f],k=g.timeStamp-this.tapTime,l=!!(this.prevTap&&"doubletap"!==this.prevTap.type&&this.prevTap.target===g.target&&500>k),g["double"]=l,this.tapTime=g.timeStamp);for(a=0;a<d.length&&!(g.currentTarget=e[a],g.interactable=d[a],d[a].fire(g),g.immediatePropagationStopped||g.propagationStopped&&e[a+1]!==g.currentTarget);a++);
l?(d={},x(d,g),d.dt=k,d.type="doubletap",this.collectEventTargets(d,b,c,"doubletap"),this.prevTap=d):"tap"===h&&(this.prevTap=g)},validateSelector:function(a,b,c,d){for(var e=0,h=c.length;e<h;e++){var f=c[e],g=d[e],k=W(f.getAction(a,b,this,g),f);if(k&&ha(f,g,k))return this.target=f,this.element=g,k}},setSnapping:function(a,b){var c=this.target.options[this.prepared.name].snap,d=[],e,h,f;b=b||this.snapStatus;b.useStatusXY?h={x:b.x,y:b.y}:(e=na(this.target,this.element),h=x({},a),h.x-=e.x,h.y-=e.y);
b.realX=h.x;b.realY=h.y;h.x-=this.inertiaStatus.resumeDx;h.y-=this.inertiaStatus.resumeDy;for(var g=c.targets?c.targets.length:0,k=0;k<this.snapOffsets.length;k++){var l=h.x-this.snapOffsets[k].x,m=h.y-this.snapOffsets[k].y;for(f=0;f<g;f++)(e=A(c.targets[f])?c.targets[f](l,m,this):c.targets[f])&&d.push({x:K(e.x)?e.x+this.snapOffsets[k].x:l,y:K(e.y)?e.y+this.snapOffsets[k].y:m,range:K(e.range)?e.range:c.range})}var c=null,k=!1,n=0,p=0;f=m=l=0;for(g=d.length;f<g;f++){e=d[f];var q=e.range,r=e.x-h.x,
t=e.y-h.y,w=fa(r,t),v=w<=q;Infinity===q&&k&&Infinity!==p&&(v=!1);if(!c||(v?k&&Infinity!==q?w/q<n/p:Infinity===q&&Infinity!==p||w<n:!k&&w<n))Infinity===q&&(v=!0),c=e,n=w,p=q,k=v,l=r,m=t,b.range=q}c?(d=b.snappedX!==c.x||b.snappedY!==c.y,b.snappedX=c.x,b.snappedY=c.y):(d=!0,b.snappedX=NaN,b.snappedY=NaN);b.dx=l;b.dy=m;b.changed=d||k&&!b.locked;b.locked=k;return b},setRestriction:function(a,b){var c=this.target,d=c&&c.options[this.prepared.name].restrict,e=d&&d.restriction;if(!e)return b;b=b||this.restrictStatus;
d=b.useStatusXY?d={x:b.x,y:b.y}:d=x({},a);b.snap&&b.snap.locked&&(d.x+=b.snap.dx||0,d.y+=b.snap.dy||0);d.x-=this.inertiaStatus.resumeDx;d.y-=this.inertiaStatus.resumeDy;b.dx=0;b.dy=0;b.restricted=!1;if(N(e)&&(e="parent"===e?L(this.element):"self"===e?c.getRect(this.element):Ka(this.element,e),!e))return b;A(e)&&(e=e(d.x,d.y,this.element));t(e)&&(e=ua(e));(c=e)?"x"in e&&"y"in e?(e=Math.max(Math.min(c.x+c.width-this.restrictOffset.right,d.x),c.x+this.restrictOffset.left),c=Math.max(Math.min(c.y+c.height-
this.restrictOffset.bottom,d.y),c.y+this.restrictOffset.top)):(e=Math.max(Math.min(c.right-this.restrictOffset.right,d.x),c.left+this.restrictOffset.left),c=Math.max(Math.min(c.bottom-this.restrictOffset.bottom,d.y),c.top+this.restrictOffset.top)):(e=d.x,c=d.y);b.dx=e-d.x;b.dy=c-d.y;b.changed=b.restrictedX!==e||b.restrictedY!==c;b.restricted=!(!b.dx&&!b.dy);b.restrictedX=e;b.restrictedY=c;return b},checkAndPreventDefault:function(a,b,c){if(b=b||this.target){b=b.options;var d=b.preventDefault;"auto"===
d&&c&&!/^(input|select|textarea)$/i.test(a.target.nodeName)?/down|start/i.test(a.type)&&"drag"===this.prepared.name&&"xy"!==b.drag.axis||b[this.prepared.name]&&b[this.prepared.name].manualStart&&!this.interacting()||a.preventDefault():"always"===d&&a.preventDefault()}},calcInertia:function(a){var b=this.target.options[this.prepared.name].inertia,c=b.resistance,d=-Math.log(b.endSpeed/a.v0)/c;a.x0=this.prevEvent.pageX;a.y0=this.prevEvent.pageY;a.t0=a.startEvent.timeStamp/1E3;a.sx=a.sy=0;a.modifiedXe=
a.xe=(a.vx0-d)/c;a.modifiedYe=a.ye=(a.vy0-d)/c;a.te=d;a.lambda_v0=c/a.v0;a.one_ve_v0=1-b.endSpeed/a.v0},autoScrollMove:function(a){var b;if(b=this.interacting()){b=this.prepared.name;var c=this.target.options;/^resize/.test(b)&&(b="resize");b=c[b].autoScroll&&c[b].autoScroll.enabled}if(b)if(this.inertiaStatus.active)p.x=p.y=0;else{var d,e=this.target.options[this.prepared.name].autoScroll,h=e.container||V(this.element);Ba(h)?(d=a.clientX<p.margin,b=a.clientY<p.margin,c=a.clientX>h.innerWidth-p.margin,
a=a.clientY>h.innerHeight-p.margin):(h=Fa(h),d=a.clientX<h.left+p.margin,b=a.clientY<h.top+p.margin,c=a.clientX>h.right-p.margin,a=a.clientY>h.bottom-p.margin);p.x=c?1:d?-1:0;p.y=a?1:b?-1:0;p.isScrolling||(p.margin=e.margin,p.speed=e.speed,p.start(this))}},_updateEventTargets:function(a,b){this._eventTarget=a;this._curEventTarget=b}};G.prototype={preventDefault:ma,stopImmediatePropagation:function(){this.immediatePropagationStopped=this.propagationStopped=!0},stopPropagation:function(){this.propagationStopped=
!0}};for(var m={},lb="dragStart dragMove resizeStart resizeMove gestureStart gestureMove pointerOver pointerOut pointerHover selectorDown pointerDown pointerMove pointerUp pointerCancel pointerEnd addPointer removePointer recordPointer autoScrollMove".split(" "),Ra=0,Sa=lb.length;Ra<Sa;Ra++){var mb=lb[Ra];m[mb]=cb(mb)}B.indexOfElement=function(a,b){b=b||Q;for(var c=0;c<this.length;c++){var d=this[c];if(d.selector===a&&d._context===b||!d.selector&&d._element===a)return c}return-1};B.get=function(a,
b){return this[this.indexOfElement(a,b&&b.context)]};B.forEachSelector=function(a){for(var b=0;b<this.length;b++){var c=this[b];if(c.selector&&(c=a(c,c.selector,c._context,b,this),void 0!==c))return c}};C.prototype={setOnEvents:function(a,b){"drop"===a?(A(b.ondrop)&&(this.ondrop=b.ondrop),A(b.ondropactivate)&&(this.ondropactivate=b.ondropactivate),A(b.ondropdeactivate)&&(this.ondropdeactivate=b.ondropdeactivate),A(b.ondragenter)&&(this.ondragenter=b.ondragenter),A(b.ondragleave)&&(this.ondragleave=
b.ondragleave),A(b.ondropmove)&&(this.ondropmove=b.ondropmove)):(a="on"+a,A(b.onstart)&&(this[a+"start"]=b.onstart),A(b.onmove)&&(this[a+"move"]=b.onmove),A(b.onend)&&(this[a+"end"]=b.onend),A(b.oninertiastart)&&(this[a+"inertiastart"]=b.oninertiastart));return this},draggable:function(a){return z(a)?(this.options.drag.enabled=!1===a.enabled?!1:!0,this.setPerAction("drag",a),this.setOnEvents("drag",a),/^x$|^y$|^xy$/.test(a.axis)?this.options.drag.axis=a.axis:null===a.axis&&delete this.options.drag.axis,
this):H(a)?(this.options.drag.enabled=a,this):this.options.drag},setPerAction:function(a,b){for(var c in b)c in D[a]&&(z(b[c])?(this.options[a][c]=x(this.options[a][c]||{},b[c]),z(D.perAction[c])&&"enabled"in D.perAction[c]&&(this.options[a][c].enabled=!1===b[c].enabled?!1:!0)):H(b[c])&&z(D.perAction[c])?this.options[a][c].enabled=b[c]:void 0!==b[c]&&(this.options[a][c]=b[c]))},dropzone:function(a){return z(a)?(this.options.drop.enabled=!1===a.enabled?!1:!0,this.setOnEvents("drop",a),/^(pointer|center)$/.test(a.overlap)?
this.options.drop.overlap=a.overlap:K(a.overlap)&&(this.options.drop.overlap=Math.max(Math.min(1,a.overlap),0)),"accept"in a&&(this.options.drop.accept=a.accept),"checker"in a&&(this.options.drop.checker=a.checker),this):H(a)?(this.options.drop.enabled=a,this):this.options.drop},dropCheck:function(a,b,c,d,e,h){var f=!1;if(!(h=h||this.getRect(e)))return this.options.drop.checker?this.options.drop.checker(a,b,f,this,e,c,d):!1;var g=this.options.drop.overlap;if("pointer"===g){var k=Da(a),f=na(c,d);k.x+=
f.x;k.y+=f.y;f=k.x>h.left&&k.x<h.right;k=k.y>h.top&&k.y<h.bottom;f=f&&k}k=c.getRect(d);if("center"===g)var f=k.left+k.width/2,l=k.top+k.height/2,f=f>=h.left&&f<=h.right&&l>=h.top&&l<=h.bottom;K(g)&&(f=Math.max(0,Math.min(h.right,k.right)-Math.max(h.left,k.left))*Math.max(0,Math.min(h.bottom,k.bottom)-Math.max(h.top,k.top))/(k.width*k.height)>=g);this.options.drop.checker&&(f=this.options.drop.checker(a,b,f,this,e,c,d));return f},dropChecker:function(a){return A(a)?(this.options.drop.checker=a,this):
null===a?(delete this.options.getRect,this):this.options.drop.checker},accept:function(a){return t(a)||ea(a)?(this.options.drop.accept=a,this):null===a?(delete this.options.drop.accept,this):this.options.drop.accept},resizable:function(a){return z(a)?(this.options.resize.enabled=!1===a.enabled?!1:!0,this.setPerAction("resize",a),this.setOnEvents("resize",a),/^x$|^y$|^xy$/.test(a.axis)?this.options.resize.axis=a.axis:null===a.axis&&(this.options.resize.axis=D.resize.axis),H(a.preserveAspectRatio)?
this.options.resize.preserveAspectRatio=a.preserveAspectRatio:H(a.square)&&(this.options.resize.square=a.square),this):H(a)?(this.options.resize.enabled=a,this):this.options.resize},squareResize:function(a){return H(a)?(this.options.resize.square=a,this):null===a?(delete this.options.resize.square,this):this.options.resize.square},gesturable:function(a){return z(a)?(this.options.gesture.enabled=!1===a.enabled?!1:!0,this.setPerAction("gesture",a),this.setOnEvents("gesture",a),this):H(a)?(this.options.gesture.enabled=
a,this):this.options.gesture},autoScroll:function(a){z(a)?a=x({actions:["drag","resize"]},a):H(a)&&(a={actions:["drag","resize"],enabled:a});return this.setOptions("autoScroll",a)},snap:function(a){a=this.setOptions("snap",a);return a===this?this:a.drag},setOptions:function(a,b){var c=b&&da(b.actions)?b.actions:["drag"],d;if(z(b)||H(b)){for(d=0;d<c.length;d++){var e=/resize/.test(c[d])?"resize":c[d];z(this.options[e])&&(e=this.options[e][a],z(b)?(x(e,b),e.enabled=!1===b.enabled?!1:!0,"snap"===a&&
("grid"===e.mode?e.targets=[l.createSnapGrid(x({offset:e.gridOffset||{x:0,y:0}},e.grid||{}))]:"anchor"===e.mode?e.targets=e.anchors:"path"===e.mode&&(e.targets=e.paths),"elementOrigin"in b&&(e.relativePoints=[b.elementOrigin]))):H(b)&&(e.enabled=b))}return this}c={};e=["drag","resize","gesture"];for(d=0;d<e.length;d++)a in D[e[d]]&&(c[e[d]]=this.options[e[d]][a]);return c},inertia:function(a){a=this.setOptions("inertia",a);return a===this?this:a.drag},getAction:function(a,b,c,d){var e=this.defaultActionChecker(a,
c,d);return this.options.actionChecker?this.options.actionChecker(a,b,e,this,d,c):e},defaultActionChecker:hb,actionChecker:function(a){return A(a)?(this.options.actionChecker=a,this):null===a?(delete this.options.actionChecker,this):this.options.actionChecker},getRect:function(a){a=a||this._element;this.selector&&!t(a)&&(a=this._context.querySelector(this.selector));return ua(a)},rectChecker:function(a){return A(a)?(this.getRect=a,this):null===a?(delete this.options.getRect,this):this.getRect},styleCursor:function(a){return H(a)?
(this.options.styleCursor=a,this):null===a?(delete this.options.styleCursor,this):this.options.styleCursor},preventDefault:function(a){return/^(always|never|auto)$/.test(a)?(this.options.preventDefault=a,this):H(a)?(this.options.preventDefault=a?"always":"never",this):this.options.preventDefault},origin:function(a){return ea(a)||z(a)?(this.options.origin=a,this):this.options.origin},deltaSource:function(a){return"page"===a||"client"===a?(this.options.deltaSource=a,this):this.options.deltaSource},
restrict:function(a){if(!z(a))return this.setOptions("restrict",a);for(var b=["drag","resize","gesture"],c,d=0;d<b.length;d++){var e=b[d];e in a&&(c=x({actions:[e],restriction:a[e]},a),c=this.setOptions("restrict",c))}return c},context:function(){return this._context},_context:Q,ignoreFrom:function(a){return ea(a)||t(a)?(this.options.ignoreFrom=a,this):this.options.ignoreFrom},allowFrom:function(a){return ea(a)||t(a)?(this.options.allowFrom=a,this):this.options.allowFrom},element:function(){return this._element},
fire:function(a){if(!a||!a.type||-1===v(ca,a.type))return this;var b,c,d,e="on"+a.type;if(a.type in this._iEvents)for(b=this._iEvents[a.type],c=0,d=b.length;c<d&&!a.immediatePropagationStopped;c++)b[c](a);if(A(this[e]))this[e](a);if(a.type in U&&(b=U[a.type]))for(c=0,d=b.length;c<d&&!a.immediatePropagationStopped;c++)b[c](a);return this},on:function(a,b,c){var d;N(a)&&-1!==a.search(" ")&&(a=a.trim().split(/ +/));if(da(a)){for(d=0;d<a.length;d++)this.on(a[d],b,c);return this}if(z(a)){for(d in a)this.on(d,
a[d],b);return this}"wheel"===a&&(a=kb);c=c?!0:!1;if(-1!==v(ca,a))a in this._iEvents?this._iEvents[a].push(b):this._iEvents[a]=[b];else if(this.selector){if(!P[a])for(P[a]={selectors:[],contexts:[],listeners:[]},d=0;d<ja.length;d++)n.add(ja[d],a,qa),n.add(ja[d],a,Aa,!0);a=P[a];for(d=a.selectors.length-1;0<=d&&(a.selectors[d]!==this.selector||a.contexts[d]!==this._context);d--);-1===d&&(d=a.selectors.length,a.selectors.push(this.selector),a.contexts.push(this._context),a.listeners.push([]));a.listeners[d].push([b,
c])}else n.add(this._element,a,b,c);return this},off:function(a,b,c){var d;N(a)&&-1!==a.search(" ")&&(a=a.trim().split(/ +/));if(da(a)){for(d=0;d<a.length;d++)this.off(a[d],b,c);return this}if(z(a)){for(var e in a)this.off(e,a[e],b);return this}e=-1;c=c?!0:!1;"wheel"===a&&(a=kb);if(-1!==v(ca,a))(c=this._iEvents[a])&&-1!==(e=v(c,b))&&this._iEvents[a].splice(e,1);else if(this.selector){var h=P[a],f=!1;if(!h)return this;for(e=h.selectors.length-1;0<=e;e--)if(h.selectors[e]===this.selector&&h.contexts[e]===
this._context){var g=h.listeners[e];for(d=g.length-1;0<=d;d--){var k=g[d][1];if(g[d][0]===b&&k===c){g.splice(d,1);g.length||(h.selectors.splice(e,1),h.contexts.splice(e,1),h.listeners.splice(e,1),n.remove(this._context,a,qa),n.remove(this._context,a,Aa,!0),h.selectors.length||(P[a]=null));f=!0;break}}if(f)break}}else n.remove(this._element,a,b,c);return this},set:function(a){z(a)||(a={});this.options=x({},D.base);var b,c=["drag","drop","resize","gesture"],d=["draggable","dropzone","resizable","gesturable"],
e=x(x({},D.perAction),a[h]||{});for(b=0;b<c.length;b++){var h=c[b];this.options[h]=x({},D[h]);this.setPerAction(h,e);this[d[b]](a[h])}c="accept actionChecker allowFrom deltaSource dropChecker ignoreFrom origin preventDefault rectChecker styleCursor".split(" ");b=0;for(Sa=c.length;b<Sa;b++)if(d=c[b],this.options[d]=D.base[d],d in a)this[d](a[d]);return this},unset:function(){n.remove(this._element,"all");if(N(this.selector))for(var a in P)for(var b=P[a];0<b.selectors.length;){b.selectors[0]===this.selector&&
b.contexts[0]===this._context&&(b.selectors.splice(0,1),b.contexts.splice(0,1),b.listeners.splice(0,1),b.selectors.length||(P[a]=null));n.remove(this._context,a,qa);n.remove(this._context,a,Aa,!0);break}else n.remove(this,"all"),this.options.styleCursor&&(this._element.style.cursor="");this.dropzone(!1);B.splice(v(B,this),1);return l}};C.prototype.snap=M(C.prototype.snap,"Interactable#snap is deprecated. See the new documentation for snapping at http://interactjs.io/docs/snapping");C.prototype.restrict=
M(C.prototype.restrict,"Interactable#restrict is deprecated. See the new documentation for resticting at http://interactjs.io/docs/restriction");C.prototype.inertia=M(C.prototype.inertia,"Interactable#inertia is deprecated. See the new documentation for inertia at http://interactjs.io/docs/inertia");C.prototype.autoScroll=M(C.prototype.autoScroll,"Interactable#autoScroll is deprecated. See the new documentation for autoScroll at http://interactjs.io/docs/#autoscroll");C.prototype.squareResize=M(C.prototype.squareResize,
"Interactable#squareResize is deprecated. See http://interactjs.io/docs/#resize-square");C.prototype.accept=M(C.prototype.accept,"Interactable#accept is deprecated. use Interactable#dropzone({ accept: target }) instead");C.prototype.dropChecker=M(C.prototype.dropChecker,"Interactable#dropChecker is deprecated. use Interactable#dropzone({ dropChecker: checkerFunction }) instead");C.prototype.context=M(C.prototype.context,"Interactable#context as a method is deprecated. It will soon be a DOM Node instead");
l.isSet=function(a,b){return-1!==B.indexOfElement(a,b&&b.context)};l.on=function(a,b,c){N(a)&&-1!==a.search(" ")&&(a=a.trim().split(/ +/));if(da(a)){for(var d=0;d<a.length;d++)l.on(a[d],b,c);return l}if(z(a)){for(d in a)l.on(d,a[d],b);return l}-1!==v(ca,a)?U[a]?U[a].push(b):U[a]=[b]:n.add(Q,a,b,c);return l};l.off=function(a,b,c){N(a)&&-1!==a.search(" ")&&(a=a.trim().split(/ +/));if(da(a)){for(var d=0;d<a.length;d++)l.off(a[d],b,c);return l}if(z(a)){for(d in a)l.off(d,a[d],b);return l}if(-1===v(ca,
a))n.remove(Q,a,b,c);else{var e;a in U&&-1!==(e=v(U[a],b))&&U[a].splice(e,1)}return l};l.enableDragging=M(function(a){return null!==a&&void 0!==a?(S.drag=a,l):S.drag},"interact.enableDragging is deprecated and will soon be removed.");l.enableResizing=M(function(a){return null!==a&&void 0!==a?(S.resize=a,l):S.resize},"interact.enableResizing is deprecated and will soon be removed.");l.enableGesturing=M(function(a){return null!==a&&void 0!==a?(S.gesture=a,l):S.gesture},"interact.enableGesturing is deprecated and will soon be removed.");
l.eventTypes=ca;l.debug=function(){var a=r[0]||new xa;return{interactions:r,target:a.target,dragging:a.dragging,resizing:a.resizing,gesturing:a.gesturing,prepared:a.prepared,matches:a.matches,matchElements:a.matchElements,prevCoords:a.prevCoords,startCoords:a.startCoords,pointerIds:a.pointerIds,pointers:a.pointers,addPointer:m.addPointer,removePointer:m.removePointer,recordPointer:m.recordPointer,snap:a.snapStatus,restrict:a.restrictStatus,inertia:a.inertiaStatus,downTime:a.downTimes[0],downEvent:a.downEvent,
downPointer:a.downPointer,prevEvent:a.prevEvent,Interactable:C,interactables:B,pointerIsDown:a.pointerIsDown,defaultOptions:D,defaultActionChecker:hb,actionCursors:za,dragMove:m.dragMove,resizeMove:m.resizeMove,gestureMove:m.gestureMove,pointerUp:m.pointerUp,pointerDown:m.pointerDown,pointerMove:m.pointerMove,pointerHover:m.pointerHover,eventTypes:ca,events:n,globalEvents:U,delegatedEvents:P,prefixedPropREs:Ca}};l.getPointerAverage=Ya;l.getTouchBBox=Ha;l.getTouchDistance=Ia;l.getTouchAngle=Ja;l.getElementRect=
ua;l.getElementClientRect=Fa;l.matchesSelector=R;l.closest=Ka;l.margin=M(function(a){return K(a)?(pa=a,l):pa},"interact.margin is deprecated. Use interact(target).resizable({ margin: number }); instead.");l.supportsTouch=function(){return ga};l.supportsPointerEvent=function(){return oa};l.stop=function(a){for(var b=r.length-1;0<=b;b--)r[b].stop(a);return l};l.dynamicDrop=function(a){return H(a)?(Pa=a,l):Pa};l.pointerMoveTolerance=function(a){return K(a)?(Qa=a,this):Qa};l.maxInteractions=function(a){return K(a)?
(wa=a,this):wa};l.createSnapGrid=function(a){return function(b,c){var d=0,e=0;z(a.offset)&&(d=a.offset.x,e=a.offset.y);return{x:Math.round((b-d)/a.x)*a.x+d,y:Math.round((c-e)/a.y)*a.y+e,range:a.range}}};ib(Q);Oa in Element.prototype&&A(Element.prototype[Oa])||(ka=function(a,b,c){c=c||a.parentNode.querySelectorAll(b);b=0;for(var d=c.length;b<d;b++)if(c[b]===a)return!0;return!1});(function(){for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!F.requestAnimationFrame;++c)T=F[b[c]+"RequestAnimationFrame"],
X=F[b[c]+"CancelAnimationFrame"]||F[b[c]+"CancelRequestAnimationFrame"];T||(T=function(b){var c=(new Date).getTime(),h=Math.max(0,16-(c-a)),f=setTimeout(function(){b(c+h)},h);a=c+h;return f});X||(X=function(a){clearTimeout(a)})})();"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=l),exports.interact=l):"function"===typeof define&&define.amd?define("interact",function(){return l}):F.interact=l}})("undefined"===typeof window?void 0:window);
//# sourceMappingURL=interact.min.js.map

(function() {

  // constructor
  this.ScrollPanes = function(elm, options){
    this.panes = document.querySelectorAll(elm);
    this.scrollPoints = [];
    this.interval = false;
    this.is_init = false;
    this.scroller;
    this.index = 0;
    this.lastScrollTop = 0;

    // default options
    var defaults = {
      'minWidth': 1022,
      'touch': true
    }

    // Create options by extending defaults with the passed in arugments
    if (arguments[1] && typeof arguments[1] === 'object') {
      this.options = extendDefaults(defaults, arguments[1]);
    } else {
      this.options = defaults;
    }

    // init the scroller
    window.onload = function() {
      this.init()
      this.bindListeners();
    }.bind(this);

  }

  ScrollPanes.prototype.init = function() {
    if( window.innerWidth > this.options.minWidth) {
      // init scrollpanes if not yet done
      if(!this.is_init) {
        createScroller.call(this);
        reCalcScrollPoints.call(this);
        this.bindEvents.call(this);
        this.is_init = true;
      }
    } else {
      // teardown scrollpanes if init
      if(this.is_init) {
        clearInterval(this.interval);
        this.interval = false;
        this.is_init = false;
        this.resetScreens();
      }
    }
  }


  ScrollPanes.prototype.is_touch_device = function() {
    return (('ontouchstart' in window)
         || (navigator.MaxTouchPoints > 0)
         || (navigator.msMaxTouchPoints > 0));
  }

  ScrollPanes.prototype.resetScreens = function() {
    for (var i = 0, len = this.panes.length; i < len; i++) {
      this.panes[i].removeAttribute('style');
    }
    document.body.removeChild(this.scroller);
  }

  ScrollPanes.prototype.bindListeners = function() {
    window.addEventListener('resize', this.init.bind(this), false);
    window.addEventListener('orientationchange', this.init.bind(this), false);
  }

  ScrollPanes.prototype.bindEvents = function() {

    interact('body').draggable({
      inertia: true,
      autoScroll: false,
      onend: function(e) {
        // this.lastScrollTop = Math.min(0, this.lastScrollTop - (e.clientY0 - e.clientY));
        this.lastScrollTop = this.lastScrollTop - (e.clientY0 - e.clientY);
        console.log(this.lastScrollTop);
      }.bind(this),
      restrict: {
        elementRect: { left: 0, right: 0, top: 1, bottom: 1 }
      },
      onmove: function(e){
        handleScroll.call(this, e, this.lastScrollTop - (e.clientY0 - e.clientY));

      }.bind(this)
    });
    // if(!this.is_touch_device() && !this.interval) {
    //   this.interval = setInterval(handleScroll.bind(this), 20);
    // } else {
    //   if( this.options.touch === true ) {
    //     if (typeof Impetus != 'undefined') {
    //       // calculate outer bounds
    //       var h = (parseInt(this.scroller.style.height) - window.innerHeight) * -1;
    //       new Impetus({
    //         source: document.querySelector('body'),
    //         multiplier: 1.3,
    //         boundY: [h, 0],
    //         update: function(x, y) {
    //           handleScroll.call(this, 'touch', y)
    //         }.bind(this)
    //       });
    //     } else {
    //       alert('Include ImpetusJS to support touch devices');
    //     }
    //   }
    // }
  }

  var reCalcScrollPoints = function() {
    // empty out the array
    this.scrollPoints = [];

    // calc height of panes
    for (var i = 0, len = this.panes.length; i < len; i++) {
      var oHeight = this.panes[i].offsetHeight;
      var nHeight = (i > 0) ? (oHeight + this.scrollPoints[i-1]) : oHeight;
      this.scrollPoints.push(nHeight);
    }

    // prepend 0 to the array
    this.scrollPoints.unshift(0);

    // set the scrolling height
    this.scroller.style.height = this.scrollPoints[this.scrollPoints.length - 1] + 'px';
  }

  var createScroller = function() {
    // create the scroller element to enable scrolling
    this.scroller = document.createElement('div');
    this.scroller.style.position = 'absolute';
    this.scroller.style.width = '1px';
    document.body.appendChild(this.scroller);
  }


  var handleScroll = function(event, offset) {
    var offset = offset || window.pageYOffset*-1;
    var pane = this.panes[this.index];
    var scrollOffset = (offset + this.scrollPoints[this.index]);

    // scrollOffset = Math.min(0, scrollOffset);
    pane.style['transform'] = 'translate3d(0px,' + scrollOffset + 'px, 0px)';
    pane.style['-mstransform'] = 'translate3d(0px,' + scrollOffset + 'px, 0px)';
    pane.style['-webkit-transform'] = 'translate3d(0px,' + scrollOffset + 'px, 0px)';

    // force element repaint on touch devices
    if(this.is_touch_device() && !pane.dataset.haspaint) {
      pane.style.display='none';
      pane.offsetHeight; // no need to store this anywhere, the reference is enough
      pane.style.display='';
      pane.dataset.haspaint = 'yes';
    }

    if((offset*-1) > this.scrollPoints[this.index + 1]) {
      this.index++;
      this.index = Math.min(this.index, this.panes.length - 2);
    }

    if((offset*-1) < this.scrollPoints[this.index]) {
      // make all the panels hard snap to the top, except the first one, which may bounce
      if( this.index > 0 ) {
        pane.style['transform'] = 'translate3d(0px,0px,0px)';
        pane.style['-mstransform'] = 'translate3d(0px,0px,0px)';
        pane.style['-webkit-transform'] = 'translate3d(0px,0px,0px)';
      }

      this.index--;
      this.index = Math.max(0, this.index);
    }
  }

  var is_touch_device = function() {
   return (('ontouchstart' in window)
        || (navigator.MaxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
  }

  // Utility method to extend defaults with user options
  var extendDefaults = function(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }

}());












$(document).ready(function() {

  var panes = new ScrollPanes('.panel', {touch: false});

  $('html').addClass( panes.is_touch_device() ? 'touch' : 'no-touch');


  // load the aftermovie in a fancybox
  $('.aftermovie').fancybox({
    openEffect  : 'none',
		closeEffect : 'none',
    margin: 40,
		helpers : {
			media : {}
		}
  });
});
