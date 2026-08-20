<template>
  <MoleculesActionSurface
    :to="targetTo"
    :action="action && !targetTo"
    :disabled="disabled"
    class="fx-card--cell workspace-target-card"
    :class="{ 'workspace-target-card--interactive': isInteractive }"
    :data-selected="selected || undefined"
    :aria-pressed="action ? selected : undefined"
    :aria-current="!action && targetTo && selected ? 'page' : undefined"
    @activate="emit('action')"
  >
    <slot name="leading" :card="card">
      <UAvatar
        :src="card.imageUrl || undefined"
        :alt="card.imageAlt || card.title"
        :text="card.imageUrl ? undefined : initials"
        :icon="card.imageUrl || initials ? undefined : card.icon || 'i-lucide-layout-grid'"
        size="md"
        class="workspace-target-card__avatar"
        :class="{
          'workspace-target-card__avatar--contain': card.imageFit === 'contain',
        }"
        :style="mediaStyle"
      />
    </slot>

    <div class="workspace-target-card__content">
      <p class="workspace-target-card__title">
        {{ card.title }}
      </p>

      <slot name="meta" :card="card">
        <p
          v-if="showSubtitle && card.subtitle"
          class="workspace-target-card__subtitle"
        >
          {{ card.subtitle }}
        </p>

        <p v-if="showMeta && card.meta" class="workspace-target-card__meta">
          {{ card.meta }}
        </p>
      </slot>

      <div
        v-if="showBadges && card.badges?.length"
        class="workspace-target-card__badges"
      >
        <UBadge
          v-for="badge in card.badges"
          :key="badge"
          variant="soft"
          color="neutral"
          size="xs"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>

    <slot
      v-if="isInteractive"
      name="trailing"
      :card="card"
      :selected="selected"
    >
      <span class="workspace-target-card__indicator" aria-hidden="true">
        <UIcon
          :name="selected ? 'i-lucide-check' : 'i-lucide-chevron-right'"
        />
      </span>
    </slot>
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { WorkspaceTargetCard } from './types'

const props = withDefaults(
  defineProps<{
    card: WorkspaceTargetCard
    action?: boolean
    disabled?: boolean
    selected?: boolean
    showBadges?: boolean
    showMeta?: boolean
    showSubtitle?: boolean
  }>(),
  {
    action: false,
    disabled: false,
    selected: false,
    showBadges: true,
    showMeta: true,
    showSubtitle: true,
  }
)

const emit = defineEmits<{
  (event: 'action'): void
}>()

const targetTo = computed(() =>
  props.action ? undefined : props.card.to || undefined
)
const isInteractive = computed(
  () => !props.disabled && Boolean(props.action || targetTo.value)
)
const initials = computed(() =>
  String(props.card.title || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
)
const mediaStyle = computed<CSSProperties | undefined>(() =>
  props.card.imageBackground
    ? { backgroundColor: props.card.imageBackground }
    : undefined
)
</script>

<style scoped>
.workspace-target-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  width: 100%;
  min-width: 0;
  min-height: calc(var(--spacing) * 16);
  padding: calc(var(--spacing) * 3);
  color: var(--ui-text);
  text-align: left;
}

.workspace-target-card--interactive {
  cursor: pointer;
}

.workspace-target-card[data-selected='true'] {
  border-color: var(--ui-border-accented);
  background: var(--ui-bg-accented);
}

.workspace-target-card__avatar {
  width: calc(var(--spacing) * 12);
  height: calc(var(--spacing) * 12);
  flex: 0 0 auto;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
}

.workspace-target-card__avatar--contain :deep(img) {
  object-fit: contain;
  padding: calc(var(--spacing) * 1.5);
}

.workspace-target-card__content {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
}

.workspace-target-card__title,
.workspace-target-card__subtitle,
.workspace-target-card__meta {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-target-card__title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.workspace-target-card__subtitle {
  color: var(--ui-text-toned);
  font-size: var(--text-xs);
}

.workspace-target-card__meta {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.workspace-target-card__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing);
  padding-top: var(--spacing);
}

.workspace-target-card__indicator {
  display: grid;
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  place-items: center;
  border: 1px solid var(--ui-border);
  border-radius: 50%;
  background: var(--ui-bg-elevated);
  color: var(--ui-text-muted);
  transition:
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.workspace-target-card--interactive:hover .workspace-target-card__indicator {
  border-color: var(--ui-border-accented);
  color: var(--ui-primary);
  transform: translateX(var(--spacing));
}

.workspace-target-card[data-selected='true'] .workspace-target-card__indicator {
  border-color: color-mix(in srgb, var(--ui-primary) 48%, var(--ui-border));
  color: var(--ui-primary);
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .workspace-target-card__indicator {
    transition: none;
  }

  .workspace-target-card--interactive:hover .workspace-target-card__indicator {
    transform: none;
  }
}
</style>
