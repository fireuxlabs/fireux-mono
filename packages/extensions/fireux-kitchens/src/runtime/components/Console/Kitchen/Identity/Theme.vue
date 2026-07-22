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
// Concurrent edit — 2026-07-22 12:44 CEST — Canonical Kitchen theme write: retain lossless target-bound drafts while writes refresh authority.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
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
  source,
  canWrite,
  refreshTargets,
} = useKitchenConsoleIdentity()
const { menus } = useKitchenConsoleMenus()
const toast = useToastify()
const fireux = useFireUXConfig()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const kitchenAppId = computed(() => {
  const scope = kitchen.value?.app_scope
  return scope && typeof scope === 'object' && !Array.isArray(scope)
    ? normalizeString((scope as Record<string, unknown>).app_id)
    : ''
})
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
const themeWriteStyle = (style: Partial<PageStyle>): Partial<PageStyle> => ({
  ...compactMenuPageStyle(style),
  ...(style.primary_color ? { primary_color: style.primary_color } : {}),
  ...(style.secondary_color ? { secondary_color: style.secondary_color } : {}),
})
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
const locallySavedPageStyle = ref<Partial<PageStyle> | null>(null)
const storedPageStyle = computed(() => normalizePageStyle(
  locallySavedPageStyle.value || pageStyle.value
))
const draftPageStyle = ref<Partial<PageStyle>>(normalizePageStyle())
const saving = ref(false)
const saveState = ref('')
type ThemeSaveRequest = {
  key: string
  appId: string
  kitchenId: string
  style: Partial<PageStyle>
}
const activeThemeTarget = computed(() => {
  const appId = kitchenAppId.value
  const id = normalizeString(kitchenId.value)
  return appId && id
    ? { appId, kitchenId: id, key: `${appId}:${id}` }
    : null
})
const targetDrafts = new Map<string, Partial<PageStyle>>()
let queuedThemeSave: ThemeSaveRequest | null = null
const pendingThemeSaves = new Map<string, ThemeSaveRequest>()
let inFlightThemeSave: ThemeSaveRequest | null = null
let saveTimer: ReturnType<typeof setTimeout> | undefined
watch(
  [kitchenId, kitchenAppId],
  () => {
    flushQueuedThemeSave()
    locallySavedPageStyle.value = null
    saveState.value = ''
    const target = activeThemeTarget.value
    draftPageStyle.value = targetDrafts.get(target?.key || '') ||
      normalizePageStyle(pageStyle.value)
  }
)
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
    const activeKey = activeThemeTarget.value?.key || ''
    if (
      !targetDrafts.has(activeKey) ||
      pageStyleEquals(draftPageStyle.value, normalized)
    ) {
      draftPageStyle.value = normalized
    } else {
      draftPageStyle.value =
        targetDrafts.get(activeKey) ||
        draftPageStyle.value
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
  const target = activeThemeTarget.value
  if (!canWrite.value || !target) return

  const normalized = normalizePageStyle(style)
  const baseline = storedPageStyle.value
  if (
    pageStyleEquals(normalized, baseline) &&
    !targetDrafts.has(target.key) &&
    !hasOutstandingThemeSave(target.key)
  ) {
    targetDrafts.delete(target.key)
    saveState.value = 'Saved'
    return
  }
  const request: ThemeSaveRequest = {
    ...target,
    style: normalized,
  }
  targetDrafts.set(request.key, request.style)
  if (queuedThemeSave && queuedThemeSave.key !== request.key) {
    const previous = queuedThemeSave
    queuedThemeSave = null
    void flushThemeSave(previous)
  }
  queuedThemeSave = request

  if (saveTimer) clearTimeout(saveTimer)
  saveState.value = 'Pending changes'
  saveTimer = setTimeout(() => {
    flushQueuedThemeSave()
  }, 450)
}

function flushQueuedThemeSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = undefined
  const request = queuedThemeSave
  queuedThemeSave = null
  if (request) void flushThemeSave(request)
}

function isActiveThemeTarget(request: ThemeSaveRequest) {
  return activeThemeTarget.value?.key === request.key
}

function hasNewerThemeSave(request: ThemeSaveRequest) {
  return pendingThemeSaves.has(request.key) ||
    queuedThemeSave?.key === request.key
}

function hasOutstandingThemeSave(key: string) {
  return inFlightThemeSave?.key === key ||
    pendingThemeSaves.has(key) ||
    queuedThemeSave?.key === key
}

async function flushThemeSave(request: ThemeSaveRequest) {
  pendingThemeSaves.set(request.key, request)
  if (saving.value) return
  saving.value = true

  while (pendingThemeSaves.size) {
    const entry = pendingThemeSaves.entries().next().value
    if (!entry) break
    const [key, next] = entry
    pendingThemeSaves.delete(key)
    inFlightThemeSave = next

    if (isActiveThemeTarget(next)) saveState.value = 'Saving...'
    try {
      const user = await useRequireUser()
      const token = await user.getIdToken()
      const result = await $fetch<{
        ok: true
        app_id: string
        kitchen_id: string
      }>(
        '/api/console/kitchen/theme',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            kitchen_id: next.kitchenId,
            style: themeWriteStyle(next.style),
          },
        }
      )
      if (
        result?.ok !== true ||
        result.app_id !== next.appId ||
        result.kitchen_id !== next.kitchenId
      ) {
        throw new Error('Kitchen theme response was invalid.')
      }

      await refreshTargets()
      const hasNewer = hasNewerThemeSave(next)
      if (!hasNewer) {
        targetDrafts.delete(next.key)
      }
      if (isActiveThemeTarget(next)) {
        locallySavedPageStyle.value = next.style
        if (!hasNewer) saveState.value = 'Saved'
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.'
      if (isActiveThemeTarget(next) && !hasNewerThemeSave(next)) {
        saveState.value = 'Save failed'
      }
      toast.error(`Failed to update menu theme: ${message}`)
    } finally {
      if (inFlightThemeSave === next) inFlightThemeSave = null
    }
  }

  saving.value = false
}

onBeforeUnmount(() => {
  flushQueuedThemeSave()
})
</script>
