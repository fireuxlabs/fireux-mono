<template>
  <div>
    <Form v-if="launcher === 'inline'" @created="emit('created', $event)" />

    <button
      v-else-if="launcher === 'cell'"
      type="button"
      class="card card--cell fx-action-surface min-h-28 appearance-none text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      @click="open = true"
    >
      <div class="card__media">
        <UAvatar icon="i-lucide-plus" size="md" class="shrink-0" />
        <div class="card__content card__stack">
          <div class="card__title">{{ label }}</div>
          <div v-if="description" class="card__subtitle">
            {{ description }}
          </div>
        </div>
      </div>
    </button>

    <UButton
      v-else-if="showLauncher"
      :label="label"
      icon="i-lucide-plus"
      color="primary"
      @click="open = true"
    />

    <UModal
      v-if="launcher !== 'inline'"
      v-model:open="open"
      title="Find your Kitchen"
      :ui="{ content: 'sm:max-w-xl' }"
    >
      <template #body>
        <Form @created="created" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceTools } from '../../composables/workspace/index/useKitchenWorkspaceTools'
import Form from './Create/Form.vue'

const {
  showLauncher = true,
  launcher = 'button',
  label = 'Add a Kitchen',
  description = '',
} = defineProps<{
  showLauncher?: boolean
  launcher?: 'button' | 'cell' | 'inline'
  label?: string
  description?: string
}>()
const emit = defineEmits<{
  (event: 'created', id: string): void
}>()
const { createKitchenOpen: open } = useKitchenWorkspaceTools()

function created(id: string) {
  open.value = false
  emit('created', id)
}
</script>
