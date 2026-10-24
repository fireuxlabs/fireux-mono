<template>
  <div class="space-y-3">
    <form class="grid gap-3 md:grid-cols-[1fr_auto]" @submit.prevent="save">
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
          Continue
        </UButton>
      </div>
    </form>

    <p v-if="!currencyCode" class="text-sm text-warning">
      Set the Place currency before importing a menu.
    </p>
    <MoleculesCopyError v-if="error" :message="error" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenMenusContextSource } from '../../../../composables/workspace/menus/useKitchenMenusContext'

const { activeKitchenAppId, canWrite, currencyCode, kitchenId } =
  useKitchenMenusContextSource()
const { currentUser } = useAuth()
const sourceUrl = ref('')
const pending = ref(false)
const error = ref('')

const canSave = computed(() =>
  Boolean(
    canWrite.value &&
      activeKitchenAppId.value &&
      kitchenId.value &&
      currencyCode.value &&
      sourceUrl.value &&
      currentUser.value &&
      !pending.value
  )
)

const route = useRoute()
const captureScope = useMenuEditorScope(
  [activeKitchenAppId, kitchenId, canWrite, sourceUrl, () => route.fullPath],
  () => {
    pending.value = false
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
    uploadId: `source-${crypto.randomUUID()}`,
    sourceUrl: sourceUrl.value,
  }
  pending.value = true
  error.value = ''

  try {
    const token = await user.getIdToken()
    if (!isCurrent() || currentUser.value?.uid !== user.uid) return
    // Creation stage 1: save a source only. The real kitchen menu is created after AI review + confirm.
    await $fetch('/api/workspace/kitchen/menus/source-url', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body,
    })

    if (!isCurrent()) return
    await navigateTo(
      `/workspace/kitchen/food-and-drink/menus/uploads/${encodeURIComponent(body.uploadId)}`
    )
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
