<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: centralize selected-target chrome and clear behavior. -->
<template>
  <section class="workspace-selected-target">
    <UCard
      v-if="selectedId"
      variant="subtle"
      class="workspace-selected-target__surface"
    >
      <div class="workspace-selected-target__layout">
        <div class="workspace-selected-target__identity">
          <div
            v-if="$slots.selected"
            class="workspace-selected-target__legacy"
          >
            <slot
              name="selected"
              :title="selectedTitle"
              :description="selectedDescription"
            />
          </div>

          <template v-else>
            <slot
              name="leading"
              :target="target"
              :outcome="outcome"
            >
              <UAvatar
                v-if="target?.imageUrl"
                :src="target.imageUrl"
                :alt="target.imageAlt || target.title"
                size="md"
                class="workspace-selected-target__avatar"
                :class="{
                  'workspace-selected-target__avatar--contain':
                    target.imageFit === 'contain',
                }"
                :style="mediaStyle"
              />

              <span
                v-else
                class="workspace-selected-target__icon"
                :class="{
                  'workspace-selected-target__icon--error': outcome === 'error',
                }"
                aria-hidden="true"
              >
                <UIcon
                  :name="
                    outcome === 'pending'
                      ? 'i-lucide-loader-circle'
                      : outcome === 'error'
                        ? 'i-lucide-triangle-alert'
                        : target?.icon || icon
                  "
                  :class="{
                    'workspace-selected-target__spinner': outcome === 'pending',
                  }"
                />
              </span>
            </slot>

            <div class="workspace-selected-target__copy">
              <div class="workspace-selected-target__eyebrow">
                <span>{{ selectedTitle }}</span>
                <UBadge
                  v-if="outcome === 'pending'"
                  color="neutral"
                  variant="soft"
                  size="xs"
                >
                  Loading
                </UBadge>
                <UBadge
                  v-else-if="outcome === 'error'"
                  color="error"
                  variant="soft"
                  size="xs"
                >
                  Unavailable
                </UBadge>
              </div>

              <p class="workspace-selected-target__title">
                {{ displayTitle }}
              </p>
              <p
                v-if="displayDescription"
                class="workspace-selected-target__description"
              >
                {{ displayDescription }}
              </p>

              <div
                v-if="$slots.meta || target?.badges?.length"
                class="workspace-selected-target__meta"
              >
                <slot
                  name="meta"
                  :target="target"
                  :outcome="outcome"
                />

                <UBadge
                  v-for="badge in target?.badges ?? []"
                  :key="badge"
                  color="neutral"
                  variant="soft"
                  size="xs"
                >
                  {{ badge }}
                </UBadge>
              </div>
            </div>
          </template>
        </div>

        <div class="workspace-selected-target__actions">
          <slot
            name="actions"
            :target="target"
            :outcome="outcome"
          />

          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-repeat-2"
            @click="emit('clear')"
          >
            {{ clearLabel }}
          </UButton>
        </div>
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      :icon="icon"
      :title="emptyTitle"
      :description="emptyDescription"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { WorkspaceTargetOutcome } from '../../composables/fireux/workspace/useWorkspaceIndex'
import type { WorkspaceTargetCard } from './types'

const props = withDefaults(
  defineProps<{
    label: string
    selectedId?: string
    description?: string
    target?: WorkspaceTargetCard | null
    outcome?: WorkspaceTargetOutcome
    icon?: string
    clearLabel?: string
  }>(),
  {
    selectedId: '',
    description: '',
    target: null,
    outcome: 'ready',
    icon: 'i-lucide-layout-dashboard',
    clearLabel: 'Change',
  }
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const label = computed(() => String(props.label ?? '').trim() || 'Target')
const selectedId = computed(() => String(props.selectedId ?? '').trim())
const selectedDescription = computed(
  () => String(props.description ?? '').trim() || selectedId.value
)
const selectedTitle = computed(() => `Selected ${label.value}`)
const displayTitle = computed(() => {
  const targetTitle = String(props.target?.title ?? '').trim()
  if (targetTitle) return targetTitle

  const description = String(props.description ?? '').trim()
  if (description) return description

  if (props.outcome === 'pending') return `Loading ${label.value}`
  if (props.outcome === 'error') return `${label.value} unavailable`
  return selectedId.value
})
const displayDescription = computed(() => {
  const targetDescription = String(
    props.target?.subtitle || props.target?.meta || ''
  ).trim()
  if (targetDescription) return targetDescription

  if (props.outcome === 'pending') {
    return `Restoring the selected ${label.value.toLowerCase()}.`
  }
  if (props.outcome === 'error') {
    return `The selected ${label.value.toLowerCase()} could not be loaded.`
  }
  return displayTitle.value === selectedId.value ? '' : selectedId.value
})
const emptyTitle = computed(() => `Choose a ${label.value}`)
const emptyDescription = computed(
  () =>
    `Select the ${label.value.toLowerCase()} workspace you want to open.`
)
const mediaStyle = computed<CSSProperties | undefined>(() =>
  props.target?.imageBackground
    ? { backgroundColor: props.target.imageBackground }
    : undefined
)
</script>

<style scoped>
.workspace-selected-target {
  min-width: 0;
}

.workspace-selected-target__layout {
  display: grid;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
}

.workspace-selected-target__identity {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}

.workspace-selected-target__legacy {
  width: 100%;
  min-width: 0;
}

.workspace-selected-target__avatar,
.workspace-selected-target__icon {
  width: calc(var(--spacing) * 13);
  height: calc(var(--spacing) * 13);
  flex: 0 0 auto;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
}

.workspace-selected-target__avatar--contain :deep(img) {
  object-fit: contain;
  padding: calc(var(--spacing) * 1.5);
}

.workspace-selected-target__icon {
  display: grid;
  place-items: center;
  color: var(--ui-primary);
}

.workspace-selected-target__icon--error {
  color: var(--ui-error);
}

.workspace-selected-target__icon :deep(svg) {
  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);
}

.workspace-selected-target__spinner {
  animation: workspace-selected-target-spin 1s linear infinite;
}

.workspace-selected-target__copy {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
}

.workspace-selected-target__eyebrow,
.workspace-selected-target__meta,
.workspace-selected-target__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.workspace-selected-target__eyebrow {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.workspace-selected-target__title,
.workspace-selected-target__description {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-selected-target__title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.workspace-selected-target__description {
  color: var(--ui-text-toned);
  font-size: var(--text-xs);
}

.workspace-selected-target__actions {
  justify-content: flex-end;
}

@keyframes workspace-selected-target-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 640px) {
  .workspace-selected-target__layout {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .workspace-selected-target__spinner {
    animation: none;
  }
}
</style>
