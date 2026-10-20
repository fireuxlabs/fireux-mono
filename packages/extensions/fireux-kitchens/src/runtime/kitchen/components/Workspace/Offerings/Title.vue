<template>
  <MoleculesFormsEditableSimpleField
    label="Title"
    :value="title"
    :maxlength="120"
    :disabled="disabled"
    disabled-message="This Kitchen is read-only."
    :capture-intent="captureIntent"
    :update="updateTitle"
    class="mb-6 max-w-lg"
  />
</template>
<script setup lang="ts">
import { useKitchenUpdate } from '../../../composables/firestore/useKitchenUpdate'
const props = defineProps<{ kitchenId: string; title: string; disabled: boolean }>()
const { updateKitchen, captureIntent } = useKitchenUpdate([() => props.kitchenId])
async function updateTitle(value: string) {
  if (props.disabled) throw new Error('This Kitchen is read-only.')
  await updateKitchen({
    kitchenId: props.kitchenId,
    changes: { 'services.title': value.trim() || 'Food & drinks' },
  })
}
</script>
