// StarField effect for FireUX
export function useStarfield() {
  const initializeStarfield = () => {
    const stars = document.querySelectorAll('.star')

    stars.forEach((star) => {
      const starElement = star as HTMLElement

      // Random horizontal position
      starElement.style.left = `${Math.random() * 100}%`

      // Start at random positions in the animation cycle
      const startingPoint = Math.random() * 100
      starElement.style.top = `${startingPoint}%`

      // Initial transform to sync animation
      const initialYPos = 100 - startingPoint
      starElement.style.transform = `translateY(${initialYPos}vh)`

      // Random size
      const size = Math.random() * 1.5 + 1
      starElement.style.width = `${size}px`
      starElement.style.height = `${size}px`

      // Random opacity
      const initialOpacity = Math.random() * 0.4 + 0.1
      starElement.style.opacity = initialOpacity.toString()

      // Random durations
      const twinkleDuration = Math.random() * 3 + 3
      const moveDuration = Math.random() * 340 + 340

      // Animation setup
      const moveDelay = -(moveDuration * (startingPoint / 100))
      const twinkleDelay = Math.random() * 2

      starElement.style.animationDelay = `${twinkleDelay}s, ${moveDelay}s`
      starElement.style.animationDuration = `${twinkleDuration}s, ${moveDuration}s`

      // Reset on animation end
      starElement.addEventListener('animationiteration', () => {
        starElement.style.top = '100%'
        starElement.style.transform = `translateY(-100vh)`
      })
    })
  }

  return {
    initializeStarfield,
  }
}
