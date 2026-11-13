import { onMounted, onBeforeUnmount, ref, type Ref } from 'vue'

/** App-owned scroll scrub: native paused video, one decoder seek at a time. */
export function useMountainMotion(
  root: Ref<HTMLElement | null>,
  media: Ref<HTMLVideoElement | null>
) {
  const videoActive = ref(false)
  let dispose: (() => void) | undefined
  onMounted(() => {
    const element = root.value
    const video = media.value
    const stage = element?.querySelector<HTMLElement>('[data-mountain-stage]')
    if (!element || !video || !stage) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let renderedProgress = 0
    let previousTime = 0
    let decoded = video.readyState >= 2
    const clear = () => {
      videoActive.value = false
      for (const name of [
        '--scene-travel',
        '--scene-progress',
        '--scene-feather',
        '--scene-intro-opacity',
        '--scene-outro-opacity',
      ])
        element.style.removeProperty(name)
    }
    const seek = () => {
      if (
        preference.matches ||
        video.seeking ||
        video.readyState < 1 ||
        !Number.isFinite(video.duration)
      )
        return
      // Delivery is 60 fps with frequent independent keyframes. Quantize requests
      // and wait for seeked instead of repeatedly cancelling the decoder's work.
      const end = Math.max(0, video.duration - 1 / 60)
      const target = Math.min(end, Math.round(renderedProgress * end * 60) / 60)
      if (Math.abs(video.currentTime - target) >= 1 / 120)
        video.currentTime = target
    }
    const update = (time: number) => {
      frame = 0
      if (preference.matches) return
      const bounds = element.getBoundingClientRect()
      if (bounds.bottom < 0 || bounds.top > innerHeight) return
      const distance = Math.max(1, bounds.height - stage.offsetHeight)
      const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0
      const target = Math.min(1, Math.max(0, (stickyTop - bounds.top) / distance))
      const elapsed = previousTime ? Math.min(64, time - previousTime) : 16
      previousTime = time
      renderedProgress +=
        (target - renderedProgress) * (1 - Math.exp(-elapsed / 75))
      if (Math.abs(target - renderedProgress) < 0.0002)
        renderedProgress = target
      const progress = renderedProgress
      videoActive.value = decoded && progress > 0.006
      element.style.setProperty(
        '--scene-feather',
        `${Math.max(0, (progress - 0.8) / 0.2) * stage.offsetHeight * 0.28}px`
      )
      element.style.setProperty(
        '--scene-travel',
        `${progress * stage.offsetHeight}px`
      )
      element.style.setProperty('--scene-progress', String(progress))
      element.style.setProperty(
        '--scene-intro-opacity',
        String(
          Math.min(
            1,
            Math.max(0, (progress - 0.1) * 6),
            Math.max(0, (0.65 - progress) * 5)
          )
        )
      )
      element.style.setProperty(
        '--scene-outro-opacity',
        String(Math.min(1, Math.max(0, (progress - 0.65) * 5), Math.max(0, (1 - progress) / 0.12)))
      )
      seek()
      if (renderedProgress !== target) frame = requestAnimationFrame(update)
      else previousTime = 0
    }
    const schedule = () => {
      if (!preference.matches && !frame) frame = requestAnimationFrame(update)
    }
    const ready = () => {
      decoded = video.readyState >= 2
      schedule()
    }
    const failed = () => {
      decoded = false
      videoActive.value = false
    }
    const reset = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      renderedProgress = 0
      video.pause()
      clear()
      schedule()
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    preference.addEventListener('change', reset)
    video.addEventListener('loadedmetadata', schedule)
    video.addEventListener('loadeddata', ready)
    video.addEventListener('seeked', ready)
    video.addEventListener('error', failed)
    video.pause()
    schedule()
    dispose = () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      preference.removeEventListener('change', reset)
      video.removeEventListener('loadedmetadata', schedule)
      video.removeEventListener('loadeddata', ready)
      video.removeEventListener('seeked', ready)
      video.removeEventListener('error', failed)
      video.pause()
      clear()
    }
  })
  onBeforeUnmount(() => dispose?.())
  return { videoActive }
}
