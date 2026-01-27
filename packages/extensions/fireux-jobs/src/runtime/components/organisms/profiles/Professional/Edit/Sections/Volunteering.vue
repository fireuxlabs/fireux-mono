<template>
  <div class="profile-edit__section">
    <div class="profile-edit__section-header">
      <UIcon name="i-lucide-heart-handshake" />
      Volunteering
    </div>

    <MoleculesFormsFirestoreObjectArray
      label="Volunteering"
      :firebase-value="items"
      :update-function="onSave"
    >
      <template #display="{ item, startEditing, remove }">
        <div class="space-y-2">
          <div class="text-sm font-medium">{{ item.organization || 'Organization' }}</div>
          <div class="text-xs text-gray-500">
            {{ item.role || 'Role' }} · {{ item.from_year || 'Start' }}–{{ item.ongoing ? 'Present' : (item.to_year || 'End') }}
          </div>
          <div class="flex gap-2">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-pencil"
              aria-label="Edit volunteering"
              @click="startEditing"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              aria-label="Remove volunteering"
              @click="remove"
            />
          </div>
        </div>
      </template>

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
          icon="i-lucide-plus"
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

defineProps<{
  items: VolunteeringItem[]
  onSave: (items: VolunteeringItem[]) => Promise<void>
}>()
</script>
