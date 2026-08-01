<template>
  <section
    v-if="kitchens.length"
    class="place-operations"
    aria-labelledby="place-operations-title"
  >
    <div class="place-operations__heading">
      <div>
        <p class="fx-type-label">Food and drink</p>
        <h2 id="place-operations-title" class="fx-type-section-title">
          At {{ placeName }}
        </h2>
      </div>
      <UButton
        v-if="kitchens.length > 1"
        to="/kitchens"
        label="All kitchens"
        trailing-icon="i-lucide-arrow-right"
        color="neutral"
        variant="ghost"
        size="sm"
      />
    </div>

    <div class="place-operations__grid">
      <UCard
        v-for="entry in kitchens"
        :key="entry.kitchen.id"
        class="place-operations__card"
      >
        <KitchenCardsCell
          directory
          link
          :to="`/kitchens/${encodeURIComponent(entry.kitchen.slug)}`"
          :name="entry.kitchen.name"
          :short-address="entry.kitchen.short_address"
          :image-url="entry.kitchen.image_url"
          :image-kind="entry.kitchen.image_kind"
          :media-backdrop-color="entry.kitchen.media_backdrop_color"
          :prop="entry.kitchen.brand_tagline"
          :badges="['Kitchen']"
        />

        <div v-if="entry.menus.length" class="place-operations__menus">
          <p class="fx-type-label">
            {{ entry.menus.length === 1 ? 'Menu' : 'Menus' }}
          </p>
          <div class="place-operations__menu-links">
            <UButton
              v-for="menu in entry.menus"
              :key="menu.id"
              :to="menuPath(entry.kitchen.slug, menu.id)"
              :label="menu.name"
              icon="i-lucide-book-open"
              trailing-icon="i-lucide-arrow-right"
              color="neutral"
              variant="soft"
              size="sm"
            />
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAsyncData } from '#imports'
import { computed } from 'vue'
import type {
  PublicKitchenIndexItem,
  PublicKitchenIndexPage,
} from '../../../models/kitchen/kitchen-index.model'
import type {
  PublicMenuIndexItem,
  PublicMenuIndexPage,
} from '../../../models/kitchen/menu/menu-index.model'
import {
  directoryMenuRouteScope,
  menuRoutePath,
} from '../../../utils/kitchen-menu-route'

const props = defineProps<{
  placeId: string
  placeName: string
}>()

type PlaceKitchenEntry = {
  kitchen: PublicKitchenIndexItem
  menus: PublicMenuIndexItem[]
}

const { data } = await useAsyncData(
  `place-operations:${props.placeId}`,
  async (): Promise<PlaceKitchenEntry[]> => {
    const page = await $fetch<PublicKitchenIndexPage>('/api/kitchens', {
      query: {
        placeId: props.placeId,
        visibility: 'published',
        limit: 48,
      },
    })
    return Promise.all(page.items.map(async (kitchen) => {
      const menus = await $fetch<PublicMenuIndexPage>('/api/menus', {
        query: { kitchenSlug: kitchen.slug, limit: 50 },
      })
      return { kitchen, menus: menus.items }
    }))
  },
  { default: () => [] }
)

const kitchens = computed(() => data.value || [])
const menuPath = (kitchenSlug: string, menuId: string) =>
  menuRoutePath({
    scope: directoryMenuRouteScope(kitchenSlug),
    menuId,
  })
</script>

<style scoped>
.place-operations {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding-top: clamp(calc(var(--spacing) * 6), 5vw, calc(var(--spacing) * 10));
  border-top: 1px solid var(--ui-border);
}

.place-operations__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}

.place-operations__heading > div {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.place-operations__heading .fx-type-label,
.place-operations__menus .fx-type-label {
  color: var(--ui-primary);
}

.place-operations__grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, calc(var(--spacing) * 72)), 1fr)
  );
  gap: calc(var(--spacing) * 4);
}

.place-operations__card {
  overflow: hidden;
  border-color: color-mix(in srgb, var(--ui-primary) 16%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
}

.place-operations__menus {
  display: grid;
  gap: calc(var(--spacing) * 3);
  margin-top: calc(var(--spacing) * 4);
  padding-top: calc(var(--spacing) * 4);
  border-top: 1px solid var(--ui-border);
}

.place-operations__menu-links {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}

@media (max-width: 40rem) {
  .place-operations__heading {
    align-items: start;
  }

  .place-operations__menu-links {
    display: grid;
  }
}
</style>
