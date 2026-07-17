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
              Portable food-menu styling for this kitchen. Tenant app chrome stays app-owned.
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
          :menu-url="menuUrl"
        />
      </div>
    </div>

    <MoleculesStateCard v-else entity="kitchen theme" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchenUpdate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/identity/useKitchenConsoleIdentity'
import { useKitchenConsoleMenus } from '../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { useMenu } from '../../../../composables/fireux/menu/useMenu'
import {
  compactMenuPageStyle,
  resolveMenuPageStyle,
  resolveMenuFont,
  resolveMenuTitleFont,
} from '../../../../composables/fireux/menu/useMenuTheme'
import type { Menu } from '../../../../models/kitchen/menu/menu.model'
import {
  readKitchenIdentity,
  readKitchenMenuStyle,
} from '../../../../utils/kitchen-spine'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  menuRoutePath,
  tenantMenuRouteScope,
} from '../../../../utils/kitchen-menu-route'

const {
  selectedKitchen,
  kitchenId,
  rootCollection,
  source,
  canWrite,
} = useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate({ collectionPath: rootCollection })
const { menus } = useKitchenConsoleMenus()
const toast = useToastify()
const fireux = useFireUXConfig()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const normalizeString = (value: unknown) => String(value ?? '').trim()
// Console theme spine: docs/concepts/console.md. This edits portable menu tokens, not tenant app chrome.
const normalizePageStyle = (style?: Partial<PageStyle> | null): Partial<PageStyle> => {
  const resolved = resolveMenuPageStyle(style)
  const fontSource = normalizeString(style?.font_source) === 'google' ? 'google' : 'system'
  const titleFontSource =
    normalizeString(style?.title_font_source) === 'google' ? 'google' : 'system'
  const hasTitleFont = Boolean(
    normalizeString(style?.title_font_source) || normalizeString(style?.title_font_family)
  )
  const font = resolveMenuFont({
    font_source: fontSource,
    font_family: normalizeString(style?.font_family),
  })
  const titleFont = hasTitleFont
    ? resolveMenuTitleFont({
        title_font_source: titleFontSource,
        title_font_family: normalizeString(style?.title_font_family),
      })
    : font

  return {
    ...resolved,
    title_font_source: titleFont.source,
    title_font_family: titleFont.family,
    font_source: font.source,
    font_family: font.family,
  }
}
const pageStyleEquals = (a: Partial<PageStyle>, b: Partial<PageStyle>) =>
  JSON.stringify(normalizePageStyle(a)) === JSON.stringify(normalizePageStyle(b))
const kitchenName = computed(() =>
  readKitchenIdentity(kitchen.value).displayName || 'Kitchen'
)
const kitchenSlug = computed(() => normalizeString(kitchen.value?.slug))
const selectedPreviewMenuId = ref('')
const previewMenus = computed(() =>
  menus.value.filter((menu) => menu.status === 'published')
)
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
const livePreviewMenuId = computed(() =>
  source.value === 'live' ? previewMenuId.value : ''
)
const previewMenuRouteScope = computed(() =>
  fireux.isTenant
    ? tenantMenuRouteScope()
    : directoryMenuRouteScope(kitchenSlug.value)
)
const previewMenuDetail = useMenu(livePreviewMenuId, {
  routeScope: previewMenuRouteScope,
})
const previewSections = computed(() => {
  // Console preview dogfoods the menu manifest, then crops to the first useful section/item.
  const sections = previewMenuDetail.manifest.value?.content.sections ?? []
  const firstSection =
    sections.find((section) => section.items.length > 0) ??
    sections[0]

  if (!firstSection) return []

  return [
    {
      ...firstSection,
      items: firstSection.items.slice(0, 1),
    },
  ]
})
const menuUrl = computed(() => {
  if (source.value !== 'live' || !kitchenSlug.value) return ''

  const menuId = previewMenuId.value
  const routeScope = directoryMenuRouteScope(kitchenSlug.value)

  return menuId
    ? menuRoutePath({ scope: routeScope, menuId })
    : menuRouteIndexPath(routeScope)
})
const pageStyle = computed(() => readKitchenMenuStyle(kitchen.value) ?? {})
const storedPageStyle = computed(() => normalizePageStyle(pageStyle.value))
const draftPageStyle = ref<Partial<PageStyle>>(normalizePageStyle())
const saving = ref(false)
const saveState = ref('')
const pendingPersistStyle = ref<Partial<PageStyle> | null>(null)
let saveTimer: ReturnType<typeof setTimeout> | undefined
watch(
  previewMenus,
  (menus: Menu[]) => {
    const ids = menus.map((menu: Menu) => normalizeString(menu.id)).filter(Boolean)
    if (selectedPreviewMenuId.value && ids.includes(selectedPreviewMenuId.value)) return

    selectedPreviewMenuId.value = normalizeString(fallbackPreviewMenu.value?.id)
  },
  {
    immediate: true,
  }
)

watch(
  storedPageStyle,
  (style: Partial<PageStyle>) => {
    const normalized = normalizePageStyle(style)
    if (!saving.value || pageStyleEquals(draftPageStyle.value, normalized)) {
      draftPageStyle.value = normalized
    }
  },
  {
    immediate: true,
  }
)

function setDraftPageStyle(style: Partial<PageStyle>) {
  const normalized = normalizePageStyle(style)
  draftPageStyle.value = normalized
  queueThemeSave(normalized)
}

function selectPreviewMenu(menuId: string) {
  selectedPreviewMenuId.value = normalizeString(menuId)
}

function queueThemeSave(style: Partial<PageStyle>) {
  if (!canWrite.value) return

  if (saveTimer) clearTimeout(saveTimer)
  saveState.value = 'Pending changes'
  saveTimer = setTimeout(() => {
    void flushThemeSave(style)
  }, 450)
}

async function flushThemeSave(style: Partial<PageStyle>) {
  pendingPersistStyle.value = normalizePageStyle(style)
  if (saving.value) return
  saving.value = true

  try {
    while (pendingPersistStyle.value) {
      const nextStyle = pendingPersistStyle.value
      const compactStyle = compactMenuPageStyle(nextStyle)
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
        'menus.style': compactStyle,
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
