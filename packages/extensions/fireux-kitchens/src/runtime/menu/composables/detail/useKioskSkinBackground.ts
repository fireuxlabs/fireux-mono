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
  MenuKioskSkinBackground,
  MenuKioskSkinBackgroundKey,
} from '../../models/kiosk-skin.model.ts'

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
    const backgrounds: Partial<
      Record<MenuKioskSkinBackgroundKey, MenuKioskSkinBackground>
    > = skin?.backgrounds ?? {}
    const currentKey = backgroundKey.value as MenuKioskSkinBackgroundKey
    const key: MenuKioskSkinBackgroundKey | undefined = backgroundFallbacks[
      currentKey
    ].find(
      (fallbackKey: MenuKioskSkinBackgroundKey) =>
        backgrounds[fallbackKey]?.imageUrl
    )

    return key
      ? backgrounds[key]?.imageUrl || ''
      : skin?.backgroundImageUrl || ''
  })

  return {
    backgroundImageUrl,
    backgroundKey,
  }
}
