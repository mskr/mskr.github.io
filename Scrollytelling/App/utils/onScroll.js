// Scroll event throttling
// https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event
// http://www.html5rocks.com/en/tutorials/speed/animations/

let lastKnownScrollPosition = 0;
let ticking = false;

export default function onScroll(callback) {
  document.addEventListener('scroll', function(e) {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function() {
        callback(lastKnownScrollPosition);
        ticking = false;
      });

      ticking = true;
    }
  });
}