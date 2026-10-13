import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Keep teleported order dialogs inside the fullscreen document. */
export function useKitchenOrderBoardFullscreen() {
  const fullscreen = ref(false)
  const fullscreenPending = ref(false)
  let ownsBrowserFullscreen = false
  let disposed = false

  function syncFullscreen() {
    if (ownsBrowserFullscreen && !document.fullscreenElement) {
      ownsBrowserFullscreen = false
      fullscreen.value = false
    }
  }

  function escape(event: KeyboardEvent) {
    if (
      event.key === 'Escape' &&
      !event.defaultPrevented &&
      !ownsBrowserFullscreen
    )
      fullscreen.value = false
  }

  async function toggleFullscreen() {
    if (fullscreenPending.value || disposed) return
    fullscreenPending.value = true
    try {
      if (fullscreen.value) {
        fullscreen.value = false
        if (ownsBrowserFullscreen && document.fullscreenElement) {
          try {
            await document.exitFullscreen()
            ownsBrowserFullscreen = false
          } catch {
            fullscreen.value = true
          }
        }
        return
      }
      fullscreen.value = true
      if (document.fullscreenElement || !document.fullscreenEnabled) return
      try {
        await document.documentElement.requestFullscreen()
        if (disposed || !fullscreen.value) {
          await document.exitFullscreen().catch(() => {})
          return
        }
        ownsBrowserFullscreen = true
      } catch {
        // The board still fills the window when browser fullscreen is unavailable.
      }
    } finally {
      fullscreenPending.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', syncFullscreen)
    document.addEventListener('keydown', escape)
  })
  onBeforeUnmount(() => {
    disposed = true
    document.removeEventListener('fullscreenchange', syncFullscreen)
    document.removeEventListener('keydown', escape)
    if (ownsBrowserFullscreen && document.fullscreenElement)
      void document.exitFullscreen().catch(() => {})
  })

  return { fullscreen, fullscreenPending, toggleFullscreen }
}
