// COMMENT: app/composables/effects/useFloatingParticles.ts
export function useFloatingParticles() {
  const initializeParticles = () => {
    const particles = document.querySelectorAll('.particle')

    particles.forEach((particle) => {
      const particleElement = particle as HTMLElement

      // ✅ Random horizontal and vertical positions
      const startX = Math.random() * 100
      const startY = Math.random() * 100
      particleElement.style.left = `${startX}%`
      particleElement.style.top = `${startY}%`

      // ✅ Random size (smaller, more subtle)
      const size = Math.random() * 4 + 2
      particleElement.style.width = `${size}px`
      particleElement.style.height = `${size}px`

      // ✅ Random opacity for depth
      const opacity = Math.random() * 0.6 + 0.2
      particleElement.style.opacity = opacity.toString()

      // ✅ Random movement direction and speed
      const moveX = (Math.random() - 0.5) * 200 // -100 to 100
      const moveY = (Math.random() - 0.5) * 200
      const duration = Math.random() * 20 + 15 // 15-35 seconds

      // ✅ Set custom properties for animation
      particleElement.style.setProperty('--move-x', `${moveX}px`)
      particleElement.style.setProperty('--move-y', `${moveY}px`)
      particleElement.style.animationDuration = `${duration}s`

      // ✅ Random animation delay
      const delay = Math.random() * 10
      particleElement.style.animationDelay = `${delay}s`

      // ✅ Random blur for depth effect
      const blur = Math.random() * 1.5
      particleElement.style.filter = `blur(${blur}px)`
    })
  }

  return {
    initializeParticles,
  }
}
