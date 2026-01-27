<template>
  <UCard>
    <MoleculesFormsFirestoreObjectArray
      :label="label"
      :firebase-value="items"
      :update-function="onSave"
    >
      <template #display="{ item, startEditing, remove }">
        <div class="space-y-2">
          <div class="text-sm font-medium">
            {{ item.role || 'Role' }}
          </div>
          <div class="text-xs text-gray-500">
            {{ item.name || item.place_name || item.place_id || 'Place' }} · {{ formatRange(item) }}
          </div>
          <p v-if="item.responsibilities" class="text-sm text-gray-600">
            {{ item.responsibilities }}
          </p>
          <div class="flex gap-2">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-pencil"
              @click="startEditing"
            >
              Edit
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              @click="remove"
            >
              Remove
            </UButton>
          </div>
        </div>
      </template>

      <template #edit="{ item, save, cancel }">
        <div class="space-y-2">
          <UInput v-model="item.role" placeholder="Role" />
          <UInput v-model="item.place_id" placeholder="Place ID" />
          <UInput v-model="item.name" placeholder="Place name (optional)" />
          <UInput v-model="item.formatted_address" placeholder="Formatted address" />
          <UInput v-model="item.short_address" placeholder="Short address" />
          <UInput v-model="item.image_url" placeholder="Image URL" />
          <div class="grid gap-2 sm:grid-cols-2">
            <UInput v-model="item.from_month" placeholder="From month" />
            <UInput v-model="item.from_year" placeholder="From year" />
            <UInput v-model="item.to_month" placeholder="To month" />
            <UInput v-model="item.to_year" placeholder="To year" />
          </div>
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
          @click="push(newExperienceItem())"
        >
          Add entry
        </UButton>
      </template>
    </MoleculesFormsFirestoreObjectArray>
  </UCard>
</template>

<script setup lang="ts">
import type { ExperienceItem } from '../../../../../models/profiles/Professional/supporting'

type ExperienceEntry = ExperienceItem & {
  name?: string
  place_name?: string
  formatted_address?: string
  short_address?: string
  image_url?: string
}

const props = defineProps<{
  label: string
  items: ExperienceEntry[]
  onSave: (items: ExperienceEntry[]) => Promise<void>
}>()

const formatRange = (item: ExperienceEntry) => {
  const start = [item.from_month, item.from_year].filter(Boolean).join(' ')
  const end = item.ongoing
    ? 'Present'
    : [item.to_month, item.to_year].filter(Boolean).join(' ')
  return [start, end].filter(Boolean).join(' · ') || 'Dates not listed'
}

const newExperienceItem = (): ExperienceEntry => ({
  role: '',
  place_id: '',
  name: '',
  formatted_address: '',
  short_address: '',
  image_url: '',
  from_month: '',
  from_year: '',
  to_month: '',
  to_year: '',
  ongoing: false,
  responsibilities: '',
})
</script>
