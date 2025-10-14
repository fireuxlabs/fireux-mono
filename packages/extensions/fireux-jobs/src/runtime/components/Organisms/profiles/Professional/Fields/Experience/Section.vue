<template>
  <section class="space-y-6">
    <h3 class="text-base font-semibold">{{ title }}</h3>

    <div class="space-y-6">
      <MoleculesFormsFirestoreObjectArray
        ref="listRef"
        :label="title"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'

const props = defineProps<{
  title: string
  items: ExperienceItem[]
  onSave: (items: ExperienceItem[]) => Promise<void> | void
}>()

const { title, items, onSave } = toRefs(props)

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
