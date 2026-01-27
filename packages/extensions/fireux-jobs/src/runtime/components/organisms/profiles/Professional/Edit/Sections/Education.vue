<template>
  <div class="profile-edit__section">
    <div class="profile-edit__section-header">
      <UIcon name="i-lucide-graduation-cap" />
      Education
    </div>

    <MoleculesFormsFirestoreObjectArray
      :label="label"
      :firebase-value="items"
      :update-function="onSave"
    >
      <template #display="{ item, startEditing, remove }">
        <div class="space-y-2">
          <div class="text-sm font-medium">{{ item.degree || 'Degree' }}</div>
          <div class="text-xs text-gray-500">
            {{ item.institution || 'Institution' }} ·
            {{ item.start_year || 'Start' }}–{{ item.ongoing ? 'Present' : (item.end_year || 'End') }}
          </div>
          <div class="flex gap-2">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-pencil"
              aria-label="Edit education"
              @click="startEditing"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              aria-label="Remove education"
              @click="remove"
            />
          </div>
        </div>
      </template>

      <template #edit="{ item, save, cancel }">
        <div class="space-y-2">
          <UInput v-model="item.institution" placeholder="Institution" />
          <UInput v-model="item.degree" placeholder="Degree" />
          <UInput v-model="item.start_year" placeholder="Start year" />
          <UInput v-model="item.end_year" placeholder="End year" />
          <UCheckbox v-model="item.ongoing" label="Ongoing" />
          <UInput v-model="item.formatted_address" placeholder="Address" />
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
          icon="i-lucide-plus"
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
import type { EducationItem } from '../../../../../../models/profiles/Professional/supporting';

defineProps<{
  items: EducationItem[]
  onSave: (items: EducationItem[]) => Promise<void>
}>()
</script>
