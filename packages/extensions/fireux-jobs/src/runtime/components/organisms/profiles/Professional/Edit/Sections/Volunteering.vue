<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Volunteering"
      :firebase-value="items"
      :update-function="onSave"
      :item-title="itemTitle"
      :item-date="itemDate"
      :item-subtitle="itemSubtitle"
      :show-actions="true"
    >
      <template #edit="{ item, save, cancel }">
        <div class="space-y-2">
          <UInput v-model="item.organization" placeholder="Organization" />
          <UInput v-model="item.role" placeholder="Role" />
          <UInput v-model="item.from_year" placeholder="Start year" />
          <UInput v-model="item.to_year" placeholder="End year" />
          <UCheckbox v-model="item.ongoing" label="Ongoing" />
          <UTextarea v-model="item.responsibilities" :rows="3" placeholder="Responsibilities" />
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
</script>
