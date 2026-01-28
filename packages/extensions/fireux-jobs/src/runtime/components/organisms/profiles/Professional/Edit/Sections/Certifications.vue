<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Certifications"
      :firebase-value="items"
      :update-function="onSave"
      :item-title="itemTitle"
      :item-date="itemDate"
      :item-subtitle="itemSubtitle"
      :show-actions="true"
    >
      <template #edit="{ item, save, cancel }">
        <div class="space-y-2">
          <UInput v-model="item.name" placeholder="Certification name" />
          <UInput v-model="item.place_name" placeholder="Organization" />
          <UInput v-model="item.year" placeholder="Year" />
          <UInput v-model="item.document_url" placeholder="Document URL" />
          <UInput v-model="item.image_url" placeholder="Image URL" />
          <div class="flex gap-2">
            <UButton size="xs" variant="solid" icon="i-lucide-check" @click="save">
              Save
            </UButton>
            <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel">
              Cancel
            </UButton>
          </div>
        </div>
      </template>

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
import type { CertificationItem } from '../../../../../../models/profiles/Professional/supporting';

const props = defineProps<{
  items: CertificationItem[]
  onSave: (items: CertificationItem[]) => Promise<void>
}>()

const itemTitle = (item: CertificationItem) => item.name || 'Certification'
const itemDate = (item: CertificationItem) => item.year || 'Year not set'
const itemSubtitle = (item: CertificationItem) => item.place_name || 'Organization'
</script>
