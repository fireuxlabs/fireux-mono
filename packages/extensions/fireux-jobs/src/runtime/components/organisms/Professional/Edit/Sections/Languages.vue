<template>
  <div class="profile-edit__section">
    <MoleculesFormsFirestoreObjectArray
      label="Languages"
      :firebase-value="sortedItems"
      :update-function="onSave"
      :item-title="itemTitle"
      :item-date="itemDate"
      :show-actions="true"
    >
      <template #edit="{ item, save, cancel }">
        <div class="space-y-2">
          <UInput v-model="item.language" placeholder="Language" />
          <select
            v-model="item.proficiency"
            class="w-full rounded-md border border-default bg-transparent px-3 py-2 text-sm"
          >
            <option value="">Proficiency</option>
            <option v-for="option in proficiencyOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
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
import { computed } from 'vue';
import type { LanguageProficiency } from '../../../models/profiles/Professional/Professional.model';

const props = defineProps<{
  items: LanguageProficiency[]
  onSave: (items: LanguageProficiency[]) => Promise<void>
}>()

const proficiencyOptions = [
  'Native',
  'Fluent',
  'C2',
  'C1',
  'B2',
  'B1',
  'A2',
  'A1',
]

const proficiencyRank = (value: string | undefined) => {
  const raw = String(value ?? '').trim().toLowerCase()
  if (!raw) return 99
  if (raw === 'native') return 0
  if (raw === 'fluent') return 1
  if (raw === 'c2') return 2
  if (raw === 'c1') return 3
  if (raw === 'b2') return 4
  if (raw === 'b1') return 5
  if (raw === 'a2') return 6
  if (raw === 'a1') return 7
  return 98
}

const sortedItems = computed(() =>
  [...(props.items ?? [])].sort((a, b) => {
    const rankDiff = proficiencyRank(a.proficiency) - proficiencyRank(b.proficiency)
    if (rankDiff !== 0) return rankDiff
    return String(a.language ?? '').localeCompare(String(b.language ?? ''))
  })
)

const itemTitle = (item: LanguageProficiency) => item.language || 'Language'
const itemDate = (item: LanguageProficiency) => item.proficiency || 'Proficiency not set'
</script>
