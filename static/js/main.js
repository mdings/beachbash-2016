
function is_touch_device() {
  return 'ontouchstart' in window        // works on most browsers
      || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

$(document).ready(function() {

  // init fastclick
  FastClick.attach(document.body);

  // wait for images to load as well
  $(window).load(function(){
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

    $(this).on('resize', function(){
      if($(this).width() > 768) {
        panes.refresh();
      } else {
        panes.destroy();
      }
    }).trigger('resize');

    $('.nav-desktop').find('a').on('click', function(){
      var href = $(this).attr('href');
      var offset = panes.scrollTo(href);
      return false;
    });
  })


  $('html').addClass( is_touch_device() ? 'touch' : 'no-touch');


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
