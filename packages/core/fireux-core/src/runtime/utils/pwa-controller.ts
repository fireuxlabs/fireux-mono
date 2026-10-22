import { ref } from 'vue'

type InstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function createPwaController(options: {
  appId: string
  baseURL: string
  production: boolean
}) {
  const supported = ref(
    options.production && window.isSecureContext && 'serviceWorker' in navigator
  )
  const online = ref(navigator.onLine)
  const displayMode = window.matchMedia('(display-mode: standalone)')
  const isInstalledWindow = () =>
    displayMode.matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  const installed = ref(isInstalledWindow())
  const canInstall = ref(false)
  const offlineEnabled = ref(false)
  const offlineReady = ref(false)
  const busy = ref(false)
  const updateAvailable = ref(false)
  const error = ref('')
  const installHint = ref(
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      ? 'In Safari, open Share, then Add to Home Screen.'
      : /Safari/.test(navigator.userAgent) &&
          !/Chrome|Chromium|Edg/.test(navigator.userAgent)
        ? 'In Safari, choose File, then Add to Dock.'
        : 'Open your browser menu and choose Install app or Add to Home Screen. Availability depends on your browser.'
  )
  const scope = new URL(options.baseURL, window.location.origin).href
  const workerUrl = new URL('sw.js', scope).href
  const preferenceKey = `fireux:pwa:${options.appId}`
  const cachePrefix = `fireux-${options.appId}-`
  let registration: ServiceWorkerRegistration | undefined
  let prompt: InstallPromptEvent | undefined
  let reloadForUpdate = false
  let updateReloaded = false
  let disposed = false
  const cleanups: Array<() => void> = []
  const registrationCleanups: Array<() => void> = []

  function listen(
    target: EventTarget,
    type: string,
    listener: EventListener,
    lifetime = cleanups
  ) {
    target.addEventListener(type, listener)
    lifetime.push(() => target.removeEventListener(type, listener))
  }

  function owned(value: ServiceWorkerRegistration) {
    return (
      value.scope === scope &&
      [value.active, value.waiting, value.installing].some(
        (worker) => worker?.scriptURL === workerUrl
      )
    )
  }

  async function removeOwnedStorage() {
    const registrations = await navigator.serviceWorker.getRegistrations()
    const ownedRegistrations = registrations.filter(owned)
    await Promise.all(ownedRegistrations.map((value) => value.unregister()))
    if ('caches' in window) {
      const keys = await caches.keys()
      const legacy = `workbox-precache-v2-${scope}`
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith(cachePrefix) ||
              (ownedRegistrations.length > 0 && key === legacy)
          )
          .map((key) => caches.delete(key))
      )
    }
  }

  function observeRegistration(value: ServiceWorkerRegistration) {
    registrationCleanups.splice(0).forEach((cleanup) => cleanup())
    registration = value
    updateAvailable.value = Boolean(value.waiting)
    offlineReady.value = Boolean(value.active)
    const observeWorker = () => {
      const worker = value.installing
      if (!worker) return
      listen(
        worker,
        'statechange',
        () => {
          if (disposed || registration !== value || !offlineEnabled.value)
            return
          if (worker.state === 'installed') {
            if (value.active && navigator.serviceWorker.controller)
              updateAvailable.value = true
            else offlineReady.value = true
          }
          if (worker.state === 'activated') {
            offlineReady.value = true
            updateAvailable.value = Boolean(value.waiting)
          }
          if (worker.state === 'redundant' && !value.active) {
            offlineEnabled.value = false
            offlineReady.value = false
            error.value =
              'Offline support could not finish downloading. Reconnect and try again.'
            try {
              localStorage.removeItem(preferenceKey)
            } catch {
              /* blocked storage */
            }
          }
        },
        registrationCleanups
      )
    }
    observeWorker()
    listen(value, 'updatefound', observeWorker, registrationCleanups)
  }

  async function enableOffline() {
    if (!supported.value || busy.value) return
    busy.value = true
    error.value = ''
    try {
      // A failed preference write must not silently create persistent caches.
      localStorage.setItem(preferenceKey, '1')
      const value = await navigator.serviceWorker.register(workerUrl, {
        scope,
        updateViaCache: 'none',
      })
      if (disposed) return
      offlineEnabled.value = true
      observeRegistration(value)
    } catch {
      offlineEnabled.value = false
      offlineReady.value = false
      try {
        localStorage.removeItem(preferenceKey)
        await removeOwnedStorage()
      } catch {
        // Preserve the useful failure without replacing it with storage internals.
      }
      error.value =
        'Offline support could not be enabled. Check your connection and browser storage settings, then try again.'
    } finally {
      busy.value = false
    }
  }

  async function disableOffline() {
    if (!supported.value || busy.value) return
    busy.value = true
    error.value = ''
    try {
      localStorage.removeItem(preferenceKey)
      reloadForUpdate = false
      registration = undefined
      registrationCleanups.splice(0).forEach((cleanup) => cleanup())
      offlineEnabled.value = false
      offlineReady.value = false
      updateAvailable.value = false
      await removeOwnedStorage()
    } catch {
      error.value =
        'Offline support could not be fully removed. Try again or clear this site’s data in your browser.'
    } finally {
      busy.value = false
    }
  }

  async function install() {
    if (!prompt) return
    error.value = ''
    const requestedPrompt = prompt
    prompt = undefined
    canInstall.value = false
    try {
      // Keep prompt() directly in the click's user activation, before any await.
      await requestedPrompt.prompt()
    } catch {
      error.value =
        'The install prompt could not open. Use your browser menu to install the app.'
    }
  }

  async function checkForUpdate() {
    if (!registration || busy.value) return
    busy.value = true
    error.value = ''
    try {
      await registration.update()
      updateAvailable.value = Boolean(registration.waiting)
    } catch {
      error.value = 'Updates could not be checked. Reconnect and try again.'
    } finally {
      busy.value = false
    }
  }

  function reloadAfterUpdate() {
    if (!reloadForUpdate || updateReloaded || disposed) return
    updateReloaded = true
    window.location.reload()
  }

  function applyUpdate() {
    const value = registration
    const waiting = value?.waiting
    if (!value || !waiting) return
    reloadForUpdate = true
    // A resumed waiting worker is no longer value.installing. Observe it here
    // too: some browser surfaces activate it without changing this controller.
    listen(
      waiting,
      'statechange',
      () => {
        if (registration !== value || !offlineEnabled.value) return
        if (waiting.state === 'activated') reloadAfterUpdate()
      },
      registrationCleanups
    )
    waiting.postMessage({ type: 'SKIP_WAITING' })
    if (waiting.state === 'activated') reloadAfterUpdate()
  }

  function dismissUpdate() {
    updateAvailable.value = false
  }

  async function start() {
    listen(window, 'online', () => {
      online.value = true
    })
    listen(window, 'offline', () => {
      online.value = false
    })
    listen(displayMode, 'change', () => {
      installed.value = isInstalledWindow()
    })
    listen(window, 'beforeinstallprompt', (event) => {
      event.preventDefault()
      prompt = event as InstallPromptEvent
      canInstall.value = true
    })
    listen(window, 'appinstalled', () => {
      prompt = undefined
      canInstall.value = false
      installed.value = isInstalledWindow()
    })
    if (!supported.value) return
    listen(navigator.serviceWorker, 'controllerchange', reloadAfterUpdate)
    let previouslyEnabled = false
    try {
      previouslyEnabled = localStorage.getItem(preferenceKey) === '1'
    } catch {
      /* A blocked preference is not confirmed opt-in. */
    }
    if (previouslyEnabled) await enableOffline()
    else {
      busy.value = true
      try {
        await removeOwnedStorage()
      } catch {
        /* An ordinary visit still works when browser storage is blocked. */
      } finally {
        busy.value = false
      }
    }
  }

  function dispose() {
    disposed = true
    cleanups.forEach((cleanup) => cleanup())
    registrationCleanups.forEach((cleanup) => cleanup())
    prompt = undefined
  }

  return {
    supported,
    online,
    installed,
    canInstall,
    offlineEnabled,
    offlineReady,
    busy,
    updateAvailable,
    error,
    installHint,
    enableOffline,
    disableOffline,
    install,
    checkForUpdate,
    applyUpdate,
    dismissUpdate,
    start,
    dispose,
  }
}

export type PwaController = ReturnType<typeof createPwaController>
