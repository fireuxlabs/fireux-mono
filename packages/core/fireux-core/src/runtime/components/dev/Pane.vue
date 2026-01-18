<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ title }}
          </p>
          <p v-if="description && !$slots.header" class="text-xs text-gray-500 dark:text-gray-400">
            {{ description }}
          </p>
          <div v-if="$slots.header" class="text-xs text-gray-500 dark:text-gray-400">
            <slot name="header" />
          </div>
        </div>
        <div v-if="$slots.actions" class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <DevDriftToolbar
        v-if="showDrift"
        :drift-kind="driftKind"
        :selected-field="selectedField"
        :filter-options="filterOptions"
        :copy-label="copyLabel"
        :copy-icon="copyIcon"
        :copy-disabled="copyDisabled"
        @update:drift-kind="$emit('update:drift-kind', $event)"
        @update:selected-field="$emit('update:selected-field', $event)"
        @copy="$emit('copy')"
      />

      <slot />
    </div>

    <template v-if="jsonData != null || $slots.footer" #footer>
      <DevJson
        v-if="jsonData != null"
        :title="jsonTitle || 'JSON'"
        :data="jsonData"
        :default-open="jsonDefaultOpen"
        :hide-when-empty="jsonHideWhenEmpty"
      />
      <slot name="footer" />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DevDriftToolbar from './DevDriftToolbar.vue'
import DevJson from './DevJson.vue'

defineOptions({ name: 'Pane' })

type DriftKind = 'missing' | 'extra'

interface FilterOption {
  label: string
  value: string
}

interface Props {
  title: string
  description?: string
  driftKind?: DriftKind
  selectedField?: string
  filterOptions?: FilterOption[]
  copyLabel?: string
  copyIcon?: string
  copyDisabled?: boolean
  jsonTitle?: string
  jsonData?: unknown
  jsonDefaultOpen?: boolean
  jsonHideWhenEmpty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  filterOptions: () => [],
  copyLabel: 'Copy filtered drift',
  copyIcon: 'i-heroicons-clipboard-document-check',
  copyDisabled: false,
  jsonTitle: 'JSON',
  jsonDefaultOpen: false,
  jsonHideWhenEmpty: true,
})

defineEmits<{
  (event: 'update:drift-kind', value: DriftKind): void
  (event: 'update:selected-field', value: string): void
  (event: 'copy'): void
}>()

const showDrift = computed(() => (props.filterOptions?.length ?? 0) > 0)
</script>
