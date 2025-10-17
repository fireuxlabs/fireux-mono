const isClient = typeof globalThis !== 'undefined' && 'window' in globalThis

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min

type Cleanup = () => void

type SteamDataset = HTMLElement['dataset'] & {
  steamRiseSeconds?: string
  steamFadeSeconds?: string
  steamDelaySeconds?: string
}

const applyFromDataset = (el: HTMLElement, reducedMotion: boolean) => {
  const dataset = el.dataset as SteamDataset
  const riseSeconds = Number.parseFloat(dataset.steamRiseSeconds ?? '24')
  const fadeSeconds = Number.parseFloat(dataset.steamFadeSeconds ?? '8')
  const delaySeconds = Number.parseFloat(dataset.steamDelaySeconds ?? '0')

  el.style.setProperty(
    '--steam-rise',
    reducedMotion ? '0s' : `${riseSeconds.toFixed(2)}s`
  )
  el.style.setProperty(
    '--steam-fade',
    reducedMotion ? '0s' : `${fadeSeconds.toFixed(2)}s`
  )
  el.style.animationDelay = reducedMotion
    ? '0s, 0s'
    : `${delaySeconds.toFixed(2)}s, ${(delaySeconds * 0.35).toFixed(2)}s`
}

export const useSteam = () => {
  const cleanups: Cleanup[] = []

  const cleanup = () => {
    while (cleanups.length) {
      const dispose = cleanups.pop()
      if (dispose) dispose()
    }
  }

  const initializeSteam = (root: HTMLElement) => {
    cleanup()

    if (!isClient) return

    const puffs = Array.from(root.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    )

    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    const initialReduced = mediaQuery.matches

    for (const el of puffs) {
      const riseSeconds = randomInRange(22, 32)
      const fadeSeconds = randomInRange(6, 11)
      const size = randomInRange(48, 96)
      const drift = randomInRange(12, 42) * (Math.random() > 0.5 ? 1 : -1)
      const scaleBase = randomInRange(0.95, 1.35)
      const scalePeak = scaleBase * 1.22
      const scaleEnd = scaleBase * 1.08
      const opacity = randomInRange(0.26, 0.55)
      const blur = randomInRange(2.5, 5.5)
      const xOffset = randomInRange(-26, 26)
      const offsetRatio = Math.random()
      const delaySeconds = -riseSeconds * offsetRatio

      const dataset = el.dataset as SteamDataset
      dataset.steamRiseSeconds = riseSeconds.toFixed(2)
      dataset.steamFadeSeconds = fadeSeconds.toFixed(2)
      dataset.steamDelaySeconds = delaySeconds.toFixed(2)

      el.style.setProperty('--x', `${xOffset.toFixed(2)}vw`)
      el.style.setProperty('--drift', `${drift.toFixed(2)}px`)
      el.style.setProperty('--steam-scale-start', scaleBase.toFixed(2))
      el.style.setProperty('--steam-scale-peak', scalePeak.toFixed(2))
      el.style.setProperty('--steam-scale-end', scaleEnd.toFixed(2))
      el.style.setProperty('--steam-opacity', opacity.toFixed(2))
      el.style.setProperty('--steam-blur', `${blur.toFixed(2)}px`)

      el.style.width = `${size.toFixed(2)}px`
      el.style.height = `${size.toFixed(2)}px`

      applyFromDataset(el, initialReduced)
    }

    const handleChange = () => {
      const reduced = mediaQuery.matches
      for (const el of puffs) {
        applyFromDataset(el, reduced)
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    cleanups.push(
      () => {
        mediaQuery.removeEventListener('change', handleChange)
      },
      () => {
        for (const el of puffs) {
          el.removeAttribute('style')
          const dataset = el.dataset as SteamDataset
          delete dataset.steamRiseSeconds
          delete dataset.steamFadeSeconds
          delete dataset.steamDelaySeconds
        }
      }
    )
  }

  return { initializeSteam, cleanup }
}
