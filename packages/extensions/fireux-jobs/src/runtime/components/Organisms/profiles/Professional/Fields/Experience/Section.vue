<template>
  <section class="space-y-6">
    <h3 class="text-base font-semibold">{{ title }}</h3>

    <div class="space-y-6">
      <div
        v-if="currentEditingIndex !== null"
        class="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50/70 px-3 py-2 text-sm text-primary-700"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-pencil" class="h-4 w-4" />
          <span>{{ editingLabel }}</span>
        </div>
        <UButton
          size="xs"
          variant="ghost"
          color="primary"
          @click="cancelEditing"
        >
          Cancel
        </UButton>
      </div>

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
      </MoleculesFormsFirestoreObjectArray>
    </div>

    <OrganismsProfilesProfessionalFieldsExperienceCreate
      v-if="currentEditingIndex === null"
      v-model:place-id="createPlaceId"
      :loading="isSavingNew"
      @save="handleCreateSave"
      @clear="resetCreate"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'

const props = defineProps<{
  title: string
  items: ExperienceItem[]
  onSave: (items: ExperienceItem[]) => Promise<void> | void
}>()

const { title, items, onSave } = toRefs(props)

const listRef = ref<any | null>(null)
const isSavingNew = ref(false)
const createPlaceId = ref('')

const currentEditingIndex = computed(
  () => listRef.value?.editingIndex?.value ?? null
)

const isCreatingNew = computed(() => {
  if (currentEditingIndex.value === null) return false
  return currentEditingIndex.value >= (items.value?.length ?? 0)
})

const currentEditingItem = computed(() => {
  if (currentEditingIndex.value === null) return null
  return items.value?.[currentEditingIndex.value] ?? null
})

const editingLabel = computed(() => {
  if (currentEditingIndex.value === null) return ''
  if (isCreatingNew.value) {
    return `Creating ${createLabel.value.toLowerCase()}`
  }
  const item = currentEditingItem.value
  const label = item?.name || item?.title || item?.role || ''
  const indexLabel = currentEditingIndex.value + 1
  return label ? `Editing ${label}` : `Editing item #${indexLabel}`
})

const createLabel = computed(() => title.value || 'experience')

const cancelEditing = () => {
  listRef.value?.cancelItemEditing?.()
}

const resetCreate = () => {
  createPlaceId.value = ''
}

function handleRemove(index: number, remove?: () => void) {
  if (typeof remove !== 'function') return

  const item = items.value?.[index]
  const primaryLabel =
    (item?.name as string | undefined)?.trim() ||
    (item?.role as string | undefined)?.trim() ||
    null
  const label = primaryLabel ? `“${primaryLabel}”` : `item #${index + 1}`

  if (typeof window !== 'undefined') {
    const confirmed = window.confirm(
      `Remove ${label}? This action can’t be undone.`
    )
    if (!confirmed) return
  }

  remove()
}

async function handleCreateSave(payload: ExperienceItem) {
  if (isSavingNew.value) return
  const placeId = (payload?.place_id || '').trim()
  if (!placeId) return

  isSavingNew.value = true
  try {
    const next = [...items.value, { place_id: placeId }]
    await onSave.value(next)
    resetCreate()
  } finally {
    isSavingNew.value = false
  }
}
</script>
