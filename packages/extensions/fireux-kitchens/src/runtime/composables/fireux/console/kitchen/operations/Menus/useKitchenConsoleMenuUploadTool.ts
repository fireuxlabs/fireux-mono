import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useKitchenConsole } from '../../core/useKitchenConsole'

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')

export function useKitchenConsoleMenuUploadTool() {
  const { currentUser } = useAuth()
  const kitchenConsole = useKitchenConsole()
  const authToken = ref('')

  const kitchenSlug = computed(() =>
    normalizeSlug(
      text((kitchenConsole.selection.kitchen.value as Record<string, unknown> | null)?.slug) ||
        text((kitchenConsole.selection.kitchen.value as Record<string, unknown> | null)?.name) ||
        kitchenConsole.selection.kitchenId.value
    )
  )
  const sourcePath = computed(() =>
    kitchenSlug.value ? `${kitchenSlug.value}-menu-source` : ''
  )
  const currentOrigin = computed(() =>
    import.meta.client ? origin(window.location.origin) : ''
  )
  const endpointQuery = computed(() => {
    if (!kitchenConsole.runtime.appId.value || !kitchenConsole.selection.kitchenId.value) return ''

    return new URLSearchParams({
      appId: kitchenConsole.runtime.appId.value,
      kitchenId: kitchenConsole.selection.kitchenId.value,
    }).toString()
  })
  const createEndpoint = computed(() =>
    currentOrigin.value && endpointQuery.value
      ? `${currentOrigin.value}/api/console/kitchen/menus/upload-source?${endpointQuery.value}`
      : ''
  )
  const availabilityEndpoint = computed(() =>
    currentOrigin.value && endpointQuery.value
      ? `${currentOrigin.value}/api/console/kitchen/menus/upload-source/availability?${endpointQuery.value}`
      : ''
  )
  const canUseTool = computed(() =>
    Boolean(
      kitchenConsole.runtime.appId.value &&
        kitchenConsole.selection.kitchenId.value &&
        sourcePath.value &&
        createEndpoint.value &&
        availabilityEndpoint.value
    )
  )
  const ownerAppLabel = computed(() =>
    kitchenConsole.runtime.appId.value || 'the selected kitchen app'
  )
  const payload = computed(() => ({
    consumer: {
      kitchen: {
        id: kitchenConsole.selection.kitchenId.value,
        slug: kitchenSlug.value,
      },
      storage: {
        appId: kitchenConsole.runtime.appId.value,
        endpointOrigin: currentOrigin.value,
      },
    },
    copy: {
      title: 'Step 1: Upload menu source',
      description:
        'Upload the original menu PDF so the owning app can store it against this kitchen.',
      ctaLabel: 'Upload menu source',
      loadingLabel: 'Uploading menu source...',
      openTargetLabel: 'Open uploaded menu source',
    },
    upload: {
      fileLabel: 'Menu document',
      accept: 'application/pdf,.pdf',
      hint: 'Upload the original menu PDF.',
    },
    slug: {
      label: 'Menu source path',
      placeholder: sourcePath.value,
      initialValue: sourcePath.value,
      takenMessage: 'This menu source path is already taken.',
    },
    preview: {
      message: `This source document will be stored by ${ownerAppLabel.value}. Dishes, menus, and translations come later.`,
    },
    endpoints: {
      create: createEndpoint.value,
      availability: availabilityEndpoint.value,
    },
  }))

  watch(currentUser, async (user) => {
    authToken.value = import.meta.client && user ? await user.getIdToken() : ''
  }, { immediate: true })

  return {
    canUseTool,
    payload,
    authToken,
  }
}
