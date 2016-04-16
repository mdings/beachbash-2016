(function() {

  // constructor
  this.ScrollPanes = function(elm, options){
    this.panes = document.querySelectorAll(elm);
    this.scrollPoints = [];
    this.scroller;
    this.index = 0;
    this.lastScrollTop = 0;

    // default options
    var defaults = {
      'minWidth': 1023,
      'touch': true
    }

    // Create options by extending defaults with the passed in arugments
    if (arguments[1] && typeof arguments[1] === 'object') {
      this.options = extendDefaults(defaults, arguments[1]);
    } else {
      this.options = defaults;
    }

    // init the scroller
    if (window.innerWidth > this.options.minWidth) {
      this.init();
    }

  }

  ScrollPanes.prototype.init = function() {
    window.onload = function(){
      createScroller.call(this);
      reCalcScrollPoints.call(this);
      bindEvents.call(this);
    }.bind(this);
  }

  ScrollPanes.prototype.is_touch_device = function() {
    return (('ontouchstart' in window)
         || (navigator.MaxTouchPoints > 0)
         || (navigator.msMaxTouchPoints > 0));
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

  var bindEvents = function() {
    window.addEventListener('resize', handleScreenChange.bind(this), false);
    window.addEventListener('orientationchange', handleScreenChange.bind(this), false);

    if(!this.is_touch_device()) {
      window.addEventListener('scroll', handleScroll.bind(this), false);
    } else {
      if( this.options.touch === true ) {
        if (typeof Impetus != 'undefined') {
          // calculate outer bounds
          var h = (parseInt(this.scroller.style.height) - window.innerHeight) * -1;
          new Impetus({
            source: document.querySelector('body'),
            multiplier: 1.3,
            boundY: [h, 0],
            update: function(x, y) {
              handleScroll.call(this, 'touch', y)
            }.bind(this)
          });
        } else {
          alert('Include ImpetusJS to support touch devices');
        }
      }
    }
  }

  var handleScreenChange = function() {
    if(window.innerWidth > this.options.minWidth) {
      reCalcScrollPoints.bind(this);
    } else {
      console.log('removing handlers')
      window.removeEventListener('scroll', handleScroll.bind(this), false);
    }

  }

  var handleScroll = function(event, offset) {
    var offset = offset || window.pageYOffset*-1;
    var pane = this.panes[this.index];
    var scrollOffset = (offset + this.scrollPoints[this.index]);
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

  var panes = new ScrollPanes('.panel');


  $('html').addClass( panes.is_touch_device() ? 'touch' : 'no-touch');

  // if(!is_touch_device()) {
  //   reCalculatePanels();
  //
  //   $(window).on('scroll', function(e) {
  //     var $win = $(this);
  //     var scrollOffset = ($win.scrollTop() - scrollPoints[index]) * -1;
  //     scrollOffset = scrollOffset < 0 ? scrollOffset : 0; // scrollOffset can never be smaller than 0!
  //     $($panels[index]).css('transform', 'translateY(' + scrollOffset  + 'px)');
  //
  //     if ($win.scrollTop() > lastScrollTop){
  //       if( $win.scrollTop() > scrollPoints[index+1]) {
  //         index++;
  //
  //       }
  //     } else {
  //       if( $win.scrollTop() < scrollPoints[index]) {
  //         index--;
  //       }
  //     }
  //     lastScrollTop = $win.scrollTop();
  //
  //   }).trigger('scroll');
  //
  //   $(window).on('resize orientationchange', function(e){
  //     reCalculatePanels();
  //     $(this).trigger('scroll');
  //   });
  // }
  //
  //
  // // flashing bg on bumper panel
  // if(!is_touch_device()) {
  //   setInterval(function() {
  //     $('.panel-bumper').toggleClass('is-inverse');
  //   }, 50);
  // }


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
