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
          :title="
            createdOfferingId ? 'Offering created' : 'Could not create offering'
          "
          :description="error"
          ><template #actions>
            <UButton
              v-if="createdOfferingId"
              label="Open offering"
              :to="'/workspace/kitchen/offerings/' + createdOfferingId"
            />
            <MoleculesCopyError :message="error" /> </template
        ></UAlert>
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
          label="Create with offering off"
          :loading="busy"
          :disabled="disabled || !name.trim() || Boolean(createdOfferingId)"
        />
      </form>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { navigateTo } from '#imports'
import type { KitchenOffering } from '../../../models/offering.model'
const props = defineProps<{
  captureIntent: () => () => boolean
  disabled?: boolean
  create: (
    name: string,
    isSurfaceCurrent?: () => boolean
  ) => Promise<{ ok: true; offering: KitchenOffering }>
}>()
const open = ref(false),
  name = ref(''),
  error = ref(''),
  busy = ref(false),
  createdOfferingId = ref('')
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) open.value = false
  }
)
const capture = useCommandScope([
  open,
  name,
  () => props.disabled,
  () => props.create,
])
watch(
  [open, name, () => props.disabled],
  () => {
    busy.value = false
    error.value = ''
    createdOfferingId.value = ''
  },
  { flush: 'sync' }
)
async function submit() {
  if (
    busy.value ||
    props.disabled ||
    createdOfferingId.value ||
    !name.value.trim()
  )
    return
  const local = capture()
  const owner = props.captureIntent()
  const isCurrent = () => local() && owner()
  busy.value = true
  error.value = ''
  let created: Awaited<ReturnType<typeof props.create>> | undefined
  try {
    const result = await props.create(name.value.trim(), isCurrent)
    created = result
    if (!isCurrent()) return result
    createdOfferingId.value = result.offering.id
    await navigateTo('/workspace/kitchen/offerings/' + result.offering.id)
    if (isCurrent()) {
      open.value = false
      name.value = ''
    }
    return result
  } catch (cause) {
    if (isCurrent())
      error.value = created
        ? 'Your offering was saved. Open its editor to continue.'
        : cause instanceof Error
          ? cause.message
          : 'Please try again.'
    return created
  } finally {
    if (local()) busy.value = false
  }
}
</script>
