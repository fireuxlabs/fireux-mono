import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useKitchenConsole } from '../../core/useKitchenConsole'

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')

export function useKitchenConsoleMenuUploadPayload() {
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
  const menuPath = computed(() => 'main-menu')
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
        menuPath.value &&
        createEndpoint.value &&
        availabilityEndpoint.value
    )
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
      title: 'Step 1: Upload menu',
      description:
        'Upload a PDF for this menu. You can turn it into dishes later.',
      ctaLabel: 'Upload menu',
      loadingLabel: 'Uploading menu...',
      openTargetLabel: 'Open uploaded menu',
    },
    upload: {
      fileLabel: 'Menu file',
      accept: 'application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp',
      hint: 'Upload a PDF or photo of the menu.',
    },
    slug: {
      label: 'Menu name',
      placeholder: menuPath.value,
      initialValue: menuPath.value,
      takenMessage: 'This menu name is already taken.',
    },
    preview: {
      message: 'Upload your menu document.',
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
