"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBubbles = useBubbles;
// Cleanbox bubble effect composable
function useBubbles() {
    var initializeBubbles = function () {
        var bubbles = document.querySelectorAll('.bubble');
        bubbles.forEach(function (bubble) {
            var bubbleElement = bubble;
            // Random horizontal position
            bubbleElement.style.left = "".concat(Math.random() * 100, "%");
            // Start at random positions in the animation cycle
            var startingPoint = Math.random() * 100;
            bubbleElement.style.top = "".concat(startingPoint, "%");
            // Initial transform to sync animation
            var initialYPos = 100 - startingPoint;
            bubbleElement.style.transform = "translateY(".concat(initialYPos, "vh)");
            // Random size for variety
            var size = Math.random() * 20 + 10; // 10-30px
            bubbleElement.style.width = "".concat(size, "px");
            bubbleElement.style.height = "".concat(size, "px");
            // Random initial opacity
            var initialOpacity = Math.random() * 0.3 + 0.1;
            bubbleElement.style.opacity = initialOpacity.toString();
            // Random durations for natural movement
            var floatDuration = Math.random() * 5 + 8; // 8-13 seconds
            var popDuration = Math.random() * 2 + 2; // 2-4 seconds
            var sway = Math.random() * 3 + 2; // 2-5 seconds
            // Use negative delay to start at different animation points
            var floatDelay = -(floatDuration * (startingPoint / 100));
            var popDelay = Math.random() * 3;
            var swayDelay = Math.random() * 2;
            bubbleElement.style.animationDelay = "".concat(popDelay, "s, ").concat(floatDelay, "s, ").concat(swayDelay, "s");
            bubbleElement.style.animationDuration = "".concat(popDuration, "s, ").concat(floatDuration, "s, ").concat(sway, "s");
            // Listen for animation end and reset bubble position
            bubbleElement.addEventListener('animationiteration', function () {
                bubbleElement.style.top = '100%'; // Move back to bottom
                bubbleElement.style.transform = "translateY(-100vh)"; // Start floating up again
            });
        });
    };
    return {
        initializeBubbles: initializeBubbles,
    };
}
