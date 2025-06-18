import { ref, readonly } from 'vue'

// Define the app data type
interface AppData {
  url: string
  theme: {
    primary: string
    neutral: string
  }
  appId: string
  name: string
  icon: string
  projectName: string
  shortName: string
  domain: string
  logos: {
    default: string
    light: string
    dark: string
  }
  description: string
  status: string
  lastUpdated: string
}

export const useApps = () => {
  // Array of ecosystem app URLs (production endpoints)
  const appUrls = [
    'https://fireux.app', // FireUX
    'https://cleanbox.web.app', // Cleanbox
    'https://misebox.app', // Misebox
  ]

  // Reactive array to store app data
  const apps = ref<AppData[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Fetch app data from all URLs
  const fetchApps = async () => {
    loading.value = true
    error.value = null
    apps.value = []

    for (const url of appUrls) {
      try {
        const response = (await $fetch(`${url}/api/app/theme`)) as {
          success: boolean
          data: any
        }
        if (response.success) {
          apps.value.push({
            ...response.data,
            url: getAppUrl(response.data.appId),
          })
        }
      } catch (err) {
        console.warn(`Failed to fetch app data from ${url}:`, err)
      }
    }

    loading.value = false
  }

  // Helper to get the correct URL for each app
  const getAppUrl = (appId: string): string => {
    const urls: Record<string, string> = {
      'fireux-app': '/dashboard',
      'cleanbox-app': 'https://cleanbox.web.app',
      'misebox-app': 'https://misebox.app',
    }
    return urls[appId] || '#'
  }

  return {
    apps: readonly(apps),
    loading: readonly(loading),
    error: readonly(error),
    fetchApps,
    appUrls,
  }
}
