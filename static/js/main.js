
function is_touch_device() {
  return 'ontouchstart' in window        // works on most browsers
      || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

$(document).ready(function() {


  var panes = new Wicket('.panel', {
    touch: true,
    change: function(index) {
      var href = $('.panel').eq(index).attr('id');
      if(href) {
        $('.nav-desktop')
          .find('a').removeClass('active')
          .parent()
          .find('a[href="#'+href+'"]')
          .addClass('active');
      }
    }
  });

  $(window).on('resize', function(){
    if($(this).width() > 1023) {
      panes.refresh();
    } else {
      panes.destroy();
    }
  }).trigger('resize');

  $('.nav-desktop').find('a').click(function(){
    var href = $(this).attr('href');
    var offset = panes.scrollOffset(href);
    $('html, body').animate({
      scrollTop: offset + 1
    }, 500)
    return false;
  });

  $('html').addClass( is_touch_device() ? 'touch' : 'no-touch');


  // setInterval(function(){
  //   $('.panel-bumper').toggleClass('is-inverse');
  // }, 50);

  // load the aftermovie in a fancybox
  $('.aftermovie').fancybox({
    openEffect  : 'none',
		closeEffect : 'none',
    margin: 40,
		helpers : {
			media : {}
		}
  });
})
