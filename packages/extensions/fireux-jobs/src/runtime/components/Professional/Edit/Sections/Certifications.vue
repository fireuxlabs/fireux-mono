<!-- flag -->
<!-- Concurrent edit — 2026-07-20 19:17 CEST — Repo Efficiency Pass 2 of 6: enforce Professional certification editor capacity. -->
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
      :max-items="maxItems"
    >
      <template #create="{ push, canPush }">
        <UButton
          v-if="canPush"
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
import type { CertificationItem } from '../../../../models/profiles/Professional/Professional.model';

type ObjectArrayField = {
  key: string
  type: 'text' | 'textarea' | 'checkbox'
  label?: string
  placeholder?: string
  rows?: number
}

const props = defineProps<{
  items: CertificationItem[]
  onSave: (items: CertificationItem[]) => Promise<void>
  maxItems: number
}>()

const itemTitle = (item: CertificationItem) => item.name || 'Certification'
const itemDate = (item: CertificationItem) => String(item.year || 'Year not set')
const itemSubtitle = (item: CertificationItem) => item.place_name || 'Organization'

const fields: ObjectArrayField[] = [
  { key: 'name', type: 'text', label: 'Certification name', placeholder: 'Certification name' },
  { key: 'place_name', type: 'text', label: 'Organization', placeholder: 'Organization' },
  { key: 'year', type: 'text', label: 'Year', placeholder: 'Year' },
  { key: 'document_url', type: 'text', label: 'Document URL', placeholder: 'Document URL' },
  { key: 'image_url', type: 'text', label: 'Image URL', placeholder: 'Image URL' },
]

</script>
