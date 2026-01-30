// Cleanbox bubble effect composable
export function useBubbles() {
  const initializeBubbles = () => {
    const bubbles = document.querySelectorAll('.bubble')

    bubbles.forEach((bubble) => {
      const bubbleElement = bubble as HTMLElement

      // Random horizontal position
      bubbleElement.style.left = `${Math.random() * 100}%`

      // Start at random positions in the animation cycle
      const startingPoint = Math.random() * 100
      bubbleElement.style.top = `${startingPoint}%`

      // Random horizontal drift
      const xOffset = (Math.random() - 0.5) * 100 // -50 to 50px

      // Initial transform to sync animation
      const initialYPos = 100 - startingPoint
      bubbleElement.style.transform = `translate(${xOffset}px, ${initialYPos}vh)`

      // Random size for variety
      const size = Math.random() * 20 + 10 // 10-30px
      bubbleElement.style.width = `${size}px`
      bubbleElement.style.height = `${size}px`

      // Random initial opacity
      const initialOpacity = Math.random() * 0.3 + 0.1
      bubbleElement.style.opacity = initialOpacity.toString()

      // Random durations for natural movement
      const floatDuration = Math.random() * 5 + 10 // 10-15 seconds
      const popDuration = Math.random() * 2 + 2 // 2-4 seconds
      const sway = Math.random() * 3 + 2 // 2-5 seconds
      const rotateDuration = Math.random() * 10 + 5 // 5-15 seconds

      // Use negative delay to start at different animation points
      const floatDelay = -(floatDuration * (startingPoint / 100))
      const popDelay = Math.random() * 3
      const swayDelay = Math.random() * 2

      bubbleElement.style.animationDelay = `${popDelay}s, ${floatDelay}s, ${swayDelay}s, ${Math.random() * 5}s`
      bubbleElement.style.animationDuration = `${popDuration}s, ${floatDuration}s, ${sway}s, ${rotateDuration}s`

      // Listen for animation end and reset bubble position
      bubbleElement.addEventListener('animationiteration', () => {
        bubbleElement.style.top = '100%' // Move back to bottom
        bubbleElement.style.transform = `translate(${xOffset}px, -100vh)` // Start floating up again
      })
    })
  }

  return {
    initializeBubbles,
  }
}
