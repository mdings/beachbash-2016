$(document).ready(function() {

  $('.aftermovie').fancybox({
    openEffect  : 'none',
		closeEffect : 'none',
    margin: 40,
		helpers : {
			media : {}
		}
  });

  // handle the fixed backgrounds like a MF
  $(window).scroll(function(){

    var $panelTout = $('.panel-tout');
    var $panelIntro = $('.panel-intro');
    var $panelPayoff = $('.panel-payoff');
    var $panelQA = $('.panel-qa');
    var $panelLineUp = $('.panel-line-up');
    var $panelExit = $('.panel-exit');

    $panelTout.toggleClass('is-offscreen', $(this).scrollTop() > $panelIntro.offset().top)

  }).trigger('scroll');

  setInterval(function(){
    $('.panel-payoff').toggleClass('is-inverse');
  }, 50);
});
