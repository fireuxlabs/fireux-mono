const isClient = typeof globalThis !== 'undefined' && 'window' in globalThis

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min

type Cleanup = () => void

const applyFromDataset = (el: HTMLElement, reducedMotion: boolean) => {
  const riseSeconds = Number.parseFloat(el.dataset.bubbleRiseSeconds ?? '22')
  const pulseSeconds = Number.parseFloat(el.dataset.bubblePulseSeconds ?? '6')
  const delaySeconds = Number.parseFloat(el.dataset.bubbleDelaySeconds ?? '0')

  el.style.setProperty(
    '--bubble-rise',
    reducedMotion ? '0s' : `${riseSeconds.toFixed(2)}s`
  )
  el.style.setProperty(
    '--bubble-pulse',
    reducedMotion ? '0s' : `${pulseSeconds.toFixed(2)}s`
  )
  el.style.animationDelay = reducedMotion
    ? '0s, 0s'
    : `${delaySeconds.toFixed(2)}s, ${(delaySeconds * 0.5).toFixed(2)}s`
}

export const useBubbles = () => {
  const cleanups: Cleanup[] = []

  const cleanup = () => {
    while (cleanups.length) {
      const dispose = cleanups.pop()
      if (dispose) dispose()
    }
  }

  const initializeBubbles = (root: HTMLElement) => {
    cleanup()

    if (!isClient) return

    const bubbles = Array.from(root.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    )

    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    const initialReduced = mediaQuery.matches

    for (const el of bubbles) {
      const riseSeconds = randomInRange(18, 28)
      const pulseSeconds = randomInRange(5, 9)
      const size = randomInRange(16, 42)
      const drift = randomInRange(18, 54) * (Math.random() > 0.5 ? 1 : -1)
      const scaleBase = randomInRange(0.85, 1.3)
      const scalePeak = scaleBase * 1.08
      const opacity = randomInRange(0.28, 0.6)
      const offsetRatio = Math.random()
      const delaySeconds = -riseSeconds * offsetRatio
      const xOffset = randomInRange(-45, 45)

      el.dataset.bubbleRiseSeconds = riseSeconds.toFixed(2)
      el.dataset.bubblePulseSeconds = pulseSeconds.toFixed(2)
      el.dataset.bubbleDelaySeconds = delaySeconds.toFixed(2)

      el.style.setProperty('--x', `${xOffset.toFixed(2)}vw`)
      el.style.setProperty('--drift', `${drift.toFixed(2)}px`)
      el.style.setProperty('--bubble-scale-start', scaleBase.toFixed(2))
      el.style.setProperty('--bubble-scale-peak', scalePeak.toFixed(2))
      el.style.setProperty('--bubble-scale-end', scaleBase.toFixed(2))
      el.style.setProperty('--bubble-opacity', opacity.toFixed(2))

      el.style.width = `${size.toFixed(2)}px`
      el.style.height = `${size.toFixed(2)}px`

      applyFromDataset(el, initialReduced)
    }

    const handleChange = () => {
      const reduced = mediaQuery.matches
      for (const el of bubbles) {
        applyFromDataset(el, reduced)
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    cleanups.push(
      () => {
        mediaQuery.removeEventListener('change', handleChange)
      },
      () => {
        for (const el of bubbles) {
          el.removeAttribute('style')
          delete el.dataset.bubbleRiseSeconds
          delete el.dataset.bubblePulseSeconds
          delete el.dataset.bubbleDelaySeconds
        }
      }
    )
  }

  return { initializeBubbles, cleanup }
}
