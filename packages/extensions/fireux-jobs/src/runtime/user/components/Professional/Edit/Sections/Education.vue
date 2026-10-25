<!-- flag -->
<!-- Concurrent edit — 2026-07-20 19:17 CEST — Repo Efficiency Pass 2 of 6: enforce Professional education editor capacity. -->
<!-- Concurrent edit — 2026-07-21 14:35 CEST — Profile editor CSS pass: remove the ineffective single-child section wrapper. -->
<template>
  <FireFormsEditableObjectArray
    label="Education"
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
  </FireFormsEditableObjectArray>
</template>

<script setup lang="ts">
import type { EducationItem } from '../../../../utils/profiles/Professional/professional';

type ObjectArrayField = {
  key: string
  type: 'text' | 'textarea' | 'checkbox'
  label?: string
  placeholder?: string
  rows?: number
}

const props = defineProps<{
  items: EducationItem[]
  onSave: (items: EducationItem[]) => Promise<void>
  maxItems: number
}>()

const itemTitle = (item: EducationItem) => item.degree || 'Degree'
const itemDate = (item: EducationItem) =>
  `${item.start_year || 'Start'}–${item.ongoing ? 'Present' : (item.end_year || 'End')}`
const itemSubtitle = (item: EducationItem) => item.institution || 'Institution'

const fields: ObjectArrayField[] = [
  { key: 'institution', type: 'text', label: 'Institution', placeholder: 'Institution' },
  { key: 'degree', type: 'text', label: 'Degree', placeholder: 'Degree' },
  { key: 'start_year', type: 'text', label: 'Start year', placeholder: 'Start year' },
  { key: 'end_year', type: 'text', label: 'End year', placeholder: 'End year' },
  { key: 'ongoing', type: 'checkbox', label: 'Ongoing' },
  { key: 'document_url', type: 'text', label: 'Document URL', placeholder: 'Document URL' },
  { key: 'image_url', type: 'text', label: 'Image URL', placeholder: 'Image URL' },
]
</script>
