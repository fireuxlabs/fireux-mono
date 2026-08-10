import { computed, onMounted, ref } from 'vue'
import { APP_PUBLIC_ASSET_REQUIREMENTS } from '../firestore/core/app/utils/appAssets'

type RequiredBrandAsset = {
  key: string
  label: string
  path: string
}

const REQUIRED_BRAND_ASSETS: RequiredBrandAsset[] =
  APP_PUBLIC_ASSET_REQUIREMENTS.map((asset) => ({
    key: asset.key,
    label: asset.label,
    path: asset.localPublicPath,
  }))

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
