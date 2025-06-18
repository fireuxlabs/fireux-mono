// Misebox steam effect composable
export function useSteam() {
  const initializeSteam = () => {
    const steamPuffs = document.querySelectorAll('.steam-puff')

    steamPuffs.forEach((puff) => {
      const puffElement = puff as HTMLElement

      // Random horizontal position
      puffElement.style.left = `${Math.random() * 100}%`

      // Start at random positions
      const startingPoint = Math.random() * 100
      puffElement.style.top = `${startingPoint}%`

      // Initial transform
      const initialYPos = 100 - startingPoint
      puffElement.style.transform = `translateY(${initialYPos}vh)`

      // Random size for steam clouds
      const size = Math.random() * 40 + 20 // 20-60px
      puffElement.style.width = `${size}px`
      puffElement.style.height = `${size}px`

      // Random initial opacity
      const initialOpacity = Math.random() * 0.4 + 0.1
      puffElement.style.opacity = initialOpacity.toString()

      // Random durations for organic movement
      const riseDuration = Math.random() * 6 + 10 // 10-16 seconds
      const expandDuration = Math.random() * 4 + 6 // 6-10 seconds
      const drift = Math.random() * 8 + 4 // 4-12 seconds

      // Staggered delays
      const riseDelay = -(riseDuration * (startingPoint / 100))
      const expandDelay = Math.random() * 3
      const driftDelay = Math.random() * 4

      puffElement.style.animationDelay = `${expandDelay}s, ${riseDelay}s, ${driftDelay}s`
      puffElement.style.animationDuration = `${expandDuration}s, ${riseDuration}s, ${drift}s`

      // Reset on animation cycle
      puffElement.addEventListener('animationiteration', () => {
        puffElement.style.top = '100%'
        puffElement.style.transform = `translateY(-100vh)`
      })
    })
  }

  return {
    initializeSteam,
  }
}
