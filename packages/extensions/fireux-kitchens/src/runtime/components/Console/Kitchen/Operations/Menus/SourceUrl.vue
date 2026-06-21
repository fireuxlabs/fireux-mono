<template>
  <UCard variant="subtle">
    <template #header>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-highlighted">
          Use menu URL
        </h3>
        <p class="text-sm text-dimmed">
          Paste an existing ordering or menu page. This saves the source URL
          so AI can turn visible menu content into a review draft.
        </p>
      </div>
    </template>

    <form class="grid gap-3 md:grid-cols-[minmax(0,16rem)_1fr_auto]" @submit.prevent="save">
      <UFormField label="Menu name">
        <UInput
          v-model="menuName"
          placeholder="main, delivery, drinks"
          :disabled="pending"
        />
      </UFormField>

      <UFormField label="Menu URL">
        <UInput
          v-model="sourceUrl"
          placeholder="https://example.com/order"
          type="url"
          :disabled="pending"
        />
      </UFormField>

      <div class="flex items-end">
        <UButton
          type="submit"
          icon="i-lucide-link"
          :loading="pending"
          :disabled="!canSave"
        >
          Save URL source
        </UButton>
      </div>
    </form>

    <p v-if="message" class="mt-3 text-sm text-dimmed">
      {{ message }}
    </p>
    <p v-if="error" class="mt-3 text-sm text-error">
      {{ error }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const {
  activeKitchenAppId,
  kitchenId,
} = useKitchenConsoleMenus()
const { currentUser } = useAuth()
const menuName = ref('')
const sourceUrl = ref('')
const authToken = ref('')
const pending = ref(false)
const message = ref('')
const error = ref('')

const uploadId = computed(() => normalizeSlug(menuName.value))
const canSave = computed(() =>
  Boolean(
    activeKitchenAppId.value &&
      kitchenId.value &&
      uploadId.value &&
      sourceUrl.value &&
      authToken.value &&
      !pending.value
  )
)

watch(currentUser, async (user) => {
  authToken.value = import.meta.client && user ? await user.getIdToken() : ''
}, { immediate: true })

async function save() {
  if (!canSave.value) return

  pending.value = true
  message.value = ''
  error.value = ''

  try {
    await $fetch('/api/console/kitchen/menus/source-url', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${authToken.value}`,
      },
      body: {
        appId: activeKitchenAppId.value,
        kitchenId: kitchenId.value,
        uploadId: uploadId.value,
        sourceUrl: sourceUrl.value,
      },
    })

    message.value = `Saved ${uploadId.value} as a menu URL source.`
  } catch (caught) {
    error.value = caught instanceof Error
      ? caught.message
      : 'Menu URL source was not saved.'
  } finally {
    pending.value = false
  }
}
</script>
