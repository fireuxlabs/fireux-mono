<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: centralize selected-target chrome and clear behavior. -->
<template>
  <section class="console-selected-target">
    <UCard
      v-if="selectedId"
      variant="subtle"
      class="console-selected-target__surface"
    >
      <div class="console-selected-target__layout">
        <div class="console-selected-target__identity">
          <div
            v-if="$slots.selected"
            class="console-selected-target__legacy"
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
                class="console-selected-target__avatar"
                :class="{
                  'console-selected-target__avatar--contain':
                    target.imageFit === 'contain',
                }"
                :style="mediaStyle"
              />

              <span
                v-else
                class="console-selected-target__icon"
                :class="{
                  'console-selected-target__icon--error': outcome === 'error',
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
                    'console-selected-target__spinner': outcome === 'pending',
                  }"
                />
              </span>
            </slot>

            <div class="console-selected-target__copy">
              <div class="console-selected-target__eyebrow">
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

              <p class="console-selected-target__title">
                {{ displayTitle }}
              </p>
              <p
                v-if="displayDescription"
                class="console-selected-target__description"
              >
                {{ displayDescription }}
              </p>

              <div
                v-if="$slots.meta || target?.badges?.length"
                class="console-selected-target__meta"
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

        <div class="console-selected-target__actions">
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
import type { ConsoleTargetOutcome } from '../../composables/fireux/app/console/useConsoleIndex'
import type { ConsoleTargetCard } from './types'

const props = withDefaults(
  defineProps<{
    label: string
    selectedId?: string
    description?: string
    target?: ConsoleTargetCard | null
    outcome?: ConsoleTargetOutcome
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
.console-selected-target {
  min-width: 0;
}

.console-selected-target__layout {
  display: grid;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
}

.console-selected-target__identity {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}

.console-selected-target__legacy {
  width: 100%;
  min-width: 0;
}

.console-selected-target__avatar,
.console-selected-target__icon {
  width: calc(var(--spacing) * 13);
  height: calc(var(--spacing) * 13);
  flex: 0 0 auto;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
}

.console-selected-target__avatar--contain :deep(img) {
  object-fit: contain;
  padding: calc(var(--spacing) * 1.5);
}

.console-selected-target__icon {
  display: grid;
  place-items: center;
  color: var(--ui-primary);
}

.console-selected-target__icon--error {
  color: var(--ui-error);
}

.console-selected-target__icon :deep(svg) {
  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);
}

.console-selected-target__spinner {
  animation: console-selected-target-spin 1s linear infinite;
}

.console-selected-target__copy {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
}

.console-selected-target__eyebrow,
.console-selected-target__meta,
.console-selected-target__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.console-selected-target__eyebrow {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.console-selected-target__title,
.console-selected-target__description {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-selected-target__title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.console-selected-target__description {
  color: var(--ui-text-toned);
  font-size: var(--text-xs);
}

.console-selected-target__actions {
  justify-content: flex-end;
}

@keyframes console-selected-target-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 640px) {
  .console-selected-target__layout {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .console-selected-target__spinner {
    animation: none;
  }
}
</style>
