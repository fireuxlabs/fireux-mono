<!-- Workspace Entity canon: one active Entity drives the Workspace context. -->
<template>
  <section class="workspace-active-entity">
    <div v-if="sparse" class="workspace-active-entity__manifest">
      <UAvatar
        v-if="entity?.imageUrl"
        :src="entity.imageUrl"
        :alt="entity.imageAlt || entity.title"
        size="md"
      />
      <div v-if="displayTitle || displayDescription">
        <p v-if="displayTitle" class="workspace-active-entity__title">
          {{ displayTitle }}
        </p>
        <p
          v-if="displayDescription"
          class="workspace-active-entity__description"
        >
          {{ displayDescription }}
        </p>
      </div>
    </div>

    <UCard
      v-else-if="activeId"
      variant="subtle"
      class="workspace-active-entity__surface"
    >
      <div class="workspace-active-entity__layout">
        <div class="workspace-active-entity__identity">
          <div v-if="$slots.active" class="workspace-active-entity__legacy">
            <slot
              name="active"
              :title="activeTitle"
              :description="activeDescription"
            />
          </div>

          <template v-else>
            <slot
              v-if="!sparse || entity?.imageUrl || entity?.icon"
              name="leading"
              :entity="entity"
              :outcome="outcome"
            >
              <UAvatar
                v-if="entity?.imageUrl"
                :src="entity.imageUrl"
                :alt="entity.imageAlt || entity.title"
                size="md"
                class="workspace-active-entity__avatar"
                :class="{
                  'workspace-active-entity__avatar--contain':
                    entity.imageFit === 'contain',
                }"
                :style="mediaStyle"
              />

              <span
                v-else
                class="workspace-active-entity__icon"
                :class="{
                  'workspace-active-entity__icon--error': outcome === 'error',
                }"
                aria-hidden="true"
              >
                <UIcon
                  :name="
                    outcome === 'pending'
                      ? 'i-lucide-loader-circle'
                      : outcome === 'error'
                        ? 'i-lucide-triangle-alert'
                        : entity?.icon || icon
                  "
                  :class="{
                    'workspace-active-entity__spinner': outcome === 'pending',
                  }"
                />
              </span>
            </slot>

            <div class="workspace-active-entity__copy">
              <div
                v-if="!sparse || outcome !== 'ready'"
                class="workspace-active-entity__eyebrow"
              >
                <span>{{ activeTitle }}</span>
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

              <p v-if="displayTitle" class="workspace-active-entity__title">
                {{ displayTitle }}
              </p>
              <p
                v-if="displayDescription"
                class="workspace-active-entity__description"
              >
                {{ displayDescription }}
              </p>

              <div
                v-if="$slots.meta || entity?.badges?.length"
                class="workspace-active-entity__meta"
              >
                <slot name="meta" :entity="entity" :outcome="outcome" />

                <UBadge
                  v-for="badge in entity?.badges ?? []"
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

        <div
          v-if="$slots.actions || changeable"
          class="workspace-active-entity__actions"
        >
          <slot name="actions" :entity="entity" :outcome="outcome" />

          <UButton
            v-if="changeable"
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
import type { WorkspaceEntityOutcome } from '../../composables/fireux/workspace/workspace-outcome'
import type { WorkspaceEntityCard } from './types'

const props = withDefaults(
  defineProps<{
    label: string
    activeId?: string
    description?: string
    entity?: WorkspaceEntityCard | null
    outcome?: WorkspaceEntityOutcome
    icon?: string
    clearLabel?: string
    changeable?: boolean
    emptyTitle?: string
    emptyDescription?: string
    sparse?: boolean
  }>(),
  {
    activeId: '',
    description: '',
    entity: null,
    outcome: 'ready',
    icon: 'i-lucide-layout-dashboard',
    clearLabel: 'Change',
    changeable: true,
    emptyTitle: '',
    emptyDescription: '',
    sparse: false,
  }
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const label = computed(() => String(props.label ?? '').trim() || 'Entity')
const activeId = computed(() => String(props.activeId ?? '').trim())
const activeDescription = computed(
  () => String(props.description ?? '').trim() || activeId.value
)
const activeTitle = computed(() => `Active ${label.value}`)
const displayTitle = computed(() => {
  const entityTitle = String(props.entity?.title ?? '').trim()
  if (entityTitle) return entityTitle

  if (props.sparse) return ''

  const description = String(props.description ?? '').trim()
  if (description) return description

  if (props.outcome === 'pending') return `Loading ${label.value}`
  if (props.outcome === 'error') return `${label.value} unavailable`
  return activeId.value
})
const displayDescription = computed(() => {
  const entityDescription = String(
    props.entity?.subtitle || props.entity?.meta || ''
  ).trim()
  if (entityDescription) return entityDescription

  if (props.sparse) return ''

  if (props.outcome === 'pending') {
    return `Restoring the active ${label.value.toLowerCase()}.`
  }
  if (props.outcome === 'error') {
    return `The active ${label.value.toLowerCase()} could not be loaded.`
  }
  return displayTitle.value === activeId.value ? '' : activeId.value
})
const emptyTitle = computed(() => props.emptyTitle || `Choose a ${label.value}`)
const emptyDescription = computed(
  () =>
    props.emptyDescription ||
    `Select the ${label.value.toLowerCase()} workspace you want to open.`
)
const mediaStyle = computed<CSSProperties | undefined>(() =>
  props.entity?.imageBackground
    ? { backgroundColor: props.entity.imageBackground }
    : undefined
)
</script>

<style scoped>
.workspace-active-entity {
  min-width: 0;
}

.workspace-active-entity__manifest {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}

.workspace-active-entity__surface {
  overflow: hidden;
  border-color: color-mix(in srgb, var(--ui-primary) 16%, var(--ui-border));
  background:
    radial-gradient(
      circle at 0 0,
      color-mix(in srgb, var(--ui-primary) 10%, transparent),
      transparent 42%
    ),
    color-mix(in srgb, var(--ui-bg-elevated) 96%, var(--ui-primary));
  box-shadow: 0 1rem 3rem
    color-mix(in srgb, var(--ui-bg-inverted) 7%, transparent);
}

.workspace-active-entity__layout {
  display: grid;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
}

.workspace-active-entity__identity {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}

.workspace-active-entity__legacy {
  width: 100%;
  min-width: 0;
}

.workspace-active-entity__avatar,
.workspace-active-entity__icon {
  width: calc(var(--spacing) * 13);
  height: calc(var(--spacing) * 13);
  flex: 0 0 auto;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
}

.workspace-active-entity__avatar--contain :deep(img) {
  object-fit: contain;
  padding: calc(var(--spacing) * 1.5);
}

.workspace-active-entity__icon {
  display: grid;
  place-items: center;
  color: var(--ui-primary);
}

.workspace-active-entity__icon--error {
  color: var(--ui-error);
}

.workspace-active-entity__icon :deep(svg) {
  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);
}

.workspace-active-entity__spinner {
  animation: workspace-active-entity-spin 1s linear infinite;
}

.workspace-active-entity__copy {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
}

.workspace-active-entity__eyebrow,
.workspace-active-entity__meta,
.workspace-active-entity__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.workspace-active-entity__eyebrow {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.workspace-active-entity__title,
.workspace-active-entity__description {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-active-entity__title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.workspace-active-entity__description {
  color: var(--ui-text-toned);
  font-size: var(--text-xs);
}

.workspace-active-entity__actions {
  justify-content: flex-end;
}

@keyframes workspace-active-entity-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 640px) {
  .workspace-active-entity__layout {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .workspace-active-entity__spinner {
    animation: none;
  }
}
</style>
