type GoogleMapsWindow = Window & {
  google?: any
  __fireuxGoogleMapsPromise?: Promise<void>
}

export function readGoogleMaps() {
  return (window as GoogleMapsWindow).google
}

export function loadFireuxGoogleMaps(apiKey: string) {
  const target = window as GoogleMapsWindow

  if (target.google?.maps?.importLibrary) {
    return Promise.resolve()
  }

  if (target.__fireuxGoogleMapsPromise) {
    return target.__fireuxGoogleMapsPromise
  }

  target.__fireuxGoogleMapsPromise = new Promise<void>((resolve, reject) => {
    const callbackName = `__fireuxGoogleMapsReady_${Date.now()}`
    ;(target as unknown as Record<string, unknown>)[callbackName] = () => {
      delete (target as unknown as Record<string, unknown>)[callbackName]
      resolve()
    }

    const script = document.createElement('script')
    const url = new URL('https://maps.googleapis.com/maps/api/js')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('v', 'weekly')
    url.searchParams.set('loading', 'async')
    url.searchParams.set('callback', callbackName)
    script.src = url.toString()
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Google Maps script failed to load.'))
    document.head.appendChild(script)
  })

  return target.__fireuxGoogleMapsPromise
}
