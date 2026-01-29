<!-- flag -->
<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Volunteering"
      :firebase-value="items"
      :update-function="onSave"
      :item-title="itemTitle"
      :item-date="itemDate"
      :item-subtitle="itemSubtitle"
      :fields="fields"
      :show-actions="true"
    >
      <template #create="{ push }">
        <UButton
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
  </div>
</template>

<script setup lang="ts">
import type { VolunteeringItem } from '../../../../../../models/profiles/Professional/supporting';

const props = defineProps<{
  items: VolunteeringItem[]
  onSave: (items: VolunteeringItem[]) => Promise<void>
}>()

const itemTitle = (item: VolunteeringItem) => item.organization || 'Organization'
const itemDate = (item: VolunteeringItem) =>
  `${item.from_year || 'Start'}–${item.ongoing ? 'Present' : (item.to_year || 'End')}`
const itemSubtitle = (item: VolunteeringItem) => item.role || 'Role'

const fields = [
  { key: 'organization', type: 'text', label: 'Organization', placeholder: 'Organization' },
  { key: 'role', type: 'text', label: 'Role', placeholder: 'Role' },
  { key: 'from_year', type: 'text', label: 'From year', placeholder: 'From year' },
  { key: 'to_year', type: 'text', label: 'To year', placeholder: 'To year' },
  { key: 'ongoing', type: 'checkbox', label: 'Ongoing' },
  { key: 'responsibilities', type: 'textarea', label: 'Responsibilities', placeholder: 'Responsibilities', rows: 3 },
]
</script>
