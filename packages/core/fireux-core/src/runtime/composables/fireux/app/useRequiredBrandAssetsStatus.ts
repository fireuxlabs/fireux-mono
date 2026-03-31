import { computed, onMounted, ref } from 'vue'

type RequiredBrandAsset = {
  key: string
  label: string
  path: string
}

const REQUIRED_BRAND_ASSETS: RequiredBrandAsset[] = [
  { key: 'logo', label: 'Logo', path: '/img/app/logo.png' },
  {
    key: 'wordmark-light',
    label: 'Wordmark (light)',
    path: '/img/app/wordmark-light.png',
  },
  {
    key: 'wordmark-dark',
    label: 'Wordmark (dark)',
    path: '/img/app/wordmark-dark.png',
  },
  { key: 'thumbnail', label: 'Thumbnail', path: '/img/app/thumbnail.png' },
  { key: 'cover', label: 'Cover', path: '/img/app/cover.png' },
  { key: 'favicon', label: 'Favicon', path: '/img/app/favicon.ico' },
  {
    key: 'pwa-192',
    label: 'PWA icon (192)',
    path: '/img/app/pwa/icon-192.png',
  },
  {
    key: 'pwa-512',
    label: 'PWA icon (512)',
    path: '/img/app/pwa/icon-512.png',
  },
]

export function useRequiredBrandAssetsStatus() {
  const pending = ref(import.meta.client)
  const missingPaths = ref<string[]>([])

  async function checkAsset(path: string) {
    try {
      const response = await fetch(path, {
        method: 'HEAD',
        cache: 'no-store',
      })
      return response.ok
    } catch {
      return false
    }
  }

  onMounted(async () => {
    if (!import.meta.client) {
      pending.value = false
      return
    }

    const results = await Promise.all(
      REQUIRED_BRAND_ASSETS.map(async (asset) => ({
        asset,
        ok: await checkAsset(asset.path),
      }))
    )

    missingPaths.value = results
      .filter((entry) => !entry.ok)
      .map((entry) => `${entry.asset.label}: ${entry.asset.path}`)
    pending.value = false
  })

  const hasMissingAssets = computed(() => missingPaths.value.length > 0)

  return {
    pending,
    hasMissingAssets,
    missingPaths,
  }
}
