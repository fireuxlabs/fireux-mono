<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Projects"
      :firebase-value="items"
      :update-function="onSave"
      :item-title="(item) => item.name || 'Project'"
      :item-date="(item) => `${item.from_year || 'Start'}–${item.ongoing ? 'Present' : (item.to_year || 'End')}`"
    >
      <template #display="{ item, startEditing, remove }">
        <div class="space-y-2">
          <div class="text-xs text-gray-500">
            {{ item.role || 'Role' }}
          </div>
          <div class="object-array__item-actions">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-pencil"
              aria-label="Edit project"
              @click="startEditing"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              aria-label="Remove project"
              @click="remove"
            />
          </div>
        </div>
      </template>

      <template #edit="{ item, save, cancel }">
        <div class="space-y-2">
          <UInput v-model="item.name" placeholder="Project name" />
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
import type { ProjectItem } from '../../../../../../models/profiles/Professional/supporting';

defineProps<{
  items: ProjectItem[]
  onSave: (items: ProjectItem[]) => Promise<void>
}>()
</script>
