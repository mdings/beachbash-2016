$(document).ready(function() {

  var $panes = $('.panel');
  var $scrollPoints = new Array();
  var $offset = 0;
  var $index = 0;
  var $lastScrollTop = 0;

  $panes.each(function(i, elm){
    var nHeight = (i > 0) ? ($(this).outerHeight() + $scrollPoints[i-1]) : $(this).outerHeight();
    $scrollPoints.push(nHeight);
  });

  // prepend 0 to the array
  $scrollPoints.unshift(0);

  // set the scrollable page
  $('.scroller').height($scrollPoints[$scrollPoints.length - 1]);

  $(window).on('scroll', function(e) {
    var $win = $(this);


    var scrollOffset = ($win.scrollTop() - $scrollPoints[$index]) * -1;
    scrollOffset = scrollOffset < 0 ? scrollOffset : 0; // scrollOffset can never be smaller than 0!
    $($panes[$index]).css('transform', 'translateY(' + scrollOffset  + 'px)');



    if ($win.scrollTop() > $lastScrollTop){
      if( $win.scrollTop() > $scrollPoints[$index+1]) {
        $index++;

      }
    } else {
      if( $win.scrollTop() < $scrollPoints[$index]) {
        $index--;
      }
    }
    $lastScrollTop = $win.scrollTop();

    // if( $win.scrollTop() > $scrollPane.height() ) {
    //   $offset = $scrollPane.height();
    //   $scrollPane = $('.panel.two');
    // }

  }).trigger('scroll');

  setInterval(function(){
    $('.panel-three').toggleClass('is-inverse');
  }, 50);
});
