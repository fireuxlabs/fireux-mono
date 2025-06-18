/**
 * PWA utilities composable for FireUX apps
 * Provides PWA functionality and service worker management
 */
export function usePWA() {
  const { $pwa } = useNuxtApp()
  
  // Check if PWA is available
  const isAvailable = computed(() => {
    return 'serviceWorker' in navigator && $pwa
  })
  
  // Check if app is installed
  const isInstalled = computed(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches
  })
  
  // Install prompt event
  const installPrompt = ref<any>(null)
  const canInstall = computed(() => !!installPrompt.value)
  
  // Listen for install prompt
  onMounted(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      installPrompt.value = e
    })
    
    window.addEventListener('appinstalled', () => {
      installPrompt.value = null
    })
  })
  
  // Trigger installation
  const install = async () => {
    if (!installPrompt.value) return false
    
    const result = await installPrompt.value.prompt()
    installPrompt.value = null
    
    return result.outcome === 'accepted'
  }
  
  // Update service worker
  const updateSW = async () => {
    if (!$pwa?.updateSW) return false
    
    try {
      await $pwa.updateSW()
      return true
    } catch (error) {
      console.error('Failed to update service worker:', error)
      return false
    }
  }
  
  // Get app info
  const appInfo = computed(() => {
    const config = useRuntimeConfig()
    return {
      name: config.public.pwa?.appName || 'FireUX App',
      shortName: config.public.pwa?.appShortName || 'FireUX',
      themeColor: config.public.pwa?.themeColor || '#1f2937',
      backgroundColor: config.public.pwa?.backgroundColor || '#ffffff'
    }
  })
  
  return {
    // State
    isAvailable,
    isInstalled,
    canInstall,
    appInfo,
    
    // Actions
    install,
    updateSW
  }
}
