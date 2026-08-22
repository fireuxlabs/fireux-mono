<!-- flag -->
<!-- Concurrent edit — 2026-07-20 19:17 CEST — Repo Efficiency Pass 2 of 6: enforce Professional volunteering editor capacity. -->
<!-- Concurrent edit — 2026-07-21 14:35 CEST — Profile editor CSS pass: remove the ineffective single-child section wrapper. -->
<template>
  <MoleculesFormsFirestoreObjectArray
    label="Volunteering"
    :firebase-value="items"
    :update-function="onSave"
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
          organization: '',
          role: '',
          from_year: '',
          to_year: '',
          ongoing: false,
          responsibilities: '',
        })"
      >
        Add volunteering
      </UButton>
    </template>
  </MoleculesFormsFirestoreObjectArray>
</template>

<script setup lang="ts">
import type { VolunteeringItem } from '../../../../utils/profiles/Professional/professional';

type ObjectArrayField = {
  key: string
  type: 'text' | 'textarea' | 'checkbox'
  label?: string
  placeholder?: string
  rows?: number
}

const props = defineProps<{
  items: VolunteeringItem[]
  onSave: (items: VolunteeringItem[]) => Promise<void>
  maxItems: number
}>()

const itemTitle = (item: VolunteeringItem) => item.organization || 'Organization'
const itemDate = (item: VolunteeringItem) =>
  `${item.from_year || 'Start'}–${item.ongoing ? 'Present' : (item.to_year || 'End')}`
const itemSubtitle = (item: VolunteeringItem) => item.role || 'Role'

const fields: ObjectArrayField[] = [
  { key: 'organization', type: 'text', label: 'Organization', placeholder: 'Organization' },
  { key: 'role', type: 'text', label: 'Role', placeholder: 'Role' },
  { key: 'from_year', type: 'text', label: 'From year', placeholder: 'From year' },
  { key: 'to_year', type: 'text', label: 'To year', placeholder: 'To year' },
  { key: 'ongoing', type: 'checkbox', label: 'Ongoing' },
  { key: 'responsibilities', type: 'textarea', label: 'Responsibilities', placeholder: 'Responsibilities', rows: 3 },
]
</script>
