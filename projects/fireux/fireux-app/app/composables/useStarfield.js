"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStarfield = useStarfield;
// StarField effect for FireUX
function useStarfield() {
    var initializeStarfield = function () {
        var stars = document.querySelectorAll('.star');
        stars.forEach(function (star) {
            var starElement = star;
            // Random horizontal position
            starElement.style.left = "".concat(Math.random() * 100, "%");
            // Start at random positions in the animation cycle
            var startingPoint = Math.random() * 100;
            starElement.style.top = "".concat(startingPoint, "%");
            // Initial transform to sync animation
            var initialYPos = 100 - startingPoint;
            starElement.style.transform = "translateY(".concat(initialYPos, "vh)");
            // Random size
            var size = Math.random() * 1.5 + 1;
            starElement.style.width = "".concat(size, "px");
            starElement.style.height = "".concat(size, "px");
            // Random opacity
            var initialOpacity = Math.random() * 0.4 + 0.1;
            starElement.style.opacity = initialOpacity.toString();
            // Random durations
            var twinkleDuration = Math.random() * 3 + 3;
            var moveDuration = Math.random() * 340 + 340;
            // Animation setup
            var moveDelay = -(moveDuration * (startingPoint / 100));
            var twinkleDelay = Math.random() * 2;
            starElement.style.animationDelay = "".concat(twinkleDelay, "s, ").concat(moveDelay, "s");
            starElement.style.animationDuration = "".concat(twinkleDuration, "s, ").concat(moveDuration, "s");
            // Reset on animation end
            starElement.addEventListener('animationiteration', function () {
                starElement.style.top = '100%';
                starElement.style.transform = "translateY(-100vh)";
            });
        });
    };
    return {
        initializeStarfield: initializeStarfield,
    };
}
