<template>
  <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
    <span class="font-medium">Drift:</span>

    <UButton
      size="xs"
      :variant="driftKind === 'missing' ? 'solid' : 'ghost'"
      color="primary"
      @click="updateDriftKind('missing')"
    >
      Missing
    </UButton>

    <UButton
      size="xs"
      :variant="driftKind === 'extra' ? 'solid' : 'ghost'"
      color="primary"
      @click="updateDriftKind('extra')"
    >
      Extra
    </UButton>

    <span class="font-medium ml-2">Filter {{ driftKind }}:</span>

    <UButton
      v-for="option in filterOptions"
      :key="option.value"
      size="xs"
      :variant="selectedField === option.value ? 'solid' : 'ghost'"
      color="primary"
      @click="updateSelectedField(option.value)"
    >
      {{ option.label }}
    </UButton>

    <div class="flex-1" />
    <UButton
      size="xs"
      variant="outline"
      :disabled="copyDisabled"
      :icon="copyIcon"
      @click="onCopy"
    >
      {{ copyLabel }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { DriftKind } from '../../composables/dev/useModelDrift'

defineOptions({ name: 'DevDriftToolbar' })

type DriftOption = {
  label: string
  value: string
}

interface Props {
  driftKind: DriftKind
  selectedField: string
  filterOptions: DriftOption[]
  copyLabel?: string
  copyIcon?: string
  copyDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  copyLabel: 'Copy drift',
  copyIcon: 'i-heroicons-clipboard-document-check',
  copyDisabled: false,
})

const emit = defineEmits<{
  (e: 'update:driftKind', value: DriftKind): void
  (e: 'update:selectedField', value: string): void
  (e: 'copy'): void
}>()

const updateDriftKind = (value: DriftKind) => {
  if (value !== props.driftKind) emit('update:driftKind', value)
}

const updateSelectedField = (value: string) => {
  if (value !== props.selectedField) emit('update:selectedField', value)
}

const onCopy = () => {
  emit('copy')
}
</script>
