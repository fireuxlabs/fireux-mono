<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Languages"
      :firebase-value="items"
      :update-function="onSave"
      :item-title="(item) => item.language || 'Language'"
      :item-date="(item) => item.proficiency || 'Proficiency not set'"
    >
      <template #display="{ item, startEditing, remove }">
        <div class="space-y-2">
          <div class="object-array__item-actions">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-pencil"
              aria-label="Edit language"
              @click="startEditing"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              aria-label="Remove language"
              @click="remove"
            />
          </div>
        </div>
      </template>

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

defineProps<{
  items: LanguageProficiency[]
  onSave: (items: LanguageProficiency[]) => Promise<void>
}>()
</script>
