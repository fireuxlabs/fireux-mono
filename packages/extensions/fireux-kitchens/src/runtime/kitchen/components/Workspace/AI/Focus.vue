<template>
  <section
    class="kitchen-ai-focus"
    :aria-label="`KitchenAI · ${label}`"
    :data-kitchen-ai-focus="focus"
  >
    <header class="kitchen-ai-focus__header">
      <div class="kitchen-ai-focus__identity">
        <UIcon name="i-lucide-sparkles" />
        <h2>
          KitchenAI <span class="kitchen-ai-focus__label">· {{ label }}</span>
        </h2>
        <UBadge v-if="!connected" color="neutral" variant="soft"
          >Coming soon</UBadge
        >
      </div>
      <UButton
        label="Context"
        icon="i-lucide-file-text"
        color="neutral"
        variant="ghost"
        size="sm"
        :aria-label="`KitchenAI context for ${label}`"
        @click="contextOpen = true"
      />
    </header>
    <slot v-if="connected" />
    <template v-else>
      <p class="kitchen-ai-focus__note">
        KitchenAI for {{ label }} is not connected yet.
      </p>
      <WorkspaceAIComposer
        v-if="spacious"
        model-value=""
        spacious
        disabled
        :can-submit="false"
        :placeholder="`Ask KitchenAI about ${label.toLowerCase()}…`"
        :aria-label="`Ask KitchenAI about ${label}`"
      />
      <WorkspaceAICompactComposer
        v-else
        model-value=""
        disabled
        :can-submit="false"
        :placeholder="`Ask KitchenAI about ${label.toLowerCase()}…`"
        :aria-label="`Ask KitchenAI about ${label}`"
      />
    </template>
    <UModal v-model:open="contextOpen" :title="`KitchenAI context · ${label}`">
      <template #body>
        <div class="fx-card-body-stack">
          <p>
            Choose common guidance and add your Kitchen and venue details in
            Kitchen context. Only this Kitchen’s selected guides and own context
            are supplied to connected workflows.
          </p>
          <UButton
            to="/workspace/kitchen/identity/context"
            label="Open Kitchen and venue context"
            icon="i-lucide-file-text"
            color="neutral"
            variant="soft"
            @click="contextOpen = false"
          />
          <UAlert
            v-if="contextLabel"
            :title="`${contextLabel} context`"
            description="Area-specific saved context is not connected yet."
            color="neutral"
            variant="soft"
          />
          <p>
            Selected records, current page facts and the task brief are supplied
            by each connected workflow. Example information must be labelled and
            confirmed before use.
          </p>
        </div>
      </template>
    </UModal>
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
const props = withDefaults(
  defineProps<{
    focus: string
    label: string
    contextLabel?: string
    connected?: boolean
    spacious?: boolean
  }>(),
  { contextLabel: '', connected: false, spacious: false }
)
const contextOpen = ref(false)
const route = useRoute()
watch(
  () => [props.focus, route.fullPath],
  () => {
    contextOpen.value = false
  },
  { flush: 'sync' }
)
</script>
<style scoped>
.kitchen-ai-focus {
  display: grid;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
  margin-block: calc(var(--spacing) * 4);
}
.kitchen-ai-focus__header,
.kitchen-ai-focus__identity {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
.kitchen-ai-focus__header {
  justify-content: space-between;
}
.kitchen-ai-focus__identity h2 {
  font-size: var(--text-base);
  font-weight: 600;
}
.kitchen-ai-focus__label,
.kitchen-ai-focus__note {
  color: var(--ui-text-muted);
}
</style>
