// FILE: /packages/tenants/fireux-cleanbox/src/runtime/composables/app/utils/effects/useLandingEffect.ts
// Unified landing effect composable for this tenant
export function useLandingEffect() {
  const initializeEffect = (
    effectType: 'stars' | 'bubbles' | 'steam' | 'code'
  ) => {
    const elements = document.querySelectorAll('.effect-particle')

    for (const element of elements) {
      const particleElement = element as HTMLElement

      // Common positioning
      particleElement.style.left = `${Math.random() * 100}%`
      const startingPoint = Math.random() * 100
      particleElement.style.top = `${startingPoint}%`
      const initialYPos = 100 - startingPoint
      particleElement.style.transform = `translateY(${initialYPos}vh)`

      switch (effectType) {
        case 'stars':
          initializeStars(particleElement, startingPoint)
          break
        case 'bubbles':
          initializeBubbles(particleElement, startingPoint)
          break
        case 'steam':
          initializeSteam(particleElement, startingPoint)
          break
        case 'code':
          initializeCode(particleElement, startingPoint)
          break
      }
    }
  }

  const initializeStars = (element: HTMLElement, startingPoint: number) => {
    const size = Math.random() * 1.5 + 1
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    const initialOpacity = Math.random() * 0.4 + 0.1
    element.style.opacity = initialOpacity.toString()
    const twinkleDuration = Math.random() * 3 + 3
    const moveDuration = Math.random() * 340 + 340
    const moveDelay = -(moveDuration * (startingPoint / 100))
    const twinkleDelay = Math.random() * 2
    element.style.animationDelay = `${twinkleDelay}s, ${moveDelay}s`
    element.style.animationDuration = `${twinkleDuration}s, ${moveDuration}s`
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeBubbles = (element: HTMLElement, startingPoint: number) => {
    const size = Math.random() * 20 + 10
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    const initialOpacity = Math.random() * 0.3 + 0.1
    element.style.opacity = initialOpacity.toString()
    const floatDuration = Math.random() * 5 + 8
    const popDuration = Math.random() * 2 + 2
    const sway = Math.random() * 3 + 2
    const floatDelay = -(floatDuration * (startingPoint / 100))
    const popDelay = Math.random() * 3
    const swayDelay = Math.random() * 2
    element.style.animationDelay = `${popDelay}s, ${floatDelay}s, ${swayDelay}s`
    element.style.animationDuration = `${popDuration}s, ${floatDuration}s, ${sway}s`
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeSteam = (element: HTMLElement, startingPoint: number) => {
    const size = Math.random() * 40 + 20
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    const initialOpacity = Math.random() * 0.4 + 0.1
    element.style.opacity = initialOpacity.toString()
    const riseDuration = Math.random() * 6 + 10
    const expandDuration = Math.random() * 4 + 6
    const drift = Math.random() * 8 + 4
    const riseDelay = -(riseDuration * (startingPoint / 100))
    const expandDelay = Math.random() * 3
    const driftDelay = Math.random() * 4
    element.style.animationDelay = `${expandDelay}s, ${riseDelay}s, ${driftDelay}s`
    element.style.animationDuration = `${expandDuration}s, ${riseDuration}s, ${drift}s`
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeCode = (element: HTMLElement, startingPoint: number) => {
    const size = Math.random() * 8 + 12
    element.style.fontSize = `${size}px`
    const initialOpacity = Math.random() * 0.5 + 0.3
    element.style.opacity = initialOpacity.toString()
    const riseDuration = Math.random() * 8 + 15
    const glowDuration = Math.random() * 3 + 2
    const drift = Math.random() * 5 + 4
    const riseDelay = -(riseDuration * (startingPoint / 100))
    const glowDelay = Math.random() * 3
    const driftDelay = Math.random() * 2
    element.style.animationDelay = `${glowDelay}s, ${riseDelay}s, ${driftDelay}s`
    element.style.animationDuration = `${glowDuration}s, ${riseDuration}s, ${drift}s`
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  return { initializeEffect }
}
