<template>
  <UCard
    as="section"
    :aria-label="label"
    class="overflow-hidden"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <div class="landing-workspace-preview__layout">
      <aside class="border-r border-default bg-elevated/70 p-2">
        <div class="flex min-w-0 justify-center overflow-hidden py-2">
          <slot name="target" />
        </div>

        <nav class="mt-2 grid gap-1" :aria-label="navigationLabel">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="flex min-h-9 w-full items-center justify-center rounded-lg text-toned transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="item.id === modelValue ? 'bg-primary/10 text-primary' : ''"
            :aria-label="item.title"
            :aria-current="item.id === modelValue ? 'page' : undefined"
            :title="item.title"
            @click="emit('update:modelValue', item.id)"
          >
            <UIcon :name="item.icon" class="size-4 shrink-0" />
          </button>
        </nav>

        <nav
          v-if="secondaryItems.length"
          class="mt-3 border-t border-default pt-3"
          :aria-label="secondaryNavigationLabel"
        >
          <p class="mb-1 hidden px-2 text-xs font-semibold text-muted sm:block">
            {{ secondaryLabel }}
          </p>
          <button
            v-for="item in secondaryItems"
            :key="item.id"
            type="button"
            class="flex min-h-9 w-full items-center justify-center rounded-lg text-toned transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="item.id === modelValue ? 'bg-primary/10 text-primary' : ''"
            :aria-label="item.title"
            :aria-current="item.id === modelValue ? 'page' : undefined"
            :title="item.title"
            @click="emit('update:modelValue', item.id)"
          >
            <UIcon :name="item.icon" class="size-4 shrink-0" />
          </button>
        </nav>
      </aside>

      <div v-if="selectedItem" class="min-w-0 bg-default p-4 sm:p-5">
        <header
          class="flex min-h-9 items-center gap-2 border-b border-default pb-4"
        >
          <p class="min-w-0 flex-1 truncate font-semibold text-highlighted">
            {{ selectedItem.title }}
          </p>
          <UButton
            :to="workspaceTo"
            color="neutral"
            variant="soft"
            size="xs"
            trailing-icon="i-lucide-arrow-up-right"
            class="shrink-0"
            :aria-label="openWorkspaceAriaLabel"
            @click="emit('openWorkspace', $event)"
          >
            <span class="hidden sm:inline">{{ openWorkspaceLabel }}</span>
            <span class="sm:hidden">{{ openWorkspaceMobileLabel }}</span>
          </UButton>
        </header>

        <slot :selected-item="selectedItem" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LandingWorkspacePreviewItem } from './product.types'

const props = withDefaults(
  defineProps<{
    modelValue: string
    items: readonly LandingWorkspacePreviewItem[]
    secondaryItems?: readonly LandingWorkspacePreviewItem[]
    label: string
    navigationLabel: string
    secondaryLabel?: string
    secondaryNavigationLabel?: string
    workspaceTo: string
    openWorkspaceAriaLabel?: string
    openWorkspaceLabel?: string
    openWorkspaceMobileLabel?: string
  }>(),
  {
    secondaryItems: () => [],
    secondaryLabel: 'Reports',
    secondaryNavigationLabel: 'Workspace reports',
    openWorkspaceAriaLabel: 'Open full Workspace',
    openWorkspaceLabel: 'Open full Workspace',
    openWorkspaceMobileLabel: 'Full Workspace',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  openWorkspace: [event: MouseEvent]
}>()

const selectedItem = computed(
  () =>
    [...props.items, ...props.secondaryItems].find(
      item => item.id === props.modelValue
    )
    ?? props.items[0]
    ?? props.secondaryItems[0]
    ?? null
)

</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-workspace-preview__layout {
  display: grid;
  min-height: calc(var(--spacing) * 128);
  grid-template-columns: calc(var(--spacing) * 14) minmax(0, 1fr);
}
</style>
