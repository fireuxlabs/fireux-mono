<template>
  <UButton
    label="Edit"
    aria-label="Edit Preparation"
    icon="i-lucide-pencil"
    color="neutral"
    variant="soft"
    :disabled="!canEdit"
    @click="start"
  />
  <UModal v-model:open="open" title="Edit Preparation">
    <template #body>
      <form class="fx-card-body-stack" @submit.prevent="save">
        <UFormField label="Name" required
          ><UInput v-model="draft.name" :maxlength="140" :disabled="saving"
        /></UFormField>
        <UFormField label="Description"
          ><UTextarea
            v-model="draft.description"
            :maxlength="2000"
            :rows="3"
            :disabled="saving"
        /></UFormField>
        <div v-if="error" role="alert">
          <p>{{ error }}</p>
          <FireCopyError :message="error" />
        </div>
        <div class="fx-card__actions">
          <UButton
            label="Cancel"
            type="button"
            color="neutral"
            variant="ghost"
            @click="open = false"
          /><UButton
            label="Save changes"
            type="submit"
            :loading="saving"
            :disabled="!changed || !canEdit || saving"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useIdentityEditor } from 'fireux-core/runtime/composables/fireux/useIdentityEditor'
import type { Preparation } from '../../preparation/models/model'
import { readPreparationChanges } from '../../preparation/changes'
import { usePrepMutation } from '../../composables/prep/usePrepMutation'
const props = defineProps<{
  record: Preparation
  kitchenId: string
  canEdit: boolean
}>()
const open = ref(false)
const baseline = ref({
  name: props.record.name,
  description: props.record.description || '',
})
const command = usePrepMutation([
  () => props.kitchenId,
  () => props.record.id,
  () => props.canEdit,
])
const { draft, changed, saving, error, begin, save } = useIdentityEditor({
  open,
  scope: [command.scopeKey, () => props.kitchenId, () => props.record.id],
  canEdit: () => props.canEdit,
  createDraft: () => ({
    name: props.record.name,
    description: props.record.description || '',
  }),
  signature: JSON.stringify,
  save: async (value, isCurrent) => {
    const changes = readPreparationChanges(
      Object.fromEntries(
        Object.entries(value).filter(
          ([key, next]) =>
            next !== baseline.value[key as keyof typeof baseline.value]
        )
      )
    )
    await command.update(
      'preparations',
      props.kitchenId,
      props.record.id,
      changes,
      isCurrent
    )
  },
  onSaved: () => {
    open.value = false
  },
  errorMessage: 'Preparation could not be saved.',
})
function start() {
  baseline.value = {
    name: props.record.name,
    description: props.record.description || '',
  }
  begin()
}
</script>
