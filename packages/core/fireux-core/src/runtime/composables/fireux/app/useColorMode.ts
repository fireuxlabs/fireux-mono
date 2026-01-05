import { useState, watch } from '#imports'

export type FireUXColorMode = 'system' | 'light' | 'dark'
export type FireUXResolvedColorMode = 'light' | 'dark'

let clientSetupDone = false
let resolvedObserverSetupDone = false

function readStoredMode(): FireUXColorMode | null {
  try {
    const raw = localStorage.getItem('fireux:color-mode')
    if (raw === 'system' || raw === 'light' || raw === 'dark') return raw
    return null
  } catch {
    return null
  }
}

function writeStoredMode(mode: FireUXColorMode) {
  try {
    localStorage.setItem('fireux:color-mode', mode)
  } catch {
    // ignore
  }
}

function resolveMode(mode: FireUXColorMode): FireUXResolvedColorMode {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyMode(mode: FireUXColorMode, resolvedState?: { value: FireUXResolvedColorMode }) {
  if (typeof document === 'undefined') return

  const resolved = resolveMode(mode)
  if (resolvedState) resolvedState.value = resolved
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function useResolvedColorMode() {
  const resolved = useState<FireUXResolvedColorMode>(
    'fireux-core:resolved-color-mode',
    () => 'light'
  )

  // Keep resolved mode in sync with whatever is actually applied to the DOM.
  // This is important because some UIs (Nuxt UI, browser extensions, etc.)
  // may toggle the `dark` class without touching our `useColorMode()` state.
  if (import.meta.client && !resolvedObserverSetupDone) {
    resolvedObserverSetupDone = true

    const syncFromDom = () => {
      resolved.value = document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
    }

    // Seed from current DOM state.
    syncFromDom()

    // Observe class changes on <html> to reflect theme toggles.
    try {
      const observer = new MutationObserver(() => syncFromDom())
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
    } catch {
      // ignore (very old browsers)
    }
  }

  return resolved
}

/**
 * Minimal `useColorMode()` implementation for this repo.
 *
 * Nuxt UI components and FireUX runtime code expect a `Ref`-like return
 * where `.value` is one of: 'system' | 'light' | 'dark'.
 */
export function useColorMode() {
  const mode = useState<FireUXColorMode>('fireux-core:color-mode', () => 'system')
  const resolved = useResolvedColorMode()

  if (import.meta.client && !clientSetupDone) {
    clientSetupDone = true

    const stored = readStoredMode()
    if (stored) mode.value = stored

    // Ensure the current mode is applied immediately.
    applyMode(mode.value, resolved)

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMedia = () => {
      if (mode.value === 'system') applyMode(mode.value, resolved)
    }

    // keep in sync when OS theme changes
    media.addEventListener?.('change', handleMedia)

    watch(
      mode,
      (next: FireUXColorMode) => {
        writeStoredMode(next)
        applyMode(next, resolved)
      },
      { immediate: true }
    )
  }

  return mode
}
