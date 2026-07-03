import { onMounted, onUnmounted, readonly, ref } from 'vue'

export function useKitchenServiceNow(intervalMs = 30_000) {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | undefined

  const refresh = () => {
    now.value = new Date()
  }

  onMounted(() => {
    refresh()
    timer = setInterval(refresh, intervalMs)
  })

  onUnmounted(() => {
    if (!timer) return

    clearInterval(timer)
  })

  return {
    now: readonly(now),
  }
}
