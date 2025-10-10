<template>
  <section class="space-y-4">
    <h3 class="text-base font-semibold">{{ title }}</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: list/editor using ObjectArray directly -->
      <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
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
              @remove="remove?.()"
            />
          </template>

          <template #create="{ push }">
            <OrganismsProfilesProfessionalFieldsExperienceQuickAdd
              @create="push"
            />
          </template>
        </MoleculesFormsFirestoreObjectArray>
      </div>

      <!-- Right: create-only panel that pushes into left list -->
      <div class="lg:sticky lg:top-4 self-start">
        <UCard>
          <template #header>
            <div class="font-medium">Add {{ title }}</div>
          </template>
          <OrganismsProfilesProfessionalFieldsExperienceQuickAdd
            @create="(item: any) => { listRef?.startEditing?.(); listRef?.push?.(item) }"
          />
        </UCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'

const props = defineProps<{
  title: string
  items: any[]
  onSave: (items: any[]) => Promise<void> | void
}>()

const { title, items, onSave } = toRefs(props)

const listRef = ref<any | null>(null)

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
    return `Adding new ${title.value?.toLowerCase?.() || 'item'}`
  }
  const item = currentEditingItem.value
  const label = item?.name || item?.title || item?.role || ''
  const indexLabel = currentEditingIndex.value + 1
  return label ? `Editing ${label}` : `Editing item #${indexLabel}`
})

const cancelEditing = () => {
  listRef.value?.cancelItemEditing?.()
}
</script>
