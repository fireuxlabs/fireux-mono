import {
  computed,
  ref,
  toValue,
  type MaybeRefOrGetter,
  type WatchSource,
} from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/workspace/composables/useWorkspaceWriteGuard'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'
import { useOptionalKitchenMenuRecordContext } from './useKitchenMenuRecordContext'
import { useKitchenMenusContextSource } from './useKitchenMenusContext'

export function useMenuSourceUpload(
  options: {
    uploadId?: MaybeRefOrGetter<string | undefined>
    document?: MaybeRefOrGetter<boolean | undefined>
    replaceExisting?: MaybeRefOrGetter<boolean | undefined>
    ownerSources?: WatchSource[]
  } = {}
) {
  const { kitchenId, activeKitchenAppId, canWrite, currencyCode } =
    useOptionalKitchenMenuRecordContext() ?? useKitchenMenusContextSource()
  const { currentUser } = useAuth()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const route = useRoute()
  const pending = ref(false)
  const error = ref('')
  const message = ref('')
  const uploadId = computed(() =>
    String(toValue(options.uploadId) || '').trim()
  )
  const document = computed(() => Boolean(toValue(options.document)))
  const replaceExisting = computed(() =>
    Boolean(toValue(options.replaceExisting))
  )
  const capture = useMenuEditorScope(
    [
      kitchenId,
      activeKitchenAppId,
      canWrite,
      currencyCode,
      uploadId,
      document,
      replaceExisting,
      () => route.fullPath,
      ...(options.ownerSources || []),
    ],
    () => {
      pending.value = false
      error.value = ''
      message.value = ''
    }
  )

  async function uploadFiles(selected: File[]) {
    if (pending.value) return
    const current = capture(),
      user = currentUser.value
    const files = [...selected]
    const id = uploadId.value || `source-${crypto.randomUUID()}`
    const query = {
      appId: activeKitchenAppId.value,
      kitchenId: kitchenId.value,
      ...(replaceExisting.value ? { replace: '1' } : {}),
    }
    const endpoint = `/api/workspace/kitchen/menus/${document.value ? 'document-upload' : 'upload'}`
    pending.value = true
    error.value = ''
    message.value = ''
    try {
      const assertCurrent = () => {
        if (
          !current() ||
          !user ||
          currentUser.value?.uid !== user.uid ||
          !canWrite.value
        )
          throw new Error(
            'The account or Kitchen changed. Choose your file again.'
          )
        requireWritableData()
      }
      assertCurrent()
      if (!currencyCode.value)
        throw new Error('Set the Place currency before importing a menu.')
      if (!files.length || files.some((file) => !(file instanceof File)))
        throw new Error('Choose a PDF or photos of your menu.')
      if (document.value && files.length !== 1)
        throw new Error('Choose one document.')
      const token = await user!.getIdToken()
      assertCurrent()
      const body = new FormData()
      body.set('slug', id)
      for (const file of files) body.append('file', file, file.name)
      const result = await $fetch<{ ok: boolean; id: string }>(endpoint, {
        method: 'POST',
        query,
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      if (result?.ok !== true || result.id !== id)
        throw new Error(
          'The upload response did not identify the saved source.'
        )
      if (!current()) return
      message.value = 'Uploaded.'
      if (!uploadId.value)
        await navigateTo(
          `/workspace/kitchen/food-and-drink/menus/uploads/${encodeURIComponent(id)}`
        )
      return result
    } catch (caught) {
      if (current())
        error.value =
          caught instanceof Error ? caught.message : 'Upload failed. Try again.'
    } finally {
      if (current()) pending.value = false
    }
  }
  return { uploadFiles, pending, error, message, canWrite, currencyCode }
}
