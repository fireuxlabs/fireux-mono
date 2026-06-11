import { computed } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
  type ConsoleHeaderSelectorItem,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import type { KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'

type KitchenConsoleHeaderKitchen = Partial<
  Pick<
    KitchenSurface,
    | 'id'
    | 'display_name'
    | 'name'
    | 'slug'
    | 'display_image_url'
    | 'image_url'
    | 'tagline'
  >
>

type KitchenConsoleHeaderOptions = {
  selectedKitchen: { readonly value: KitchenConsoleHeaderKitchen | null }
  liveKitchens: { readonly value: KitchenConsoleHeaderKitchen[] }
  demoKitchens: { readonly value: KitchenConsoleHeaderKitchen[] }
  testKitchen: { readonly value: KitchenConsoleHeaderKitchen | null | undefined }
  selectKitchen: (kitchenId: string, mode?: ConsoleMode) => void
}

const kitchenName = (kitchen: KitchenConsoleHeaderKitchen | null | undefined) =>
  normalizeString(kitchen?.display_name) ||
  normalizeString(kitchen?.name) ||
  normalizeString(kitchen?.slug) ||
  'Kitchen'

const kitchenImage = (kitchen: KitchenConsoleHeaderKitchen | null | undefined) =>
  normalizeString(kitchen?.display_image_url) ||
  normalizeString(kitchen?.image_url) ||
  undefined

const modeIcon = (mode: ConsoleMode) =>
  mode === 'live'
    ? 'i-lucide-store'
    : mode === 'test'
      ? 'i-lucide-flask-conical'
      : 'i-lucide-sparkles'

export function useKitchenConsoleHeader({
  selectedKitchen,
  liveKitchens,
  demoKitchens,
  testKitchen,
  selectKitchen,
}: KitchenConsoleHeaderOptions) {
  const selectorItem = (
    kitchen: KitchenConsoleHeaderKitchen,
    mode: ConsoleMode
  ): ConsoleHeaderSelectorItem => {
    const id = normalizeString(kitchen.id)

    return {
      label: kitchenName(kitchen),
      icon: modeIcon(mode),
      disabled: !id,
      onSelect: () => {
        if (id) selectKitchen(id, mode)
      },
    }
  }

  const selectorItems = computed<ConsoleHeaderSelectorItem[][]>(() => {
    const groups: ConsoleHeaderSelectorItem[][] = []
    const live = liveKitchens.value.filter((kitchen) => normalizeString(kitchen.id))

    if (live.length) groups.push(live.map((kitchen) => selectorItem(kitchen, 'live')))

    if (testKitchen.value && normalizeString(testKitchen.value.id)) {
      groups.push([selectorItem(testKitchen.value, 'test')])
    }

    const demo = demoKitchens.value.filter((kitchen) => normalizeString(kitchen.id))
    if (demo.length) groups.push(demo.map((kitchen) => selectorItem(kitchen, 'demo')))

    return groups
  })

  const header = computed<ConsoleHeaderData>(() => {
    const kitchen = selectedKitchen.value
    if (!kitchen) return null

    return {
      title: kitchenName(kitchen),
      subtitle: normalizeString(kitchen.tagline) || undefined,
      imageUrl: kitchenImage(kitchen),
      selectorItems: selectorItems.value,
    }
  })

  usePublishConsoleHeader('kitchen', header)

  return {
    header,
    selectorItems,
  }
}
