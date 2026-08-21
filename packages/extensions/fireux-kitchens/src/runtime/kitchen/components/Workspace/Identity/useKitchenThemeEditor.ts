// Concurrent edit — 2026-07-22 12:44 CEST — Canonical Kitchen theme write: retain lossless target-bound drafts while writes refresh authority.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readFireuxEntityManagement, resolveFireuxEntityManagementAppId } from 'fireux-core/runtime/utils/entity-management'
import { useKitchenWorkspaceIdentity } from '../../../composables/workspace/identity/useKitchenWorkspaceIdentity'
import { useKitchenWorkspaceMenus } from '../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenus'
import { useMenu } from '../../../../menu/composables/useMenu'
import type { Menu } from '../../../../menu/models/menu.model.ts'
import { readKitchenMenuStyle } from '../../../utils/kitchen-spine'
import { readKitchenPresentationIdentity } from '../../../utils/kitchen-presentation'
import { normalizePageStyle, normalizeString, pageStyleEquals, themeWriteStyle, type ThemeSaveRequest } from './kitchen-theme-style'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  menuRoutePath,
  tenantMenuRouteScope,
} from '../../../utils/kitchen-menu-route'

export function useKitchenThemeEditor() {
  const { selectedKitchen, kitchenId, dataType, canWrite, refreshTargets } =
    useKitchenWorkspaceIdentity()

  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')

  const { menus } = useKitchenWorkspaceMenus()

  const toast = useToastify()

  const fireux = useFireUXConfig()

  const kitchen = computed(
    () => selectedKitchen.value as Record<string, unknown> | null
  )

  const kitchenAppId = computed(() => {
    const management = readFireuxEntityManagement(kitchen.value?.management)
    return management
      ? resolveFireuxEntityManagementAppId(management, fireux.ecosystem)
      : ''
  })

  const kitchenName = computed(
    () => readKitchenPresentationIdentity(kitchen.value).displayName || 'Kitchen'
  )

  const kitchenSlug = computed(() => normalizeString(kitchen.value?.slug))

  const selectedPreviewMenuId = ref('')

  const previewMenus = computed(() =>
    menus.value.filter((menu) => menu.status === 'published')
  )

  const fallbackPreviewMenu = computed(
    () =>
      previewMenus.value.find((menu) => normalizeString(menu.id) === 'main') ??
      previewMenus.value[0] ??
      null
  )

  const previewMenu = computed(
    () =>
      previewMenus.value.find(
        (menu) => normalizeString(menu.id) === selectedPreviewMenuId.value
      ) ?? fallbackPreviewMenu.value
  )

  const previewMenuId = computed(() => normalizeString(previewMenu.value?.id))

  const isLiveData = computed(() => dataType.value === 'live')

  const canWriteTheme = computed(() => canWrite.value && isLiveData.value)

  const livePreviewMenuId = computed(() =>
    isLiveData.value ? previewMenuId.value : ''
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
    // Workspace preview dogfoods the menu manifest, then crops to the first useful section/item.
    const sections = previewMenuDetail.manifest.value?.content.sections ?? []
    const firstSection =
      sections.find((section) => section.items.length > 0) ?? sections[0]

    if (!firstSection) return []

    return [
      {
        ...firstSection,
        items: firstSection.items.slice(0, 1),
      },
    ]
  })

  const menuUrl = computed(() => {
    if (!isLiveData.value || !kitchenSlug.value) return ''

    const menuId = previewMenuId.value
    const routeScope = directoryMenuRouteScope(kitchenSlug.value)

    return menuId
      ? menuRoutePath({ scope: routeScope, menuId })
      : menuRouteIndexPath(routeScope)
  })

  const pageStyle = computed(() => readKitchenMenuStyle(kitchen.value) ?? {})

  const locallySavedPageStyle = ref<Partial<PageStyle> | null>(null)

  const storedPageStyle = computed(() =>
    normalizePageStyle(locallySavedPageStyle.value || pageStyle.value)
  )

  const draftPageStyle = ref<Partial<PageStyle>>(normalizePageStyle())

  const saving = ref(false)

  const saveState = ref('')

  

  const activeThemeTarget = computed(() => {
    const appId = kitchenAppId.value
    const id = normalizeString(kitchenId.value)
    return canWriteTheme.value && appId && id
      ? { appId, kitchenId: id, key: `${appId}:${id}` }
      : null
  })

  const targetDrafts = new Map<string, Partial<PageStyle>>()

  let queuedThemeSave: ThemeSaveRequest | null = null

  const pendingThemeSaves = new Map<string, ThemeSaveRequest>()

  let inFlightThemeSave: ThemeSaveRequest | null = null

  let saveTimer: ReturnType<typeof setTimeout> | undefined

  watch([kitchenId, kitchenAppId, canWriteTheme], () => {
    discardQueuedThemeSave()
    pendingThemeSaves.clear()
    locallySavedPageStyle.value = null
    saveState.value = ''
    const target = activeThemeTarget.value
    draftPageStyle.value =
      targetDrafts.get(target?.key || '') || normalizePageStyle(pageStyle.value)
  })

  watch(
    previewMenus,
    (menus: Menu[]) => {
      const ids = menus
        .map((menu: Menu) => normalizeString(menu.id))
        .filter(Boolean)
      if (
        selectedPreviewMenuId.value &&
        ids.includes(selectedPreviewMenuId.value)
      )
        return

      selectedPreviewMenuId.value = normalizeString(
        fallbackPreviewMenu.value?.id
      )
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
          targetDrafts.get(activeKey) || draftPageStyle.value
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
    if (!canWriteTheme.value || !target) return

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
      queuedThemeSave = null
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
    if (request && isActiveThemeTarget(request)) void flushThemeSave(request)
  }

  function discardQueuedThemeSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = undefined
    queuedThemeSave = null
  }

  function isActiveThemeTarget(request: ThemeSaveRequest) {
    return canWriteTheme.value && activeThemeTarget.value?.key === request.key
  }

  function hasNewerThemeSave(request: ThemeSaveRequest) {
    return (
      pendingThemeSaves.has(request.key) || queuedThemeSave?.key === request.key
    )
  }

  function hasOutstandingThemeSave(key: string) {
    return (
      inFlightThemeSave?.key === key ||
      pendingThemeSaves.has(key) ||
      queuedThemeSave?.key === key
    )
  }

  async function flushThemeSave(request: ThemeSaveRequest) {
    if (!isActiveThemeTarget(request)) return
    pendingThemeSaves.set(request.key, request)
    if (saving.value) return
    saving.value = true

    while (pendingThemeSaves.size) {
      const entry = pendingThemeSaves.entries().next().value
      if (!entry) break
      const [key, next] = entry
      pendingThemeSaves.delete(key)
      if (!isActiveThemeTarget(next)) continue
      inFlightThemeSave = next

      if (isActiveThemeTarget(next)) saveState.value = 'Saving...'
      try {
        const user = await useRequireUser()
        const token = await user.getIdToken()
        if (!isActiveThemeTarget(next)) continue
        requireWritableData('live')
        const result = await $fetch<{
          ok: true
          app_id: string
          kitchen_id: string
        }>('/api/workspace/kitchen/theme', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            kitchen_id: next.kitchenId,
            style: themeWriteStyle(next.style),
          },
        })
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
        const message =
          error instanceof Error ? error.message : 'Please try again.'
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
    discardQueuedThemeSave()
    pendingThemeSaves.clear()
  })

  return {
    selectedKitchen,
    kitchenId,
    dataType,
    canWrite,
    refreshTargets,
    requireWritableData,
    menus,
    toast,
    fireux,
    kitchen,
    normalizeString,
    kitchenAppId,
    normalizePageStyle,
    pageStyleEquals,
    themeWriteStyle,
    kitchenName,
    kitchenSlug,
    selectedPreviewMenuId,
    previewMenus,
    fallbackPreviewMenu,
    previewMenu,
    previewMenuId,
    isLiveData,
    canWriteTheme,
    livePreviewMenuId,
    previewMenuRouteScope,
    previewMenuDetail,
    previewSections,
    menuUrl,
    pageStyle,
    locallySavedPageStyle,
    storedPageStyle,
    draftPageStyle,
    saving,
    saveState,
    activeThemeTarget,
    targetDrafts,
    queuedThemeSave,
    pendingThemeSaves,
    inFlightThemeSave,
    saveTimer,
    setDraftPageStyle,
    selectPreviewMenu,
    queueThemeSave,
    flushQueuedThemeSave,
    discardQueuedThemeSave,
    isActiveThemeTarget,
    hasNewerThemeSave,
    hasOutstandingThemeSave,
    flushThemeSave,
  }
}
