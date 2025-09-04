// COMMENT: app/composables/app/effects/useStarfield.ts
export function useStarfield() {
  const initializeStars = () => {
    const stars = document.querySelectorAll('.star')

    stars.forEach((star) => {
      const starElement = star as HTMLElement

      // ✅ Random horizontal position only
      starElement.style.left = `${Math.random() * 100}%`

      // ✅ Start at random positions in the animation cycle
      const startingPoint = Math.random() * 100
      starElement.style.top = `${startingPoint}%`

      // ✅ Initial transform to sync animation
      const initialYPos = 100 - startingPoint
      starElement.style.transform = `translateY(${initialYPos}vh)`

      // ✅ Random size
      const size = Math.random() * 1.5 + 1
      starElement.style.width = `${size}px`
      starElement.style.height = `${size}px`

      // ✅ Random initial opacity (0.1 to 0.5)
      const initialOpacity = Math.random() * 0.4 + 0.1
      starElement.style.opacity = initialOpacity.toString()

      // ✅ Random durations
      const twinkleDuration = Math.random() * 3 + 3
      const moveDuration = Math.random() * 340 + 340 // ⭐ Controls speed of movement upwards

      // ✅ Use negative delay to start at different animation points
      const moveDelay = -(moveDuration * (startingPoint / 100))
      const twinkleDelay = Math.random() * 2

      starElement.style.animationDelay = `${twinkleDelay}s, ${moveDelay}s`
      starElement.style.animationDuration = `${twinkleDuration}s, ${moveDuration}s`

      // ✅ Listen for animation end and reset star position
      starElement.addEventListener('animationiteration', () => {
        starElement.style.top = '100%'
        starElement.style.transform = `translateY(-100vh)`
      })
    })
  }

  return {
    initializeStars,
  }
}
