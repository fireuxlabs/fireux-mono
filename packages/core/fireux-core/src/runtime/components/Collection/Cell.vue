<template>
  <UPageCard
    v-if="!cell.imageStyle"
    :title="cell.title"
    :description="cell.description || undefined"
    :to="cell.to"
  >
    <template v-if="cell.image" #leading>
      <UAvatar :src="cell.image" :alt="cell.title" size="xl" />
    </template>

    <template v-if="cell.meta || cell.badges?.length" #footer>
      <div class="flex flex-wrap items-center gap-2">
        <span v-if="cell.meta" class="text-sm text-muted">{{ cell.meta }}</span>
        <UBadge
          v-for="badge in cell.badges"
          :key="badge"
          color="neutral"
          variant="subtle"
        >
          {{ badge }}
        </UBadge>
      </div>
    </template>
  </UPageCard>

  <UCard v-else class="collection-cell" :ui="cardUi">
    <NuxtLink :to="cell.to" class="collection-cell__link">
      <div v-if="cell.imageStyle === 'cover'" class="collection-cell__cover">
        <img
          v-if="cell.image"
          :src="cell.image"
          :alt="cell.title"
          loading="lazy"
          class="collection-cell__cover-image"
        />
        <div v-else class="collection-cell__cover-fallback">
          <UIcon
            :name="cell.fallbackIcon || 'i-lucide-image'"
            class="size-12"
          />
        </div>
      </div>

      <div class="collection-cell__body">
        <div class="collection-cell__identity">
          <UAvatar
            v-if="cell.imageStyle === 'avatar'"
            :src="cell.image || undefined"
            :alt="cell.title"
            :text="cell.imageText"
            size="3xl"
            class="collection-cell__avatar"
          />

          <div class="min-w-0">
            <h3 class="collection-cell__title">{{ cell.title }}</h3>
            <p v-if="cell.meta" class="collection-cell__meta">
              <UIcon
                v-if="cell.imageStyle === 'cover'"
                name="i-lucide-map-pin"
                class="size-4 shrink-0"
              />
              {{ cell.meta }}
            </p>
          </div>
        </div>

        <p v-if="cell.description" class="collection-cell__description">
          {{ cell.description }}
        </p>

        <div
          v-if="cell.badges?.length || cell.actionLabel"
          class="collection-cell__footer"
        >
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="badge in cell.badges"
              :key="badge"
              color="neutral"
              variant="subtle"
            >
              {{ badge }}
            </UBadge>
          </div>

          <span v-if="cell.actionLabel" class="collection-cell__action">
            {{ cell.actionLabel }}
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </span>
        </div>
      </div>
    </NuxtLink>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CollectionCellData } from '../../models/utils/collection-cell'

const props = defineProps<{ cell: CollectionCellData }>()
const cardUi = computed(() =>
  props.cell.imageStyle === 'cover' ? { body: 'p-0 sm:p-0' } : undefined
)
</script>

<style scoped>
.collection-cell {
  height: 100%;
  overflow: hidden;
  transition:
    border-color 160ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.collection-cell:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 35%, var(--ui-border));
  box-shadow: var(--ui-shadow-lg);
  transform: translateY(-2px);
}

.collection-cell__link {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.collection-cell__cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: var(--ui-bg-muted);
}

.collection-cell__cover-image,
.collection-cell__cover-fallback {
  width: 100%;
  height: 100%;
}

.collection-cell__cover-image {
  object-fit: cover;
  transition: transform 300ms ease;
}

.collection-cell:hover .collection-cell__cover-image {
  transform: scale(1.025);
}

.collection-cell__cover-fallback {
  display: grid;
  place-items: center;
  color: var(--ui-text-dimmed);
  background:
    radial-gradient(
      circle at 20% 20%,
      color-mix(in srgb, var(--ui-primary) 20%, transparent),
      transparent 45%
    ),
    var(--ui-bg-muted);
}

.collection-cell__body {
  display: flex;
  min-height: 15rem;
  flex: 1;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5);
}

.collection-cell__identity {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 4);
}

.collection-cell__avatar {
  flex: none;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg-muted);
}

.collection-cell__title {
  overflow: hidden;
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-cell__meta {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 1.5);
  margin-top: calc(var(--spacing) * 1);
  overflow: hidden;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-cell__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.collection-cell__footer {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  margin-top: auto;
}

.collection-cell__action {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: calc(var(--spacing) * 1);
  color: var(--ui-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}
</style>
