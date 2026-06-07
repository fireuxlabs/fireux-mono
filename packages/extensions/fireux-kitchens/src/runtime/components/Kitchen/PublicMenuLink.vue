<template>
  <NuxtLink
    :to="to"
    class="rounded-lg border border-default p-4 transition hover:bg-elevated/50"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-highlighted">
          {{ menuName }}
        </h2>
        <p
          v-if="menuDescription"
          class="mt-1 text-sm text-dimmed"
        >
          {{ menuDescription }}
        </p>
        <p v-else class="mt-1 text-sm text-dimmed">
          {{ summary }}
        </p>
      </div>
      <UIcon
        name="i-lucide-arrow-up-right"
        class="mt-1 size-4 shrink-0 text-muted"
      />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  resolveSproochliTranslatedText,
  type SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli'
import { useKitchenPublicMenuLanguagePrepare } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuLanguagePrepare'
import { useKitchenPublicMenuTranslations } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuTranslations'
import type { Dish } from '../../models/dish.model'
import type { Kitchen } from '../../models/kitchen.model'
import type { Menu, MenuItem, MenuSection } from '../../models/menu.model'

const props = defineProps<{
  kitchen: Kitchen
  menu: Menu
  menuCollectionPath: string
  selectedLanguage: SproochliLanguageCode
  summary: string
  to: string
}>()

const text = (value: unknown) => String(value ?? '').trim()
const kitchenRef = computed(() => props.kitchen)
const kitchenSlug = computed(() => text(props.kitchen?.slug))
const menuRef = computed(() => props.menu)
const menuId = computed(() => text(props.menu?.id))
const selectedLanguage = computed(() => props.selectedLanguage)
const translationCache = useKitchenPublicMenuTranslations(
  computed(() => props.menuCollectionPath),
  menuId,
  selectedLanguage
)
const emptySections = computed<MenuSection[]>(() => [])
const emptyItems = computed<MenuItem[]>(() => [])
const emptyDishesById = computed<Map<string, Dish>>(() => new Map())

useKitchenPublicMenuLanguagePrepare({
  kitchen: kitchenRef,
  kitchenSlug,
  menu: menuRef,
  menuId,
  selectedLanguage,
  pending: translationCache.pending,
  sections: emptySections,
  items: emptyItems,
  dishesById: emptyDishesById,
  cacheRows: translationCache.rows,
})

const menuNameFieldId = computed(() => `menu:${menuId.value}:name`)
const menuDescriptionFieldId = computed(() => `menu:${menuId.value}:description`)
const menuName = computed(() =>
  resolveSproochliTranslatedText({
    defaultText: props.menu.name,
    translations: (props.menu as any)?.names ?? (props.menu as any)?.translations,
    selectedLanguage: selectedLanguage.value,
    cacheText: translationCache.text(menuNameFieldId.value),
  }).text || text(props.menu.name)
)
const menuDescription = computed(() =>
  resolveSproochliTranslatedText({
    defaultText: props.menu.description,
    translations: (props.menu as any)?.descriptions,
    selectedLanguage: selectedLanguage.value,
    cacheText: translationCache.text(menuDescriptionFieldId.value),
  }).text || text(props.menu.description)
)
</script>
