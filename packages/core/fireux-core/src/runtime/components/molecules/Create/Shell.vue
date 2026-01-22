<template>
  <UCard>
    <header class="card-header">
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-trash"
        @click="$emit('clear')"
      />
    </header>

    <UTabs v-model="tab" :items="tabs">
      <template #write>
        <slot name="write" />
      </template>
      <template #preview>
        <slot name="preview" />
      </template>
    </UTabs>

    <div class="actions">
      <UButton variant="ghost" :disabled="loading" @click="$emit('clear')">
        Clear
      </UButton>
      <UButton :loading="loading" color="primary" @click="$emit('submit')">
        {{ submitLabel }}
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type TabValue = 'write' | 'preview'

const props = withDefaults(
  defineProps<{ submitLabel?: string; loading?: boolean }>(),
  {
    submitLabel: 'Publish',
    loading: false,
  }
)

const tab = ref<TabValue>('write')
const tabs = computed(() => [
  { label: 'Write', icon: 'i-lucide-pencil', value: 'write', slot: 'write' },
  { label: 'Preview', icon: 'i-lucide-eye', value: 'preview', slot: 'preview' },
])

defineEmits<{
  (e: 'submit'): void
  (e: 'clear'): void
}>()
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

</style>
