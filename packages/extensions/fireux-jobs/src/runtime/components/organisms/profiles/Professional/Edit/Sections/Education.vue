<!-- flag -->
<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Education"
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
            institution: '',
            degree: '',
            start_year: '',
            end_year: '',
            ongoing: false,
            formatted_address: '',
            document_url: '',
            image_url: '',
          })"
        >
          Add education
        </UButton>
      </template>
    </MoleculesFormsFirestoreObjectArray>
  </div>
</template>

<script setup lang="ts">
import type { EducationItem } from '../../../../../../models/profiles/Professional/Professional.model';

const props = defineProps<{
  items: EducationItem[]
  onSave: (items: EducationItem[]) => Promise<void>
}>()

const itemTitle = (item: EducationItem) => item.degree || 'Degree'
const itemDate = (item: EducationItem) =>
  `${item.start_year || 'Start'}–${item.ongoing ? 'Present' : (item.end_year || 'End')}`
const itemSubtitle = (item: EducationItem) => item.institution || 'Institution'

const fields = [
  { key: 'institution', type: 'text', label: 'Institution', placeholder: 'Institution' },
  { key: 'degree', type: 'text', label: 'Degree', placeholder: 'Degree' },
  { key: 'start_year', type: 'text', label: 'Start year', placeholder: 'Start year' },
  { key: 'end_year', type: 'text', label: 'End year', placeholder: 'End year' },
  { key: 'ongoing', type: 'checkbox', label: 'Ongoing' },
  { key: 'document_url', type: 'text', label: 'Document URL', placeholder: 'Document URL' },
  { key: 'image_url', type: 'text', label: 'Image URL', placeholder: 'Image URL' },
]
</script>
