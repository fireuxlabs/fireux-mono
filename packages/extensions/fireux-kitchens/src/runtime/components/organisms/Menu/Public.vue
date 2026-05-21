<template>
  <main
    class="public-menu-surface min-h-screen"
    :class="publicMenuSurfaceClass"
    :style="menuDesignStyle"
  >
    <section class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <div class="public-menu-content">
        <header class="mb-10 text-center">
          <p
            v-if="kitchenName"
            class="public-menu-sans public-menu-muted text-xs font-semibold uppercase tracking-[0.22em]"
          >
            {{ kitchenName }}
          </p>
          <h1 class="public-menu-accent mt-2 text-4xl font-bold uppercase tracking-[0.14em] sm:text-5xl">
            {{ menu.name }}
          </h1>
          <p v-if="menu.description" class="public-menu-toned mt-3 text-base font-medium">
            {{ menu.description }}
          </p>
          <div class="public-menu-accent-bg mx-auto mt-5 h-px w-28" />
        </header>

        <div class="public-menu-sections">
          <section
            v-for="row in visibleSectionRows"
            :key="row.section.id"
            class="public-menu-section"
          >
            <div class="public-menu-section-heading mb-4 border-b-2 pb-2">
              <h2 class="text-[1.28rem] font-bold uppercase tracking-[0.13em]">
                {{ row.section.label }}
              </h2>
              <p v-if="row.section.description" class="public-menu-sans public-menu-toned mt-1 text-sm font-medium">
                {{ row.section.description }}
              </p>
            </div>

            <article
              v-for="item in row.items"
              :key="item.item.id"
              class="public-menu-entry border-b py-3 last:border-0"
            >
              <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 class="public-menu-text min-w-48 flex-1 text-[1.03rem] font-bold uppercase leading-snug tracking-[0.055em]">
                  {{ item.label }}
                </h3>
                <div
                  v-if="item.price > 0"
                  class="public-menu-price-label public-menu-text ms-auto max-w-full text-right text-[1rem] font-bold tabular-nums leading-snug"
                >
                  {{ formatPrice(item.price) }}
                </div>
              </div>
              <p v-if="item.description" class="public-menu-toned mt-1 text-[1rem] font-medium leading-relaxed">
                {{ item.description }}
              </p>
            </article>
          </section>
        </div>

        <UAlert
          v-if="!visibleSectionRows.length"
          color="neutral"
          variant="soft"
          title="Menu unavailable"
          description="This menu has no published dish items yet."
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../models/menu.model'
import {
  resolvePublicMenuDesign,
  resolvePublicMenuDesignSource,
  resolvePublicMenuDesignStyle,
} from '../../../composables/fireux/app/public-menu-design'

type PublicMenuSectionRow = {
  section: { id: string; label: string; description?: string }
  items: Array<{
    item: { id: string }
    label: string
    description: string
    price: number
  }>
}

const props = defineProps<{
  kitchenName: string
  menu: Menu
  sectionRows: PublicMenuSectionRow[]
}>()

const visibleSectionRows = computed(() =>
  props.sectionRows.filter((row) => row.items.length > 0)
)
const menuDesignSource = computed(() => resolvePublicMenuDesignSource(props.menu))
const publicMenuDesign = computed(() =>
  resolvePublicMenuDesign(undefined, props.menu)
)
const publicMenuSurfaceClass = computed(
  () => `public-menu-surface--${publicMenuDesign.value.color_mode}`
)
const menuDesignStyle = computed(() =>
  resolvePublicMenuDesignStyle(menuDesignSource.value)
)

const formatPrice = (price: number) => {
  if (!Number.isFinite(price) || price <= 0) return ''
  return price % 1 === 0 ? `${price}.-` : price.toFixed(2)
}
</script>

<style scoped>
.public-menu-surface {
  --public-menu-bg: #fffaf2;
  --public-menu-panel: rgba(255, 255, 255, 0.82);
  --public-menu-text: #211915;
  --public-menu-toned: #4f4037;
  --public-menu-muted: #756a60;
  --public-menu-border: rgba(34, 25, 20, 0.16);
  --public-menu-accent: var(--ui-primary);
  background: var(--public-menu-bg);
  color: var(--public-menu-text);
  font-family: var(--public-menu-font, Georgia, 'Times New Roman', serif);
}

.public-menu-surface--dark {
  --public-menu-bg: #090806;
  --public-menu-panel: rgba(255, 255, 255, 0.06);
  --public-menu-text: #fff7e8;
  --public-menu-toned: #e2d2b8;
  --public-menu-muted: #bba98b;
  --public-menu-border: rgba(255, 255, 255, 0.18);
}

.public-menu-content {
  padding: 0;
}

.public-menu-price-label {
  direction: ltr;
  margin-inline-start: auto;
  overflow-wrap: anywhere;
  unicode-bidi: plaintext;
}

.public-menu-sections {
  column-count: 1;
  column-gap: 2.5rem;
}

.public-menu-section {
  break-inside: avoid;
  display: inline-block;
  margin: 0 0 2.25rem;
  width: 100%;
}

.public-menu-section-heading {
  border-color: var(--public-menu-accent);
  color: var(--public-menu-accent);
}

.public-menu-entry {
  border-color: var(--public-menu-border);
}

.public-menu-text {
  color: var(--public-menu-text);
}

.public-menu-toned {
  color: var(--public-menu-toned);
}

.public-menu-muted {
  color: var(--public-menu-muted);
}

.public-menu-accent {
  color: var(--public-menu-accent);
}

.public-menu-accent-bg {
  background: var(--public-menu-accent);
}

.public-menu-sans {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@media (min-width: 860px) {
  .public-menu-content {
    padding: 2rem 3rem;
  }

  .public-menu-sections {
    column-count: 2;
  }
}
</style>
