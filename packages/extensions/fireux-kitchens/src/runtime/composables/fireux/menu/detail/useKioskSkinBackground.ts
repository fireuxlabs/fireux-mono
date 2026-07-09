import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  MenuKioskSkin,
  MenuKioskSkinBackgroundKey,
} from '../../../../models/kitchen/menu/kiosk-skin.model'

type UseKioskSkinBackgroundOptions = {
  skin: MaybeRefOrGetter<MenuKioskSkin | undefined>
}

const backgroundKeyForViewport = (): MenuKioskSkinBackgroundKey => {
  if (!import.meta.client) return 'portraitLarge'

  if (window.innerWidth <= 560) return 'portraitPhone'
  if (window.innerWidth <= 900) return 'portraitCompact'

  return 'portraitLarge'
}

const backgroundFallbacks: Record<
  MenuKioskSkinBackgroundKey,
  MenuKioskSkinBackgroundKey[]
> = {
  portraitLarge: ['portraitLarge', 'portraitCompact', 'portraitPhone'],
  portraitCompact: ['portraitCompact', 'portraitLarge', 'portraitPhone'],
  portraitPhone: ['portraitPhone', 'portraitCompact', 'portraitLarge'],
}

export function useKioskSkinBackground(options: UseKioskSkinBackgroundOptions) {
  const backgroundKey = ref<MenuKioskSkinBackgroundKey>('portraitLarge')
  const updateBackgroundKey = () => {
    backgroundKey.value = backgroundKeyForViewport()
  }

  onMounted(() => {
    updateBackgroundKey()
    window.addEventListener('resize', updateBackgroundKey, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateBackgroundKey)
  })

  const backgroundImageUrl = computed(() => {
    const skin = toValue(options.skin)
    const backgrounds = skin?.backgrounds ?? {}
    const key = backgroundFallbacks[backgroundKey.value]
      .find((fallbackKey) => backgrounds[fallbackKey]?.imageUrl)

    return key
      ? backgrounds[key]?.imageUrl || ''
      : skin?.backgroundImageUrl || ''
  })

  return {
    backgroundImageUrl,
    backgroundKey,
  }
}
