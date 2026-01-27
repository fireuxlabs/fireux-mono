<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2 text-sm font-semibold">
        <UIcon name="i-lucide-languages" />
        Languages
      </div>
    </template>

    <MoleculesFormsFirestoreObjectArray
      label="Languages"
      :firebase-value="items"
      :update-function="onSave"
    >
      <template #display="{ item, startEditing, remove }">
        <div class="space-y-2">
          <div class="text-sm font-medium">
            {{ item.language || 'Language' }}
          </div>
          <div class="text-xs text-gray-500">
            {{ item.proficiency || 'Proficiency not set' }}
          </div>
          <div class="flex gap-2">
            <UButton size="xs" variant="soft" icon="i-lucide-pencil" @click="startEditing">
              Edit
            </UButton>
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove">
              Remove
            </UButton>
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
          icon="i-lucide-plus"
          @click="push({ language: '', proficiency: '' })"
        >
          Add language
        </UButton>
      </template>
    </MoleculesFormsFirestoreObjectArray>
  </UCard>
</template>

<script setup lang="ts">
import type { LanguageProficiency } from '../../../../../../models/profiles/Professional/supporting';

defineProps<{
  items: LanguageProficiency[]
  onSave: (items: LanguageProficiency[]) => Promise<void>
}>()
</script>
