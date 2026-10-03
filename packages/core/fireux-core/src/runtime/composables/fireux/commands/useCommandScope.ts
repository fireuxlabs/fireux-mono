import { onScopeDispose, watch, type WatchSource } from 'vue'

/** Capture page intent; authoritative validation remains in the domain command. */
export function useCommandScope(sources: WatchSource[]) {
  let epoch = 0
  let disposed = false
  watch(
    sources,
    () => {
      epoch += 1
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed = true
    epoch += 1
  })
  return () => {
    const captured = epoch
    return () => !disposed && epoch === captured
  }
}

/** A single async command also works outside component setup; caller releases its watchers. */
export function captureCommandScope(sources: WatchSource[]) {
  let current = true
  const stop = watch(
    sources,
    () => {
      current = false
    },
    { flush: 'sync' }
  )
  return { isCurrent: () => current, stop }
}
