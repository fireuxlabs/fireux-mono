<template>
  <UCollapsible :default-open="defaultOpen">
    <UButton
      class="group"
      color="neutral"
      variant="soft"
      block
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <span class="grid min-w-0 text-left">
        <span class="truncate">{{ title }}</span>
        <span
          v-if="description"
          class="truncate text-xs font-normal text-dimmed"
        >
          {{ description }}
        </span>
      </span>
    </UButton>

    <template #content>
      <div class="mt-4">
        <slot />
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
// Console operation spine: tools marker, read surface, collapsed write lane.
withDefaults(defineProps<{
  title?: string
  description?: string
  defaultOpen?: boolean
}>(), {
  title: 'Actions',
  description: '',
  defaultOpen: false,
})
</script>
