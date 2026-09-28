<template>
  <UModal
    v-model:open="open"
    title="New offering"
    description="Create a separate offering, then choose its menus and serving hours. It starts switched off."
  >
    <UButton
      label="New offering"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      :disabled="disabled"
    />
    <template #body>
      <form class="space-y-4" @submit.prevent="submit">
        <UAlert
          v-if="error"
          color="error"
          title="Could not create offering"
          :description="error"
        />
        <UFormField label="Offering name" required>
          <UInput
            v-model="name"
            autofocus
            maxlength="120"
            :disabled="busy"
            class="w-full"
          />
        </UFormField>
        <UButton
          type="submit"
          label="Create with service off"
          :loading="busy"
          :disabled="disabled || !name.trim()"
        />
      </form>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { navigateTo } from '#imports'
import type { KitchenService } from '../../../models/service.model'
const props = defineProps<{
  disabled?: boolean
  create: (name: string) => Promise<{ ok: true; service: KitchenService }>
}>()
const open = ref(false),
  name = ref(''),
  error = ref(''),
  busy = ref(false)
let active = true
onBeforeUnmount(() => {
  active = false
})
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) open.value = false
  }
)
async function submit() {
  if (busy.value || props.disabled || !name.value.trim()) return
  busy.value = true
  error.value = ''
  try {
    const result = await props.create(name.value.trim())
    if (!active || props.disabled) return
    open.value = false
    name.value = ''
    await navigateTo('/workspace/kitchen/orders/services/' + result.service.id)
  } catch (cause) {
    if (active)
      error.value = cause instanceof Error ? cause.message : 'Please try again.'
  } finally {
    busy.value = false
  }
}
</script>
