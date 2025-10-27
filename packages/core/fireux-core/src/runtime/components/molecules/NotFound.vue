<template>
  <UCard class="py-12 text-center">
    <div class="flex flex-col items-center gap-3">
      <UIcon
        v-if="showSpinner"
        name="i-lucide-loader-2"
        class="h-6 w-6 animate-spin text-primary-500"
      />
      <UIcon
        v-else-if="icon"
        :name="icon"
        class="h-10 w-10 text-gray-400 dark:text-gray-500"
      />
      <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
        <slot name="title">{{ resolvedTitle }}</slot>
      </p>
      <p
        v-if="
          (resolvedDescription && !showSpinner) ||
          $slots.description ||
          showSpinner
        "
        class="text-xs text-gray-500 dark:text-gray-400"
      >
        <slot name="description">
          {{ showSpinner ? loadingDescription : resolvedDescription }}
        </slot>
      </p>
      <slot />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    entity?: string
    kind?: 'document' | 'collection'
    title?: string
    description?: string
    icon?: string | null
    loading?: boolean
  }>(),
  {
    kind: 'collection',
    icon: 'i-lucide-search-x',
    title: '',
    description: '',
    loading: false,
  }
)

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

const showSpinner = computed(() => props.loading)

const defaultEntity = computed(() => props.entity?.trim().toLowerCase() ?? '')

const loadingTitle = computed(() => {
  const target = defaultEntity.value
  if (!target) return 'Loading…'
  return `Loading ${target}`
})

const resolvedTitle = computed(() => {
  if (showSpinner.value && !props.title) return loadingTitle.value
  if (props.title) return props.title
  const name = props.entity?.trim()
  if (!name)
    return props.kind === 'document' ? 'Item not found' : 'Nothing here yet'
  const pretty = capitalize(name)
  return props.kind === 'document'
    ? `${pretty} not found`
    : `No ${name.toLowerCase()} yet`
})

const resolvedDescription = computed(() => {
  if (props.description) return props.description
  return props.kind === 'document'
    ? 'We could not load the requested record.'
    : 'Once records are added, they will display here.'
})

const loadingDescription = computed(() =>
  props.kind === 'document'
    ? 'Hang tight while we look that up.'
    : 'Fetching the latest entries…'
)
</script>
