<template>
  <UPageGrid
    as="ul"
    class="list-none kitchen-collection-list"
    aria-label="Kitchens"
  >
    <li v-for="cell in cells" :key="cell.to">
      <UPageCard
        class="kitchen-discovery-card"
        :title="cell.title"
        :to="cell.to"
        :ui="{
          root: 'ring-0 shadow-none bg-transparent',
          container: 'p-0 sm:p-0 gap-0',
          header: 'mb-0 w-full',
          body: 'p-0 w-full',
          footer: 'p-0 w-full',
        }"
      >
        <template #header>
          <div class="kitchen-discovery-card__media">
            <img
              v-if="cell.image"
              :src="cell.image"
              :alt="cell.title"
              loading="lazy"
              class="kitchen-discovery-card__image"
            />
            <div v-else class="kitchen-discovery-card__placeholder">
              <UIcon name="i-lucide-chef-hat" class="size-10" />
            </div>
          </div>
        </template>
        <template #body>
          <div class="kitchen-discovery-card__identity">
            <div
              class="kitchen-discovery-card__logo"
              :style="
                cell.logo && cell.backdrop
                  ? { backgroundColor: cell.backdrop }
                  : undefined
              "
            >
              <img
                v-if="cell.logo"
                :src="cell.logo"
                :alt="`${cell.title} logo`"
                loading="lazy"
              />
              <span v-else>{{ cell.logoText }}</span>
            </div>
            <div class="kitchen-discovery-card__heading">
              <h2>{{ cell.title }}</h2>
              <p v-if="cell.meta" class="kitchen-discovery-card__location">
                <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
                {{ cell.meta }}
              </p>
            </div>
            <span class="kitchen-discovery-card__open" aria-hidden="true">
              <UIcon name="i-lucide-arrow-up-right" class="size-5" />
            </span>
          </div>
        </template>
        <template #footer>
          <p
            v-if="cell.description"
            class="kitchen-discovery-card__description"
          >
            {{ cell.description }}
          </p>
        </template>
      </UPageCard>
    </li>
  </UPageGrid>
  <DevDebugPanel
    title="Kitchens collection surface"
    context="Passed Kitchen cards and their final shared cell projection."
    object-origin="passed"
    :objects="{ cards: props.cards }"
    :derived="{ cells }"
    launcher
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { KitchenCard } from '../../models/kitchen-interface.model'

const props = defineProps<{ cards: KitchenCard.Card[] }>()
const cells = computed<
  Array<
    CollectionCellData & { logo: string; logoText: string; backdrop?: string }
  >
>(() =>
  props.cards.map((card) => ({
    title: card.name,
    description: card.tagline,
    image: card.discoveryImageUrl,
    logo: card.logoImageUrl,
    backdrop: card.mediaBackdropColor,
    logoText: card.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
    imageStyle: 'cover',
    fallbackIcon: 'i-lucide-utensils',
    meta: card.shortAddress,
    badges: [...card.badges, ...card.categoryLabels],
    actionLabel: 'View menus',
    to: card.to ? `${card.to.replace(/\/$/, '')}/menus` : '',
  }))
)
</script>

<style scoped>
.kitchen-collection-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 8);
}
.kitchen-discovery-card {
  height: 100%;
  background: transparent;
  box-shadow: none;
  border: 0;
  border-radius: 0;
}
.kitchen-discovery-card__media {
  overflow: hidden;
  aspect-ratio: 16 / 11;
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
}
.kitchen-discovery-card__image,
.kitchen-discovery-card__placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.kitchen-discovery-card__image {
  transition: transform 450ms ease;
}
.kitchen-discovery-card:hover .kitchen-discovery-card__image {
  transform: scale(1.035);
}
.kitchen-discovery-card__placeholder {
  display: grid;
  place-items: center;
  color: var(--ui-text-dimmed);
}
.kitchen-discovery-card__identity {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 4);
  padding-top: calc(var(--spacing) * 5);
}
.kitchen-discovery-card__logo {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: calc(var(--spacing) * 14);
  height: calc(var(--spacing) * 14);
  padding: calc(var(--spacing) * 2);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
  color: var(--ui-text-muted);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
}
.kitchen-discovery-card__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.kitchen-discovery-card__heading {
  flex: 1;
  min-width: 0;
}
.kitchen-discovery-card__heading h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}
.kitchen-discovery-card__location {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 1.5);
  margin-top: calc(var(--spacing) * 1.5);
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.kitchen-discovery-card__open {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: calc(var(--spacing) * 10);
  height: calc(var(--spacing) * 10);
  border: 1px solid var(--ui-border-accented);
  border-radius: 50%;
  color: var(--ui-text-highlighted);
  transition:
    background 180ms ease,
    color 180ms ease;
}
.kitchen-discovery-card:hover .kitchen-discovery-card__open {
  background: var(--ui-primary);
  border-color: var(--ui-primary);
  color: var(--ui-bg);
}
.kitchen-discovery-card__description {
  margin: calc(var(--spacing) * 3) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}
@media (max-width: 48rem) {
  .kitchen-collection-list {
    grid-template-columns: minmax(0, 1fr);
  }
  .kitchen-discovery-card__media {
    aspect-ratio: 4 / 3;
  }
  .kitchen-discovery-card__heading h2 {
    font-size: var(--text-xl);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kitchen-discovery-card__image,
  .kitchen-discovery-card__open {
    transition: none;
  }
}
</style>
