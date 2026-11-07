<template>
  <UCard as="section" :aria-label="label">
    <div class="landing-workspace-preview__layout">
      <aside>
        <div>
          <slot name="target" />
        </div>

        <nav :aria-label="navigationLabel">
          <UButton
            v-for="item in items"
            :key="item.id"
            type="button"
            :icon="item.icon"
            color="neutral"
            :variant="item.id === modelValue ? 'soft' : 'ghost'"
            :aria-label="item.title"
            :aria-current="item.id === modelValue ? 'page' : undefined"
            :title="item.title"
            @click="emit('update:modelValue', item.id)"
          >
          </UButton>
        </nav>

        <nav
          v-if="secondaryItems.length"
          :aria-label="secondaryNavigationLabel"
        >
          <p>
            {{ secondaryLabel }}
          </p>
          <UButton
            v-for="item in secondaryItems"
            :key="item.id"
            type="button"
            :icon="item.icon"
            color="neutral"
            :variant="item.id === modelValue ? 'soft' : 'ghost'"
            :aria-label="item.title"
            :aria-current="item.id === modelValue ? 'page' : undefined"
            :title="item.title"
            @click="emit('update:modelValue', item.id)"
          >
          </UButton>
        </nav>
      </aside>

      <div v-if="selectedItem">
        <header>
          <p>
            {{ selectedItem.title }}
          </p>
          <UButton
            :to="workspaceTo"
            color="neutral"
            variant="soft"
            size="xs"
            trailing-icon="i-lucide-arrow-up-right"
            :aria-label="openWorkspaceAriaLabel"
            @click="emit('openWorkspace', $event)"
          >
            {{ openWorkspaceLabel }}
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
      (item) => item.id === props.modelValue
    ) ??
    props.items[0] ??
    props.secondaryItems[0] ??
    null
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
