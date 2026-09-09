// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: gate Menu uploads on linked Place currency.
import { computed, ref, unref, watch, type ComputedRef, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useKitchenMenusContextSource } from './useKitchenMenusContext'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

type UseKitchenWorkspaceMenuUploadPayloadOptions = {
  uploadId?: MaybeRef<string | null | undefined>
  lockSlug?: MaybeRef<boolean | null | undefined>
  replaceExisting?: MaybeRef<boolean | null | undefined>
  title?: MaybeRef<string | null | undefined>
  description?: MaybeRef<string | null | undefined>
  ctaLabel?: MaybeRef<string | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')
const optionText = (value: MaybeRef<string | null | undefined> | undefined) =>
  text(value === undefined ? '' : unref(value))
const optionBool = (value: MaybeRef<boolean | null | undefined> | undefined) =>
  Boolean(value === undefined ? false : unref(value))

export function useKitchenWorkspaceMenuUploadPayload(
  options: UseKitchenWorkspaceMenuUploadPayloadOptions = {}
) {
  const { currentUser } = useAuth()
  const {
    selectedKitchen,
    kitchenId,
    activeKitchenAppId,
    canWrite,
    currencyCode,
  } = useKitchenMenusContextSource()
  const authToken = ref('')

  const kitchenSlug = computed(() =>
    normalizeSlug(
      text((selectedKitchen.value as Record<string, unknown> | null)?.slug) ||
        text((selectedKitchen.value as Record<string, unknown> | null)?.name) ||
        kitchenId.value
    )
  )
  const menuPath = computed(() =>
    normalizeSlug(optionText(options.uploadId) || 'main-menu')
  )
  const currentOrigin = computed(() =>
    import.meta.client ? origin(window.location.origin) : ''
  )
  const endpointQuery = computed(() => {
    if (!activeKitchenAppId.value || !kitchenId.value) return ''

    const query = new URLSearchParams({
      appId: activeKitchenAppId.value,
      kitchenId: kitchenId.value,
    })
    if (optionBool(options.replaceExisting)) query.set('replace', '1')

    return query.toString()
  })
  const createEndpoint = computed(() =>
    currentOrigin.value && endpointQuery.value
      ? `${currentOrigin.value}/api/workspace/kitchen/menus/upload?${endpointQuery.value}`
      : ''
  )
  const availabilityEndpoint = computed(() =>
    currentOrigin.value && endpointQuery.value
      ? `${currentOrigin.value}/api/workspace/kitchen/menus/upload/availability?${endpointQuery.value}`
      : ''
  )
  const canUseTool = computed(() =>
    Boolean(
      canWrite.value &&
        activeKitchenAppId.value &&
        kitchenId.value &&
        currencyCode.value &&
        menuPath.value &&
        createEndpoint.value &&
        availabilityEndpoint.value
    )
  )
  const payload = computed(() => ({
    consumer: {
      kitchen: {
        id: kitchenId.value,
        slug: kitchenSlug.value,
      },
      storage: {
        appId: activeKitchenAppId.value,
        endpointOrigin: currentOrigin.value,
      },
    },
    copy: {
      title: optionText(options.title) || 'Step 1: Upload menu',
      description:
        optionText(options.description) ||
        'Upload a PDF for this menu. You can turn it into dishes later.',
      ctaLabel: optionText(options.ctaLabel) || 'Upload menu',
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
      locked: optionBool(options.lockSlug),
    },
    preview: {
      message: 'Upload your menu document.',
    },
    endpoints: {
      create: createEndpoint.value,
      availability: availabilityEndpoint.value,
    },
  }))

  watch(
    currentUser,
    async (user: { getIdToken: () => Promise<string> } | null) => {
      authToken.value =
        import.meta.client && user ? await user.getIdToken() : ''
    },
    { immediate: true }
  )

  return {
    canUseTool,
    currencyCode,
    payload,
    authToken,
  }
}
