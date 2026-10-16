<template>
  <UCard variant="subtle">
    <template #header>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-highlighted">Create from URL</h3>
        <p class="text-sm text-dimmed">
          Paste an existing ordering or menu page, then process it from the
          queue.
        </p>
      </div>
    </template>

    <form
      class="grid gap-3 md:grid-cols-[minmax(0,16rem)_1fr_auto]"
      @submit.prevent="save"
    >
      <UFormField label="Menu name">
        <UInput
          v-model="menuName"
          placeholder="main, delivery, drinks"
          :disabled="pending || !canWrite"
        />
      </UFormField>

      <UFormField label="Menu URL">
        <UInput
          v-model="sourceUrl"
          placeholder="https://example.com/order"
          type="url"
          :disabled="pending || !canWrite"
        />
      </UFormField>

      <div class="flex items-end">
        <UButton
          type="submit"
          icon="i-lucide-link"
          :loading="pending"
          :disabled="!canSave"
        >
          Save menu URL
        </UButton>
      </div>
    </form>

    <p v-if="message" class="mt-3 text-sm text-dimmed">
      {{ message }}
    </p>
    <p v-if="!currencyCode" class="mt-3 text-sm text-warning">
      Select a kitchen currency code before creating menus.
    </p>
    <MoleculesCopyError v-if="error" class="mt-3" :message="error" />
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useKitchenMenusContextSource } from '../../../../composables/workspace/menus/useKitchenMenusContext'

const { activeKitchenAppId, canWrite, currencyCode, kitchenId } =
  useKitchenMenusContextSource()
const { currentUser } = useAuth()
const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
const menuName = ref('')
const sourceUrl = ref('')
const pending = ref(false)
const message = ref('')
const error = ref('')

const uploadId = computed(() => normalizeSlug(menuName.value))
const canSave = computed(() =>
  Boolean(
    canWrite.value &&
      activeKitchenAppId.value &&
      kitchenId.value &&
      currencyCode.value &&
      uploadId.value &&
      sourceUrl.value &&
      currentUser.value &&
      !pending.value
  )
)

const route = useRoute()
const captureScope = useMenuEditorScope(
  [
    activeKitchenAppId,
    kitchenId,
    canWrite,
    menuName,
    sourceUrl,
    () => route.fullPath,
  ],
  () => {
    pending.value = false
    message.value = ''
    error.value = ''
  }
)

async function save() {
  const user = currentUser.value
  if (!canSave.value || !user) return
  const isCurrent = captureScope()
  const body = {
    appId: activeKitchenAppId.value,
    kitchenId: kitchenId.value,
    uploadId: uploadId.value,
    sourceUrl: sourceUrl.value,
  }
  pending.value = true
  message.value = ''
  error.value = ''

  try {
    requireWritableData()
    const token = await user.getIdToken()
    if (!isCurrent() || currentUser.value?.uid !== user.uid) return
    requireWritableData()
    // Creation stage 1: save a source only. The real kitchen menu is created after AI review + confirm.
    await $fetch('/api/workspace/kitchen/menus/source-url', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body,
    })

    if (!isCurrent()) return
    message.value = `Saved ${body.uploadId}. Process it from the queue below.`
  } catch (caught) {
    if (!isCurrent()) return
    error.value =
      caught instanceof Error
        ? caught.message
        : 'Menu URL source was not saved.'
  } finally {
    if (isCurrent()) pending.value = false
  }
}
</script>
