<template>
  <section class="space-y-4">
    <div v-if="hasHeader" class="space-y-1">
      <h3 v-if="label" class="text-base font-semibold text-gray-900">
        {{ label }}
      </h3>
      <p v-if="description" class="text-sm text-gray-500">
        {{ description }}
      </p>
    </div>

    <MoleculesFormsFirestoreObjectArray
      ref="listRef"
      :label="arrayLabel"
      :firebase-value="items"
      :update-function="onSave"
    >
      <template #display="{ item, index, startEditing }">
        <OrganismsProfilesProfessionalFieldsExperienceField
          :item="item"
          :index="index"
          mode="display"
          @edit="startEditing?.()"
        />
      </template>

      <template #edit="{ item, index, remove }">
        <OrganismsProfilesProfessionalFieldsExperienceField
          :item="item"
          :index="index"
          mode="edit"
          :remove="remove"
          @save="listRef?.saveItemEditing?.()"
          @cancel="listRef?.cancelItemEditing?.()"
          @remove="() => handleRemove(index, remove)"
        />
      </template>

      <template #create="{ push }">
        <OrganismsProfilesProfessionalFieldsExperienceCreate
          :loading="isSavingNew"
          @confirm="(payload: ExperienceItem) => handleCreateSave(payload, push as (i: ExperienceItem) => void)"
          @clear="onCreateClear"
        />
      </template>
    </MoleculesFormsFirestoreObjectArray>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'

const props = defineProps<{
  items: ExperienceItem[]
  onSave: (items: ExperienceItem[]) => Promise<void> | void
  label?: string
  description?: string
  listLabel?: string
}>()

const { items, onSave, label, description, listLabel } = toRefs(props)
const hasHeader = computed(
  () => Boolean(label?.value) || Boolean(description?.value)
)
const arrayLabel = computed(() => listLabel?.value ?? undefined)

type ListRef = {
  saveItemEditing?: () => Promise<void> | void
  cancelItemEditing?: () => void
}
const listRef = ref<ListRef | null>(null)
const isSavingNew = ref(false)

function handleRemove(index: number, remove?: () => void) {
  if (typeof remove !== 'function') return
  const item = items.value?.[index]
  const rawName =
    item && 'name' in item ? (item.name as string | undefined) : undefined
  const primaryLabel =
    rawName?.trim() || (item?.role as string | undefined)?.trim() || null
  const label = primaryLabel ? `“${primaryLabel}”` : `item #${index + 1}`

  if (typeof window !== 'undefined') {
    const confirmed = window.confirm(
      `Remove ${label}? This action can’t be undone.`
    )
    if (!confirmed) return
  }

  remove()
}

function onCreateClear() {
  listRef.value?.cancelItemEditing?.()
}

async function handleCreateSave(
  payload: ExperienceItem,
  push: (item: ExperienceItem) => void
) {
  if (isSavingNew.value) return
  const placeId = (payload?.place_id || '').trim()
  if (!placeId) return
  if (!listRef.value) return

  isSavingNew.value = true
  try {
    push({ ...payload, place_id: placeId })
    await listRef.value.saveItemEditing?.()
  } finally {
    isSavingNew.value = false
  }
}
</script>
