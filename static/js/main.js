var $panels = $('.panel');
var scrollPoints = [];
var index = 0;
var lastScrollTop = 0;

var reCalculatePanels = function() {
  scrollPoints = [];
  $panels.each(function(i, elm){
    var nHeight = (i > 0) ? ($(this).outerHeight() + scrollPoints[i-1]) : $(this).outerHeight();
    scrollPoints.push(nHeight);
  });

  // prepend 0 to the array
  scrollPoints.unshift(0);

  // set the scrollable page
  $('.scroller').height(scrollPoints[scrollPoints.length - 1]);
}


var is_touch_device = function() {
 return (('ontouchstart' in window)
      || (navigator.MaxTouchPoints > 0)
      || (navigator.msMaxTouchPoints > 0));
}


$(document).ready(function() {

  $('html').addClass( is_touch_device() ? 'touch' : 'no-touch');

  if(!is_touch_device()) {
    reCalculatePanels();

    $(window).on('scroll', function(e) {
      var $win = $(this);
      var scrollOffset = ($win.scrollTop() - scrollPoints[index]) * -1;
      scrollOffset = scrollOffset < 0 ? scrollOffset : 0; // scrollOffset can never be smaller than 0!
      $($panels[index]).css('transform', 'translateY(' + scrollOffset  + 'px)');

      if ($win.scrollTop() > lastScrollTop){
        if( $win.scrollTop() > scrollPoints[index+1]) {
          index++;

        }
      } else {
        if( $win.scrollTop() < scrollPoints[index]) {
          index--;
        }
      }
      lastScrollTop = $win.scrollTop();

    }).trigger('scroll');

    $(window).on('resize orientationchange', function(e){
      reCalculatePanels();
      $(this).trigger('scroll');
    });
  }


  // flashing bg on bumper panel
  setInterval(function(){
    $('.panel-bumper').toggleClass('is-inverse');
  }, 50);

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
