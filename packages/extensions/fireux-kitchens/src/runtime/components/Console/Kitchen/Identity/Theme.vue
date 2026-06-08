<template>
  <ClientOnly>
    <div v-if="selectedKitchen" class="space-y-6">
      <UCard variant="subtle">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-palette" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <h2 class="text-2xl font-semibold text-highlighted">
              Menu Display
            </h2>
            <p class="text-sm text-dimmed">
              Stored menu display values for this kitchen.
            </p>

            <div v-if="previewMenus.length" class="mt-3 flex flex-wrap items-center gap-2">
              <span class="text-xs font-medium text-dimmed">
                Preview menu
              </span>
              <UButton
                v-for="menu in previewMenus"
                :key="menu.id"
                size="xs"
                color="neutral"
                :variant="previewMenuId === menu.id ? 'solid' : 'soft'"
                @click="selectPreviewMenu(menu.id)"
              >
                {{ menu.name || menu.id }}
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ConsoleKitchenIdentityThemeEditor
          :style="draftPageStyle"
          :can-write="canWrite"
          :save-state="saveState"
          @update:style="setDraftPageStyle"
        />

        <ConsoleKitchenIdentityMenuPreview
          :kitchen-name="kitchenName"
          :menu="previewMenu"
          :sections="previewSections"
          :page-style="draftPageStyle"
          :place-currency-code="placeCurrencyCode"
          :menu-currency-format="menuCurrencyFormat"
          :menu-show-currency="menuShowCurrency"
          :public-menu-url="publicMenuUrl"
        />
      </div>
    </div>

    <MoleculesStateCard v-else entity="kitchen theme" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type { Dish } from '../../../../models/dish.model'
import { useDishCollection } from '../../../../composables/fireux/firestore/dish/fetch/useDishCollection'
import { useKitchenUpdate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import { useMenuCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import { useMenuSectionCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuSectionCollection'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'
import { useKitchenPublicMenuItems } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuItems'
import { useKitchenPublicMenuRows } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuRows'
import {
  resolveKitchenPublicMenuFont,
  resolveKitchenPublicMenuTitleFont,
} from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuTheme'

const {
  selectedKitchen,
  kitchenId,
  canWrite,
} = useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate()
const { publishedMenus } = useMenuCollection(kitchenId)
const toast = useToastify()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizePageStyle = (style?: Partial<PageStyle> | null): PageStyle => {
  const fontSource = normalizeString(style?.font_source) === 'google' ? 'google' : 'system'
  const titleFontSource =
    normalizeString(style?.title_font_source) === 'google' ? 'google' : 'system'
  const hasTitleFont = Boolean(
    normalizeString(style?.title_font_source) || normalizeString(style?.title_font_family)
  )
  const font = resolveKitchenPublicMenuFont({
    font_source: fontSource,
    font_family: normalizeString(style?.font_family),
  })
  const titleFont = hasTitleFont
    ? resolveKitchenPublicMenuTitleFont({
        title_font_source: titleFontSource,
        title_font_family: normalizeString(style?.title_font_family),
      })
    : font

  return {
    background_color_light: normalizeString(style?.background_color_light),
    background_color_dark: normalizeString(style?.background_color_dark),
    font_color_light: normalizeString(style?.font_color_light),
    font_color_dark: normalizeString(style?.font_color_dark),
    title_color_light: normalizeString(style?.title_color_light),
    title_color_dark: normalizeString(style?.title_color_dark),
    primary_color: '',
    secondary_color: '',
    title_font_source: titleFont.source,
    title_font_family: titleFont.family,
    font_source: font.source,
    font_family: font.family,
  }
}
const pageStyleEquals = (a: PageStyle, b: PageStyle) =>
  JSON.stringify(normalizePageStyle(a)) === JSON.stringify(normalizePageStyle(b))
const kitchenName = computed(() =>
  normalizeString(kitchen.value?.display_name || kitchen.value?.name) || 'Kitchen'
)
const kitchenSlug = computed(() => normalizeString(kitchen.value?.slug))
const selectedPreviewMenuId = ref('')
const previewMenus = computed(() => publishedMenus.value)
const fallbackPreviewMenu = computed(() =>
  previewMenus.value.find((menu) => normalizeString(menu.id) === 'main') ??
  previewMenus.value[0] ??
  null
)
const previewMenu = computed(() =>
  previewMenus.value.find((menu) => normalizeString(menu.id) === selectedPreviewMenuId.value) ??
  fallbackPreviewMenu.value
)
const previewMenuId = computed(() => normalizeString(previewMenu.value?.id))
const previewSectionState = useMenuSectionCollection(kitchenId, previewMenuId)
const previewItemState = useKitchenPublicMenuItems(
  previewSectionState.collectionPath,
  previewSectionState.sections
)
const previewDishState = useDishCollection(kitchenId)
const previewDishesById = computed(() => {
  const map = new Map<string, Dish>()
  for (const dish of previewDishState.dishes.value) {
    const id = normalizeString(dish.id)
    if (id) map.set(id, dish)
  }
  return map
})
const previewRows = useKitchenPublicMenuRows({
  sections: previewSectionState.sections,
  items: previewItemState.items,
  dishesById: previewDishesById,
  selectedLanguage: computed(() => ''),
  textFor: () => '',
})
const previewSections = computed(() => previewRows.sectionRows.value)
const publicMenuUrl = computed(() => {
  if (!kitchenSlug.value) return ''

  const menuId = previewMenuId.value
  const menuIndexUrl = `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus`

  return menuId ? `${menuIndexUrl}/${encodeURIComponent(menuId)}` : menuIndexUrl
})
const pageStyle = computed(() => (kitchen.value?.menu_style ?? {}) as Partial<PageStyle>)
const storedPageStyle = computed(() => normalizePageStyle(pageStyle.value))
const draftPageStyle = ref<PageStyle>(normalizePageStyle())
const saving = ref(false)
const saveState = ref('')
const pendingPersistStyle = ref<PageStyle | null>(null)
let saveTimer: ReturnType<typeof setTimeout> | undefined
const placeCurrencyCode = computed(() =>
  normalizeString(kitchen.value?.default_currency_code) || 'CHF'
)
const menuCurrencyFormat = computed(
  () =>
    (normalizeString(kitchen.value?.menu_currency_format) || 'dash') as CurrencyDisplayFormat
)
const menuShowCurrency = computed(() => kitchen.value?.menu_show_currency !== false)
watch(
  previewMenus,
  (menus) => {
    const ids = menus.map((menu) => normalizeString(menu.id)).filter(Boolean)
    if (selectedPreviewMenuId.value && ids.includes(selectedPreviewMenuId.value)) return

    selectedPreviewMenuId.value = normalizeString(fallbackPreviewMenu.value?.id)
  },
  {
    immediate: true,
  }
)

watch(
  storedPageStyle,
  (style) => {
    const normalized = normalizePageStyle(style)
    if (!saving.value || pageStyleEquals(draftPageStyle.value, normalized)) {
      draftPageStyle.value = normalized
    }
  },
  {
    immediate: true,
  }
)

function setDraftPageStyle(style: PageStyle) {
  const normalized = normalizePageStyle(style)
  draftPageStyle.value = normalized
  queueThemeSave(normalized)
}

function selectPreviewMenu(menuId: string) {
  selectedPreviewMenuId.value = normalizeString(menuId)
}

function queueThemeSave(style: PageStyle) {
  if (!canWrite.value) return

  if (saveTimer) clearTimeout(saveTimer)
  saveState.value = 'Pending changes'
  saveTimer = setTimeout(() => {
    void flushThemeSave(style)
  }, 450)
}

async function flushThemeSave(style: PageStyle) {
  pendingPersistStyle.value = normalizePageStyle(style)
  if (saving.value) return
  saving.value = true

  try {
    while (pendingPersistStyle.value) {
      const nextStyle = pendingPersistStyle.value
      const id = normalizeString(kitchenId.value)
      pendingPersistStyle.value = null

      if (!canWrite.value || !id) {
        saveState.value = ''
        return
      }

      if (pageStyleEquals(nextStyle, storedPageStyle.value)) {
        saveState.value = 'Saved'
        continue
      }

      saveState.value = 'Saving...'
      await updateKitchen(id, {
        menu_style: nextStyle,
      })
    }

    saveState.value = 'Saved'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    saveState.value = 'Save failed'
    toast.error(`Failed to update menu theme: ${message}`)
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer)
})
</script>
