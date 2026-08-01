<template>
  <div class="misebox-card-library">
    <header class="misebox-card-library__hero">
      <div class="misebox-card-library__intro">
        <UBadge color="primary" variant="subtle" size="lg">
          Misebox card system
        </UBadge>
        <h1>One language.<br />Every card.</h1>
        <p>
          Cells scan quickly, pills select compactly, and previews carry richer
          context. The content changes; the shared visual grammar does not.
        </p>
      </div>

      <dl class="misebox-card-library__stats">
        <div>
          <dt>Families</dt>
          <dd>{{ familyCatalog.length }}</dd>
        </div>
        <div>
          <dt>Specimens</dt>
          <dd>{{ specimenCount }}</dd>
        </div>
        <div>
          <dt>Core variants</dt>
          <dd>3</dd>
        </div>
      </dl>
    </header>

    <div class="misebox-card-library__toolbar">
      <UInput
        v-model="searchQuery"
        class="misebox-card-library__search"
        icon="i-lucide-search"
        placeholder="Search a family or package"
        size="lg"
        aria-label="Search card families"
      >
        <template v-if="searchQuery" #trailing>
          <UButton
            aria-label="Clear card search"
            color="neutral"
            icon="i-lucide-x"
            size="xs"
            variant="ghost"
            @click="searchQuery = ''"
          />
        </template>
      </UInput>

      <UFieldGroup size="sm" aria-label="Card variant">
        <UButton
          v-for="option in variantOptions"
          :key="option.value"
          :icon="option.icon"
          :label="option.label"
          :color="activeVariant === option.value ? 'primary' : 'neutral'"
          :variant="activeVariant === option.value ? 'solid' : 'ghost'"
          :aria-pressed="activeVariant === option.value"
          @click="activeVariant = option.value"
        />
      </UFieldGroup>

      <p class="misebox-card-library__result">
        {{ visibleFamilyCount }}
        {{ visibleFamilyCount === 1 ? 'family' : 'families' }}
      </p>
    </div>

    <div class="misebox-card-library__families">
      <MiseboxOtherCardFamilies
        :query="searchQuery"
        :variant="activeVariant"
      />

      <UCard
        v-if="visibleFamilyCount === 0"
        class="misebox-card-library__empty"
        variant="subtle"
      >
        <div class="misebox-card-library__empty-content">
          <UIcon name="i-lucide-search-x" aria-hidden="true" />
          <h2>No matching card family</h2>
          <p>Try a package name such as Kitchen, Supplier, Jobs or Places.</p>
          <UButton
            color="neutral"
            label="Clear filters"
            variant="soft"
            @click="clearFilters"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '#imports'

type CardVariant = 'all' | 'cell' | 'pill' | 'preview'
type CardVariantName = Exclude<CardVariant, 'all'>
type CardFamilyCatalogItem = readonly [
  title: string,
  source: string,
  variants: readonly CardVariantName[],
]

const searchQuery = ref('')
const activeVariant = ref<CardVariant>('all')
const normalizeCardSearch = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

const variantOptions: {
  value: CardVariant
  label: string
  icon: string
}[] = [
  { value: 'all', label: 'All', icon: 'i-lucide-layout-grid' },
  { value: 'cell', label: 'Cells', icon: 'i-lucide-rows-3' },
  { value: 'pill', label: 'Pills', icon: 'i-lucide-toggle-right' },
  { value: 'preview', label: 'Previews', icon: 'i-lucide-panels-top-left' },
]

const familyCatalog: readonly CardFamilyCatalogItem[] = [
  ['Place', 'fireux-places', ['cell', 'pill', 'preview']],
  ['Kitchen', 'fireux-kitchens', ['pill', 'preview']],
  ['Menu', 'fireux-kitchens', ['cell', 'pill', 'preview']],
  ['Ingredient', 'fireux-kitchens', ['cell', 'preview']],
  ['Chef', 'fireux-kitchens', ['cell', 'pill', 'preview']],
  ['Customer', 'fireux-kitchens', ['cell', 'pill']],
  ['Driver', 'fireux-kitchens', ['cell', 'pill']],
  ['Mise', 'fireux-kitchens', ['cell', 'pill']],
  ['Kitchen ingredient', 'fireux-kitchens', ['cell']],
  ['Kitchen supplier', 'fireux-kitchens', ['cell']],
  ['Supplier', 'fireux-suppliers', ['cell', 'pill', 'preview']],
  ['Supplier item', 'fireux-suppliers', ['pill']],
  ['Agent', 'fireux-jobs', ['cell', 'pill', 'preview']],
  ['Job', 'fireux-jobs', ['cell', 'pill', 'preview']],
  ['Professional', 'fireux-jobs', ['cell', 'pill', 'preview']],
]

const specimenCount = familyCatalog.reduce(
  (count, family) => count + family[2].length,
  0
)
const visibleFamilyCount = computed(() => {
  const query = normalizeCardSearch(searchQuery.value)
  return familyCatalog.filter(([title, source, variants]) => {
    const matchesQuery =
      !query || normalizeCardSearch(`${title} ${source}`).includes(query)
    const matchesVariant =
      activeVariant.value === 'all' ||
      variants.includes(activeVariant.value as CardVariantName)
    return matchesQuery && matchesVariant
  }).length
})

function clearFilters() {
  searchQuery.value = ''
  activeVariant.value = 'all'
}

</script>

<style scoped src="./other-cards.css"></style>
