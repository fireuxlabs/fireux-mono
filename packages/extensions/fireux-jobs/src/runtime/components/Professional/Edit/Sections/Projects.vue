<!-- flag -->
<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Projects"
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
    </MoleculesFormsFirestoreObjectArray>
  </div>
</template>

<script setup lang="ts">
import type { ProjectItem } from '../../../../../models/profiles/Professional/Professional.model';

const props = defineProps<{
  items: ProjectItem[]
  onSave: (items: ProjectItem[]) => Promise<void>
}>()

const itemTitle = (item: ProjectItem) => item.name || 'Project'
const itemDate = (item: ProjectItem) =>
  `${item.from_year || 'Start'}–${item.ongoing ? 'Present' : (item.to_year || 'End')}`
const itemSubtitle = (item: ProjectItem) => item.role || 'Role'

const fields = [
  { key: 'name', type: 'text', label: 'Project', placeholder: 'Project' },
  { key: 'role', type: 'text', label: 'Role', placeholder: 'Role' },
  { key: 'from_year', type: 'text', label: 'From year', placeholder: 'From year' },
  { key: 'to_year', type: 'text', label: 'To year', placeholder: 'To year' },
  { key: 'ongoing', type: 'checkbox', label: 'Ongoing' },
  { key: 'responsibilities', type: 'textarea', label: 'Responsibilities', placeholder: 'Responsibilities', rows: 3 },
]
</script>
