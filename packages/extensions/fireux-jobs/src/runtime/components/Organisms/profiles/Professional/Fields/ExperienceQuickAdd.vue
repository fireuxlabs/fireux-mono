<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <UInput v-model="form.name" placeholder="Organization or project name" />
      <UInput v-model="form.role" placeholder="Role / title (optional)" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <UInput v-model="form.from_year" placeholder="From year (e.g. 2022)" />
      <UInput
        v-model="form.to_year"
        :disabled="form.ongoing"
        placeholder="To year (e.g. 2024)"
      />
      <UCheckbox v-model="form.ongoing" label="Ongoing" />
    </div>

    <UTextarea
      v-model="form.responsibilities"
      placeholder="What did you do? (optional)"
    />

    <div class="flex items-center gap-2">
      <UButton color="primary" :disabled="!canCreate" @click="create">
        Add experience
      </UButton>
      <span class="text-xs text-gray-500"
        >Quick add creates a single entry; edit later for details.</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { ExperienceItem } from '../../../../../models/profiles/Professional.model'

const emit = defineEmits<(e: 'create', item: ExperienceItem) => void>()

const form = reactive<{
  name: string
  role: string
  from_year: string
  to_year: string
  ongoing: boolean
  responsibilities: string
}>({
  name: '',
  role: '',
  from_year: '',
  to_year: '',
  ongoing: false,
  responsibilities: '',
})

const canCreate = computed(() => !!form.name && !!form.from_year)

function reset() {
  form.name = ''
  form.role = ''
  form.from_year = ''
  form.to_year = ''
  form.ongoing = false
  form.responsibilities = ''
}

function create() {
  if (!canCreate.value) return
  const item: ExperienceItem = {
    name: form.name.trim(),
    role: form.role.trim() || undefined,
    from_year: form.from_year.trim(),
    to_year: form.ongoing ? null : form.to_year.trim() || null,
    ongoing: form.ongoing,
    responsibilities: form.responsibilities.trim() || undefined,
  }
  emit('create', item)
  reset()
}
</script>
