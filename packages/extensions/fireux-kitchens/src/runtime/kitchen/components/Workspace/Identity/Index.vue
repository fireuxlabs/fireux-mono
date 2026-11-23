<template>
  <form @submit.prevent="save">
    <fieldset :disabled="saving" class="kitchen-identity-fields">
      <UFormField label="Kitchen name" name="name" required>
        <UInput v-model="draft.name" required maxlength="120" />
      </UFormField>
      <UFormField label="Public URL slug" name="slug">
        <UInput v-model="draft.slug" maxlength="80" />
      </UFormField>
      <UFormField label="Status" name="status">
        <USelect
          v-model="draft.status"
          :items="statusOptions"
          placeholder="Choose status"
        />
      </UFormField>
      <UFormField label="Visibility" name="visibility">
        <USelect
          v-model="draft.visibility"
          :items="visibilityOptions"
          placeholder="Choose visibility"
        />
      </UFormField>
      <UFormField label="Public description" name="description">
        <UTextarea v-model="draft.description" maxlength="2000" />
      </UFormField>
      <UFormField label="Primary image URL" name="imageUrl">
        <UInput v-model="draft.imageUrl" type="url" maxlength="2048" />
      </UFormField>
      <UFormField label="Linked Place ID" name="placeId">
        <UInput v-model="draft.placeId" maxlength="250" />
      </UFormField>
      <div>
        <UButton
          type="submit"
          :loading="saving"
          :disabled="!dirty || !draft.name.trim()"
        >
          Save identity
        </UButton>
      </div>
    </fieldset>
    <UAlert v-if="error" color="error" :title="error" />
    <p v-else-if="saved" role="status">Kitchen identity saved.</p>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  KitchenStatuses,
  KitchenVisibilities,
  type Kitchen,
} from '../../../models/kitchen.model'
import { useKitchenUpdate } from '../../../composables/useKitchenUpdate'
import type { KitchenIdentityUpdate } from '../../../server/identity/update-input'

const props = defineProps<{ kitchen: Kitchen }>()
const statusOptions = [...KitchenStatuses]
const visibilityOptions = [...KitchenVisibilities]
const fields = (kitchen: Kitchen) => ({
  name: kitchen.name,
  slug: kitchen.slug ?? '',
  status: kitchen.status,
  visibility: kitchen.visibility,
  description: kitchen.description ?? '',
  imageUrl: kitchen.imageUrl ?? '',
  placeId: kitchen.placeId ?? '',
})
const draft = reactive(fields(props.kitchen))
const baseline = ref(fields(props.kitchen))
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const { updateKitchen, captureIntent } = useKitchenUpdate([
  () => props.kitchen.id,
])
const dirty = computed(() =>
  Object.entries(draft).some(
    ([key, value]) => value !== baseline.value[key as keyof typeof draft]
  )
)

watch(
  () => props.kitchen,
  (kitchen) => {
    if (dirty.value || saving.value) return
    baseline.value = fields(kitchen)
    Object.assign(draft, baseline.value)
  }
)

async function save() {
  if (!dirty.value || saving.value || !draft.name.trim()) return
  const current = captureIntent()
  const submitted = { ...draft }
  const previous = baseline.value
  const changes: KitchenIdentityUpdate = {}
  if (submitted.name !== previous.name) changes.name = submitted.name.trim()
  if (submitted.slug !== previous.slug)
    changes.slug = submitted.slug.trim() || null
  if (submitted.status && submitted.status !== previous.status)
    changes.status = submitted.status
  if (submitted.visibility && submitted.visibility !== previous.visibility)
    changes.visibility = submitted.visibility
  if (submitted.description !== previous.description)
    changes.description = submitted.description.trim() || null
  if (submitted.imageUrl !== previous.imageUrl)
    changes.imageUrl = submitted.imageUrl.trim() || null
  if (submitted.placeId !== previous.placeId)
    changes.placeId = submitted.placeId.trim() || null
  if (!Object.keys(changes).length) return

  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await updateKitchen({ kitchenId: props.kitchen.id, changes }, current)
    if (current()) {
      baseline.value = submitted
      saved.value = true
    }
  } catch (failure) {
    if (current()) {
      error.value =
        (failure as { data?: { statusMessage?: string } })?.data
          ?.statusMessage ||
        (failure instanceof Error
          ? failure.message
          : 'Could not save Kitchen identity.')
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.kitchen-identity-fields {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
</style>
