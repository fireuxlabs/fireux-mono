<template>
  <section
    class="workspace-capability"
    :class="{
      'workspace-capability--connected': connected,
      'workspace-capability--single': singleOpen,
    }"
  >
    <div
      v-if="$slots['workspace-tools']"
      class="flex flex-wrap items-center gap-2"
    >
      <slot name="workspace-tools" />
    </div>
    <div class="workspace-capability__panels">
      <section
        ref="collectionPanel"
        class="workspace-capability__collection"
        :aria-label="collectionLabel"
        tabindex="-1"
      >
        <slot name="collection-panel">
          <header class="workspace-panel-header">
            <slot name="collection-heading"
              ><h2 class="fx-type-card-title">{{ collectionLabel }}</h2></slot
            >
            <div class="workspace-panel-actions">
              <slot name="collection-tools" />
            </div>
          </header>
          <slot name="collection" />
          <slot name="collection-open-tools" />
        </slot>
      </section>
      <section
        ref="singlePanel"
        tabindex="-1"
        class="workspace-capability__single"
        :aria-label="singleLabel"
      >
        <UButton
          v-if="connected"
          class="workspace-capability__back"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :label="`Back to ${collectionLabel}`"
          @click="singleOpen = false"
        />
        <slot name="single-panel">
          <header class="workspace-panel-header">
            <slot name="single-heading"
              ><h2 class="fx-type-card-title">{{ singleLabel }}</h2></slot
            >
            <div class="workspace-panel-actions">
              <slot name="single-tools" />
            </div>
          </header>
          <slot name="single" />
          <slot name="single-open-tools" />
        </slot>
      </section>
    </div>
    <slot name="workspace-open-tools" />
  </section>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
withDefaults(
  defineProps<{
    collectionLabel: string
    singleLabel?: string
    connected?: boolean
  }>(),
  {
    singleLabel: 'Details',
    connected: false,
  }
)
const singleOpen = defineModel<boolean>('singleOpen', { default: false })
const collectionPanel = ref<HTMLElement | null>(null)
const singlePanel = ref<HTMLElement | null>(null)
watch(singleOpen, async (open) => {
  await nextTick()
  const panel = open ? singlePanel.value : collectionPanel.value
  if (panel?.getClientRects().length) panel.focus({ preventScroll: true })
})
</script>

<style scoped>
.workspace-capability {
  display: grid;
  gap: calc(var(--spacing) * 5);
}
.workspace-capability__panels {
  display: grid;
  align-items: start;
  gap: calc(var(--spacing) * 5);
}
.workspace-capability__collection,
.workspace-capability__single {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
}
.workspace-capability__back {
  justify-self: start;
}
.workspace-capability--connected .workspace-capability__panels {
  gap: 0;
  border-top: 1px solid var(--ui-border);
  padding-top: calc(var(--spacing) * 6);
}
.workspace-capability--connected .workspace-capability__collection,
.workspace-capability--connected .workspace-capability__single {
  padding: calc(var(--spacing) * 2) 0;
}
.workspace-capability--connected .workspace-capability__collection {
  padding-inline-end: calc(var(--spacing) * 6);
}
@media (min-width: 48rem) {
  .workspace-capability__panels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .workspace-capability--connected .workspace-capability__panels {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    align-items: stretch;
  }
  .workspace-capability--connected .workspace-capability__single {
    border-left: 1px solid var(--ui-border);
    padding-inline-start: calc(var(--spacing) * 8);
    align-content: start;
  }
  .workspace-capability--connected .workspace-capability__collection {
    align-content: start;
  }
  .workspace-capability__back {
    display: none;
  }
}
@media (max-width: 47.999rem) {
  .workspace-capability--connected .workspace-capability__collection {
    padding-inline-end: 0;
  }
  .workspace-capability--connected:not(.workspace-capability--single)
    .workspace-capability__single,
  .workspace-capability--connected.workspace-capability--single
    .workspace-capability__collection {
    display: none;
  }
}
</style>
