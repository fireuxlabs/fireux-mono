<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: replace the Kitchen-only preview fork with shared selected-target chrome. -->
<template>
  <WorkspaceSelectedTarget
    label="Kitchen"
    :selected-id="kitchenId"
    :description="kitchenName"
    :target="targetCard"
    :outcome="outcome"
    icon="i-lucide-chef-hat"
    empty-title="Start building your Kitchen"
    empty-description="Ask KitchenAI a question or explore a demo. Your Kitchen can take shape as you use its tools."
    class="kitchen-home-target"
    :class="{ 'kitchen-home-target--fixed': source === 'live' }"
    @clear="emit('clear')"
  >
    <template #selected>
      <div class="kitchen-home-target__layout">
        <div class="kitchen-home-target__visual">
          <span class="kitchen-home-target__glow" aria-hidden="true" />
          <UAvatar
            v-if="targetCard?.imageUrl"
            :src="targetCard.imageUrl"
            :alt="targetCard.imageAlt || targetCard.title"
            size="xl"
            class="kitchen-home-target__avatar"
            :style="mediaStyle"
          />

          <span v-else class="kitchen-home-target__icon" aria-hidden="true">
            <UIcon
              :name="
                outcome === 'pending'
                  ? 'i-lucide-loader-circle'
                  : outcome === 'error'
                    ? 'i-lucide-triangle-alert'
                    : 'i-lucide-chef-hat'
              "
              :class="{ 'animate-spin': outcome === 'pending' }"
            />
          </span>
        </div>

        <div class="kitchen-home-target__copy">
          <div class="kitchen-home-target__eyebrow">
            <span>Current Kitchen</span>
          </div>

          <h2>{{ displayName }}</h2>
          <p v-if="targetCard?.subtitle" class="kitchen-home-target__address">
            {{ targetCard.subtitle }}
          </p>
        </div>
      </div>
    </template>
  </WorkspaceSelectedTarget>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import type { WorkspaceTargetCard } from 'fireux-core/runtime/components/Workspace/types'
import type { KitchenFetchSource } from '../../../composables/firestore/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../composables/firestore/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../composables/firestore/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    kitchen?: KitchenSurface | null
    kitchenId?: string
    source?: KitchenFetchSource
    outcome?: WorkspaceTargetOutcome
  }>(),
  {
    kitchen: null,
    kitchenId: '',
    source: 'live',
    outcome: 'ready',
  }
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const kitchenName = computed(() =>
  String(props.kitchen?.name || props.kitchen?.slug || '').trim()
)
const { workspaceTarget } = useKitchenInterface()
const kitchenCard = computed(() => workspaceTarget(props.kitchen))
const targetCard = computed<WorkspaceTargetCard | null>(() => {
  const card = kitchenCard.value
  if (!card) return null

  return {
    id: card.id,
    title: card.name,
    subtitle: card.shortAddress,
    imageUrl: card.imageUrl,
    imageAlt: `${card.name} logo`,
    imageFit: 'contain',
    imageBackground: card.mediaBackdropColor,
    icon: 'i-lucide-chef-hat',
    badges: [props.source === 'demo' ? 'Demo · Read-only' : 'Live'],
  }
})
const displayName = computed(() => {
  if (props.outcome === 'pending') return 'Loading Kitchen'
  if (props.outcome === 'error')
    return kitchenName.value || 'Kitchen unavailable'
  return targetCard.value?.title || kitchenName.value || props.kitchenId
})
const mediaStyle = computed<CSSProperties | undefined>(() =>
  targetCard.value?.imageBackground
    ? { backgroundColor: targetCard.value.imageBackground }
    : undefined
)
</script>

<style scoped>
.kitchen-home-target {
  min-width: 0;
}

.kitchen-home-target--fixed :deep(.workspace-selected-target__actions) {
  display: none;
}

.kitchen-home-target__layout {
  position: relative;
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  align-items: center;
  gap: calc(var(--spacing) * 7);
  min-height: 9rem;
  overflow: hidden;
  padding: calc(var(--spacing) * 6);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  background:
    radial-gradient(circle at 8% 20%, color-mix(in srgb, var(--ui-primary) 16%, transparent), transparent 30%),
    linear-gradient(135deg, color-mix(in srgb, var(--ui-bg-elevated) 94%, var(--ui-primary)), var(--ui-bg));
}

.kitchen-home-target__visual {
  position: relative;
  display: grid;
  width: 7rem;
  height: 7rem;
  place-items: center;
}

.kitchen-home-target__glow {
  position: absolute;
  inset: 10%;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 30%, transparent);
  filter: blur(1.5rem);
  opacity: 0.75;
}

.kitchen-home-target__avatar,
.kitchen-home-target__icon {
  position: relative;
  width: 5.5rem;
  height: 5.5rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 35%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-bg-elevated) 88%, var(--ui-primary));
  box-shadow: 0 1rem 2rem color-mix(in srgb, var(--ui-primary) 12%, transparent);
}

.kitchen-home-target__avatar :deep(img) {
  object-fit: contain;
  padding: calc(var(--spacing) * 2);
}

.kitchen-home-target__icon {
  display: grid;
  place-items: center;
  color: var(--ui-primary);
}

.kitchen-home-target__icon :deep(svg) {
  width: calc(var(--spacing) * 7);
  height: calc(var(--spacing) * 7);
}

.kitchen-home-target__copy {
  display: grid;
  gap: calc(var(--spacing) * 2);
  min-width: 0;
}

.kitchen-home-target__eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.kitchen-home-target h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.kitchen-home-target__address {
  margin: 0;
}

.kitchen-home-target__address {
  color: var(--ui-text-toned);
  font-size: var(--text-sm);
}

@media (max-width: 40rem) {
  .kitchen-home-target__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: calc(var(--spacing) * 4);
    padding: calc(var(--spacing) * 5);
  }

  .kitchen-home-target__visual {
    width: 5rem;
    height: 5rem;
  }

  .kitchen-home-target__avatar,
  .kitchen-home-target__icon {
    width: 4.5rem;
    height: 4.5rem;
  }
}
</style>
