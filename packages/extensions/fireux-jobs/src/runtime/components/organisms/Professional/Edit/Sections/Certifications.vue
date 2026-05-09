<!-- flag -->
<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Certifications"
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
            year: '',
            place_name: '',
            formatted_address: '',
            document_url: '',
            image_url: '',
          })"
        >
          Add certification
        </UButton>
      </template>
    </MoleculesFormsFirestoreObjectArray>
  </div>
</template>

<script setup lang="ts">
import type { CertificationItem } from '../../../../../models/profiles/Professional/Professional.model';

const props = defineProps<{
  items: CertificationItem[]
  onSave: (items: CertificationItem[]) => Promise<void>
}>()

const itemTitle = (item: CertificationItem) => item.name || 'Certification'
const itemDate = (item: CertificationItem) => item.year || 'Year not set'
const itemSubtitle = (item: CertificationItem) => item.place_name || 'Organization'

const fields = [
  { key: 'name', type: 'text', label: 'Certification name', placeholder: 'Certification name' },
  { key: 'place_name', type: 'text', label: 'Organization', placeholder: 'Organization' },
  { key: 'year', type: 'text', label: 'Year', placeholder: 'Year' },
  { key: 'document_url', type: 'text', label: 'Document URL', placeholder: 'Document URL' },
  { key: 'image_url', type: 'text', label: 'Image URL', placeholder: 'Image URL' },
]

</script>
