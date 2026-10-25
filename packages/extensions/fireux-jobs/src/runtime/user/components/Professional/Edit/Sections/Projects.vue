<!-- flag -->
<!-- Concurrent edit — 2026-07-20 19:17 CEST — Repo Efficiency Pass 2 of 6: enforce Professional project editor capacity. -->
<!-- Concurrent edit — 2026-07-21 14:35 CEST — Profile editor CSS pass: remove the ineffective single-child section wrapper. -->
<template>
  <FireFormsEditableObjectArray
    label="Projects"
    :value="items"
    :update="onSave"
    :item-title="itemTitle"
    :item-date="itemDate"
    :item-subtitle="itemSubtitle"
    :fields="fields"
    :show-actions="true"
    :max-items="maxItems"
  >
    <template #create="{ push, canPush }">
      <UButton
        v-if="canPush"
        size="xs"
        variant="soft"
        @click="push({
          name: '',
          role: '',
          from_year: '',
          to_year: '',
          ongoing: false,
          responsibilities: '',
        })"
      >
        Add project
      </UButton>
    </template>
  </FireFormsEditableObjectArray>
</template>

<script setup lang="ts">
import type { ProjectItem } from '../../../../utils/profiles/Professional/professional';

type ObjectArrayField = {
  key: string
  type: 'text' | 'textarea' | 'checkbox'
  label?: string
  placeholder?: string
  rows?: number
}

const props = defineProps<{
  items: ProjectItem[]
  onSave: (items: ProjectItem[]) => Promise<void>
  maxItems: number
}>()

const itemTitle = (item: ProjectItem) => item.name || 'Project'
const itemDate = (item: ProjectItem) =>
  `${item.from_year || 'Start'}–${item.ongoing ? 'Present' : (item.to_year || 'End')}`
const itemSubtitle = (item: ProjectItem) => item.role || 'Role'

const fields: ObjectArrayField[] = [
  { key: 'name', type: 'text', label: 'Project', placeholder: 'Project' },
  { key: 'role', type: 'text', label: 'Role', placeholder: 'Role' },
  { key: 'from_year', type: 'text', label: 'From year', placeholder: 'From year' },
  { key: 'to_year', type: 'text', label: 'To year', placeholder: 'To year' },
  { key: 'ongoing', type: 'checkbox', label: 'Ongoing' },
  { key: 'responsibilities', type: 'textarea', label: 'Responsibilities', placeholder: 'Responsibilities', rows: 3 },
]
</script>
