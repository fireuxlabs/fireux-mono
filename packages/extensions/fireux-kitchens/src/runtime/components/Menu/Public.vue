<template>
  <main
    class="public-menu"
    :dir="menuDirection"
    :lang="menuLanguage"
  >
    <section class="menu-page">
      <header class="menu-header">
        <p v-if="kitchenName" class="kitchen-name">
          {{ kitchenName }}
        </p>
        <h1>{{ menu.name }}</h1>
        <p v-if="menu.description" class="description">
          {{ menu.description }}
        </p>

        <MenuSproochliLanguageTrigger
          class="language-trigger"
          :language-options="languageOptions ?? []"
          :selected-language="selectedLanguage"
        />
      </header>

      <div class="sections">
        <section
          v-for="row in visibleSectionRows"
          :key="row.section.id"
          class="section"
        >
          <header class="section-header">
            <h2>{{ row.section.label }}</h2>
            <p v-if="row.section.description">
              {{ row.section.description }}
            </p>
          </header>

          <article
            v-for="item in row.items"
            :key="item.item.id"
            class="item"
          >
            <div class="item-line">
              <h3>{{ item.label }}</h3>
              <p v-if="item.price > 0" class="price">
                {{ formatPrice(item.price) }}
              </p>
            </div>
            <p v-if="item.description" class="item-description">
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
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../models/menu.model'
import type {
  PublicKitchenLanguageCode,
  PublicKitchenLanguageOption,
} from '../../composables/fireux/app/public-kitchen-language'
import { isPublicKitchenRtlLanguage } from '../../composables/fireux/app/public-kitchen-language'
import type { PublicMenuSectionRow } from '../../composables/fireux/app/public-menu-runtime'

const props = defineProps<{
  kitchenName: string
  menu: Menu
  sectionRows: PublicMenuSectionRow[]
  languageOptions?: PublicKitchenLanguageOption[]
  selectedLanguage?: PublicKitchenLanguageCode
}>()

const visibleSectionRows = computed(() =>
  props.sectionRows.filter((row) => row.items.length > 0)
)
const menuLanguage = computed(() => props.selectedLanguage || undefined)
const menuDirection = computed(() =>
  isPublicKitchenRtlLanguage(props.selectedLanguage) ? 'rtl' : 'ltr'
)

const formatPrice = (price: number) => {
  if (!Number.isFinite(price) || price <= 0) return ''
  return price % 1 === 0 ? `${price}.-` : price.toFixed(2)
}
</script>

<style scoped>
.public-menu {
  --menu-bg: #fffaf2;
  --menu-text: #211915;
  --menu-muted: #4f4037;
  --menu-dimmed: #756a60;
  --menu-accent: var(--ui-primary);
  --menu-font: Georgia, 'Times New Roman', serif;

  min-height: 100vh;
  background: var(--menu-bg);
  color: var(--menu-text);
  font-family: var(--menu-font);
}

.menu-page {
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 3rem);
}

.menu-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.kitchen-name,
.section-header p {
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.kitchen-name {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--menu-dimmed);
}

.menu-header h1,
.section-header h2,
.item h3,
.price {
  margin: 0;
  font-weight: 700;
  line-height: 1.35;
  text-transform: uppercase;
}

.menu-header h1 {
  font-size: clamp(2rem, 7vw, 3.5rem);
  letter-spacing: 0.12em;
  color: var(--menu-accent);
}

.description,
.section-header p,
.item-description {
  color: var(--menu-muted);
}

.description,
.item-description {
  line-height: 1.55;
}

.description {
  margin: 0.75rem auto 0;
  max-width: 42rem;
}

.language-trigger {
  justify-content: center;
  margin-top: 1.25rem;
}

.sections {
  columns: 22rem 2;
  column-gap: 2.5rem;
}

.section {
  margin-bottom: 2rem;
  break-inside: avoid;
}

.section-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--menu-accent);
  color: var(--menu-accent);
}

.section-header h2 {
  font-size: 1.25rem;
  letter-spacing: 0.12em;
}

.section-header p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
}

.item {
  padding: 0.75rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
}

.item-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
}

.item h3 {
  flex: 1 1 12rem;
  font-size: 1rem;
}

.price {
  direction: ltr;
  margin-inline-start: auto;
  font-size: 1rem;
  text-align: end;
  unicode-bidi: plaintext;
}

.item-description {
  margin: 0.25rem 0 0;
}
</style>
