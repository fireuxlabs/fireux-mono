<template>
  <div class="misebox-card-library">
    <header class="misebox-card-library__hero">
      <div class="misebox-card-library__intro">
        <UBadge color="primary" variant="subtle" size="lg">
          Misebox card system
        </UBadge>
        <h1>One language.<br>Every card.</h1>
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
      <MiseboxCardFamilySection
        id="cards-place"
        icon="i-lucide-map-pinned"
        title="Place"
        source="fireux-places · Place/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill', 'preview']"
      >
        <MiseboxCardSpecimen label="Cell">
          <PlaceCardsCell v-bind="placeCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <PlaceCardsPill v-bind="placePill" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <PlaceCardsPreview v-bind="placePreview" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-kitchen"
        icon="i-lucide-cooking-pot"
        title="Kitchen"
        source="fireux-kitchens · Kitchen/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['pill', 'preview']"
      >
        <MiseboxCardSpecimen label="Pill">
          <KitchenCardsPill v-bind="kitchenPill" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <KitchenCardsPreview v-bind="kitchenPreview" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-menu"
        icon="i-lucide-notebook-tabs"
        title="Menu"
        source="fireux-kitchens · Menu/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill', 'preview']"
      >
        <MiseboxCardSpecimen label="Cell" candidate>
          <MenuCardsCell :menu="menu" :route-scope="routeScope" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <MenuCardsPill :menu="menu" :route-scope="routeScope" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <MenuCardsPreview :menu="menu" :route-scope="routeScope" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-ingredient"
        icon="i-lucide-wheat"
        title="Ingredient"
        source="fireux-kitchens · Ingredient/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'preview']"
      >
        <MiseboxCardSpecimen label="Cell">
          <IngredientCardsCell v-bind="ingredientCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <IngredientCardsPreview v-bind="ingredientPreview" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-chef"
        icon="i-lucide-chef-hat"
        title="Chef"
        source="fireux-kitchens · Chef/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill', 'preview']"
      >
        <MiseboxCardSpecimen label="Cell">
          <ChefCardsCell v-bind="chefCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <ChefCardsPill v-bind="chefCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <ChefCardsPreview v-bind="chefCard" specialties-csv="Grill, Mise en place" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-customer"
        icon="i-lucide-user-round"
        title="Customer"
        source="fireux-kitchens · Customer/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill']"
      >
        <MiseboxCardSpecimen label="Cell">
          <CustomerCardsCell v-bind="customerCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <CustomerCardsPill v-bind="customerCard" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-driver"
        icon="i-lucide-bike"
        title="Driver"
        source="fireux-kitchens · Driver/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill']"
      >
        <MiseboxCardSpecimen label="Cell">
          <DriverCardsCell v-bind="driverCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <DriverCardsPill v-bind="driverCard" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-mise"
        icon="i-lucide-list-checks"
        title="Mise"
        source="fireux-kitchens · Console/Kitchen/Operations/Mise/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill']"
      >
        <MiseboxCardSpecimen label="Cell">
          <ConsoleKitchenOperationsMiseCardsCell v-bind="miseCell" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <ConsoleKitchenOperationsMiseCardsPill v-bind="misePill" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-operation-ingredients"
        icon="i-lucide-carrot"
        title="Kitchen ingredient"
        source="fireux-kitchens · Console/Kitchen/Operations/Ingredients/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell']"
      >
        <MiseboxCardSpecimen label="Cell" candidate>
          <ConsoleKitchenOperationsIngredientsCardsCell
            id="beef-mince"
            to="/"
            title="Ground beef"
            :image-url="ingredientImage"
          />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-kitchen-supplier"
        icon="i-lucide-warehouse"
        title="Kitchen supplier"
        source="fireux-kitchens · Console/Kitchen/Operations/Suppliers/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell']"
      >
        <MiseboxCardSpecimen label="Cell" candidate>
          <ConsoleKitchenOperationsSuppliersCardsCell v-bind="kitchenSupplierCell" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-supplier"
        icon="i-lucide-truck"
        title="Supplier"
        source="fireux-suppliers · Supplier/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill', 'preview']"
      >
        <MiseboxCardSpecimen label="Cell">
          <SupplierCardsCell v-bind="supplierCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <SupplierCardsPill v-bind="supplierCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <SupplierCardsPreview v-bind="supplierCard" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-supplier-item"
        icon="i-lucide-package-open"
        title="Supplier item"
        source="fireux-suppliers · Supplier/Item/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['pill']"
      >
        <MiseboxCardSpecimen label="Pill">
          <SupplierItemCardsPill v-bind="supplierItemCard" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-agent"
        icon="i-lucide-handshake"
        title="Agent"
        source="fireux-jobs · Agent/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill', 'preview']"
      >
        <MiseboxCardSpecimen label="Cell">
          <AgentCardsCell v-bind="agentCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <AgentCardsPill v-bind="agentCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <AgentCardsPreview v-bind="agentCard" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-job"
        icon="i-lucide-briefcase-business"
        title="Job"
        source="fireux-jobs · Job/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill', 'preview']"
      >
        <MiseboxCardSpecimen label="Cell">
          <JobCardsCell v-bind="jobCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <JobCardsPill v-bind="jobCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <JobCardsPreview v-bind="jobCard" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

      <MiseboxCardFamilySection
        id="cards-professional"
        icon="i-lucide-id-card"
        title="Professional"
        source="fireux-jobs · Professional/Cards"
        :query="searchQuery"
        :variant="activeVariant"
        :variants="['cell', 'pill', 'preview']"
      >
        <MiseboxCardSpecimen label="Cell">
          <ProfessionalCardsCell v-bind="professionalCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <ProfessionalCardsPill v-bind="professionalCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <ProfessionalCardsPreview v-bind="professionalCard" />
        </MiseboxCardSpecimen>
      </MiseboxCardFamilySection>

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
import type { PublicMenuIndexItem } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-index.model'
import MiseboxCardFamilySection from './CardFamilySection.vue'

type CardVariant = 'all' | 'cell' | 'pill' | 'preview'
type CardVariantName = Exclude<CardVariant, 'all'>
type CardFamilyCatalogItem = readonly [
  title: string,
  source: string,
  variants: readonly CardVariantName[],
]

const dishImage = '/img/showcase/menu/deanos/deanos-classic.jpg'
const ingredientImage = '/img/showcase/ingredients/beef-mince.jpg'
const routeScope = { kind: 'root' } as const
const searchQuery = ref('')
const activeVariant = ref<CardVariant>('all')
const normalizeCardSearch = (value: string) => value
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
    const matchesQuery = !query
      || normalizeCardSearch(`${title} ${source}`).includes(query)
    const matchesVariant = activeVariant.value === 'all'
      || variants.includes(activeVariant.value as CardVariantName)
    return matchesQuery && matchesVariant
  }).length
})

function clearFilters() {
  searchQuery.value = ''
  activeVariant.value = 'all'
}

const placeCard = {
  id: 'interlaken',
  to: '/',
  name: 'Interlaken',
  formattedAddress: '3800 Interlaken, Switzerland',
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  source: 'fireux' as const,
  prop: 'Between Lake Thun and Lake Brienz.',
}
const placePill = {
  to: '/',
  title: 'Interlaken',
  shortName: 'Interlaken',
  subtitle: 'Bernese Oberland',
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  badges: ['Switzerland'],
}
const placePreview = {
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  name: 'Interlaken',
  formattedAddress: '3800 Interlaken, Switzerland',
  source: 'fireux' as const,
  prop: 'Between Lake Thun and Lake Brienz.',
  details: [{ label: 'Region', value: 'Bernese Oberland' }],
}

const kitchenPill = {
  to: '/',
  title: 'Card Specimen Kitchen',
  subtitle: 'Sample venue',
  imageUrl: dishImage,
  imageShade: 'dark' as const,
}
const kitchenPreview = {
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  name: 'Card Specimen Kitchen',
  formattedAddress: 'Sample venue, Switzerland',
  shortAddress: 'Sample venue',
  prop: 'Generic content for comparing card variants.',
  currencyCode: 'CHF',
  details: [
    { label: 'Menu', value: 'Main Menu' },
    { label: 'Team', value: '3 sample members' },
  ],
}

const menu = {
  id: 'card-specimen-menu',
  name: 'Main Menu',
  description: 'Smash burgers, crispy chicken, loaded sides, and shakes.',
  status: 'published',
  contexts: ['generic', 'collection', 'kiosk'],
  kitchen: {
    name: 'Card Specimen Kitchen',
    image_url: dishImage,
    image_shade: 'dark',
  },
  source: {
    app_id: 'misebox-app',
    kitchen_id: 'card-specimen-kitchen',
    menu_id: 'card-specimen-menu',
    kitchen_slug: 'card-specimen-kitchen',
    kitchen_name: 'Card Specimen Kitchen',
  },
} as const satisfies PublicMenuIndexItem

const ingredientCard = {
  slug: 'beef-mince',
  to: '/',
  name: 'Ground beef',
  subtitle: 'Meat',
  status: 'Active',
  imageUrl: ingredientImage,
}
const ingredientPreview = {
  imageUrl: ingredientImage,
  name: 'Ground beef',
  subtitle: 'Meat',
  status: 'Active',
  prop: 'Portioned into burger balls before service.',
  badges: ['Burger mise'],
  details: [{ label: 'Kitchen use', value: 'Burger station' }],
}

const chefCard = {
  to: '/',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  displayName: 'Ana Müller',
  handle: '@ana-muller',
  title: 'Chef de Partie',
  badges: ['Grill', 'Mise en place'],
  summary: 'Hot-station chef focused on service and prep.',
}
const customerCard = {
  avatarUrl: '',
  secondaryAvatarUrl: '',
  displayName: 'Sofia Keller',
  title: 'Regular customer',
  badges: ['Collection'],
  summary: 'Usually orders the Deanos Classic.',
}
const driverCard = {
  to: '/',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  displayName: 'Marco Frei',
  handle: '@marco-frei',
  title: 'Delivery driver',
  badges: ['Interlaken'],
  summary: 'Local delivery coverage around Interlaken.',
}
const miseCell = {
  to: '/',
  name: 'Burger patties',
  subtitle: '80 g beef balls',
  description: 'Portion ground beef into loose balls and hold chilled.',
}
const misePill = {
  to: '/',
  title: 'Burger patties',
  subtitle: 'Portion before service',
  imageUrl: '',
  icon: 'i-lucide-list-checks',
  hasMissingTitle: false,
}
const kitchenSupplierCell = {
  id: 'alpine-foods',
  to: '/',
  title: 'Alpine Foods',
  subtitle: 'Interlaken',
  avatarUrl: ingredientImage,
  badges: ['Meat', 'Dairy'],
  summary: 'Local food supplier with weekday deliveries.',
}

const supplierCard = {
  to: '/',
  avatarUrl: ingredientImage,
  imageUrl: ingredientImage,
  title: 'Alpine Foods',
  subtitle: 'Interlaken',
  badges: ['Meat', 'Dairy'],
  summary: 'Local food supplier with weekday deliveries.',
  organizationName: 'Alpine Foods GmbH',
  locationsLabel: 'Interlaken · Matten',
  categoriesCsv: 'Meat, Dairy, Produce',
}
const supplierItemCard = {
  to: '/',
  imageUrl: ingredientImage,
  title: 'Ground beef 80/20',
  subtitle: 'Alpine Foods',
  badges: ['Fresh'],
  packPriceLabel: 'CHF 82.50',
  unitPriceLabel: 'CHF 16.50',
  unit: 'kg',
  packLabel: '5 kg case',
  productId: 'beef-mince-80-20',
  ingredientId: 'beef-mince',
}

const agentCard = {
  to: '/',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  displayName: 'Alpine Hospitality',
  handle: '@alpine-hospitality',
  title: 'Hospitality recruiter',
  badges: ['Bernese Oberland'],
  summary: 'Restaurant staffing across the region.',
}
const jobCard = {
  to: '/',
  title: 'Chef de Partie',
  subtitle: 'Deanos Kitchen · Interlaken',
  description: 'Join the hot section for a busy summer service.',
  badges: ['Full time', 'Kitchen'],
  status: 'open',
  imageUrl: dishImage,
  compensationLabel: 'CHF 5,200 / month',
  openingsLabel: '1 opening',
  contractTypeLabel: 'Permanent',
  managementModeLabel: 'Direct hire',
  scheduleLabel: 'From August 2026',
}
const professionalCard = {
  to: '/',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  image: '',
  imageUrl: '',
  displayName: 'Ana Müller',
  handle: '@ana-muller',
  title: 'Chef de Partie',
  badges: ['Grill', 'Prep'],
  summary: 'Kitchen professional focused on organised, fast service.',
}

</script>

<style scoped>
.misebox-card-library {
  display: grid;
  min-width: 0;
  width: 100%;
  max-width: 96rem;
  margin-inline: auto;
  gap: calc(var(--spacing) * 10);
  padding: calc(var(--spacing) * 10) calc(var(--spacing) * 4)
    calc(var(--spacing) * 20);
}

.misebox-card-library__hero {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 8);
  padding-block: calc(var(--spacing) * 10) calc(var(--spacing) * 8);
}

.misebox-card-library__intro {
  max-width: 48rem;
}

.misebox-card-library__intro h1 {
  margin: 0;
  margin-top: calc(var(--spacing) * 5);
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-4xl), 9vw, var(--text-7xl));
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: 0.94;
  text-wrap: balance;
}

.misebox-card-library__intro p {
  max-width: 40rem;
  margin: calc(var(--spacing) * 5) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-lg);
  line-height: var(--text-lg--line-height);
  text-wrap: pretty;
}

.misebox-card-library__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-bg-elevated) 90%, transparent);
  box-shadow: var(--fx-elevation-low);
}

.misebox-card-library__stats div {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 5) calc(var(--spacing) * 3);
  text-align: center;
}

.misebox-card-library__stats div + div {
  border-left: 1px solid var(--ui-border);
}

.misebox-card-library__stats dt {
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.misebox-card-library__stats dd {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}

.misebox-card-library__toolbar {
  position: sticky;
  z-index: 20;
  top: calc(var(--spacing) * 18);
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3);
  border: 1px solid color-mix(in srgb, var(--ui-border) 88%, transparent);
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-bg) 86%, transparent);
  box-shadow: var(--fx-elevation-medium);
  backdrop-filter: blur(calc(var(--spacing) * 4));
}

.misebox-card-library__search {
  width: min(100%, 26rem);
}

.misebox-card-library__result {
  margin: 0 0 0 auto;
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.misebox-card-library__families {
  display: grid;
  min-width: 0;
}

.misebox-card-library__empty {
  justify-self: stretch;
  text-align: center;
}

.misebox-card-library__empty-content {
  display: grid;
  justify-items: center;
  gap: calc(var(--spacing) * 3);
  padding-block: calc(var(--spacing) * 12);
}

.misebox-card-library__empty svg {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  color: var(--ui-text-dimmed);
}

.misebox-card-library__empty h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
}

.misebox-card-library__empty p {
  max-width: 28rem;
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

@media (min-width: 48rem) {
  .misebox-card-library {
    padding-inline: calc(var(--spacing) * 8);
  }

  .misebox-card-library__hero {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 30rem);
    align-items: end;
  }
}

@media (max-width: 47.999rem) {
  .misebox-card-library__search,
  .misebox-card-library__toolbar :deep([role="group"]) {
    width: 100%;
  }

  .misebox-card-library__toolbar :deep([role="group"] > *) {
    min-width: 0;
    flex: 1;
  }

  .misebox-card-library__toolbar :deep([role="group"] span) {
    display: none;
  }

  .misebox-card-library__result {
    margin-left: 0;
  }
}
</style>
