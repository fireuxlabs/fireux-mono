<template>
  <UFormField
    label="Job title"
    hint="Optional. Does not change access permissions."
  >
    <UInput
      v-model="value"
      :list="listId"
      maxlength="120"
      placeholder="Choose or enter a title"
      class="w-full"
    />
    <datalist :id="listId">
      <option v-for="title in suggestions" :key="title" :value="title" />
    </datalist>
  </UFormField>
</template>
<script setup lang="ts">
import { useId } from 'vue'
const value = defineModel<string>({ required: true })
const listId = useId()
const suggestions = [
  'Project Manager',
  'Developer',
  'Designer',
  'Marketing',
  'Contributor',
]
</script>
