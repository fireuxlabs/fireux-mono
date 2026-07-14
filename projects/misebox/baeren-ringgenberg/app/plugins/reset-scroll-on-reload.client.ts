import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  const [navigation] = window.performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[]

  if (navigation?.type !== 'reload') return

  const previousRestoration = window.history.scrollRestoration
  window.history.scrollRestoration = 'manual'
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  const finishReset = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    window.history.scrollRestoration = previousRestoration
  }

  if (document.readyState === 'complete') {
    window.requestAnimationFrame(finishReset)
  } else {
    window.addEventListener('load', finishReset, { once: true })
  }
})
