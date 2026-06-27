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
      <span class="flex min-w-0 items-start gap-3 text-left">
        <UIcon
          v-if="icon"
          :name="icon"
          class="mt-0.5 size-4 shrink-0 text-muted"
        />
        <span class="grid min-w-0">
          <span class="truncate">{{ title }}</span>
          <span
            v-if="description"
            class="truncate text-xs font-normal text-dimmed"
          >
            {{ description }}
          </span>
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
// Kitchen identity edit sections stay local to the console identity surface.
withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
  defaultOpen?: boolean
}>(), {
  description: '',
  icon: '',
  defaultOpen: false,
})
</script>
