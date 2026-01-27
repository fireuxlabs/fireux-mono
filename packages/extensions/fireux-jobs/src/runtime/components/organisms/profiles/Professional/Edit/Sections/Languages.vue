<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Languages"
      :firebase-value="items"
      :update-function="onSave"
      :item-title="itemTitle"
      :item-date="itemDate"
    >
      <template #edit="{ item, save, cancel }">
        <div class="space-y-2">
          <UInput v-model="item.language" placeholder="Language" />
          <UInput v-model="item.proficiency" placeholder="Proficiency" />
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
          @click="push({ language: '', proficiency: '' })"
        >
          Add language
        </UButton>
      </template>
    </MoleculesFormsFirestoreObjectArray>
  </div>
</template>

<script setup lang="ts">
import type { LanguageProficiency } from '../../../../../../models/profiles/Professional/supporting';

const props = defineProps<{
  items: LanguageProficiency[]
  onSave: (items: LanguageProficiency[]) => Promise<void>
}>()

const itemTitle = (item: LanguageProficiency) => item.language || 'Language'
const itemDate = (item: LanguageProficiency) => item.proficiency || 'Proficiency not set'
</script>
