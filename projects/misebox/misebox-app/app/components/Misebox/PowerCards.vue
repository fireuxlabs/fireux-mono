<template>
  <div ref="specimenCollection" class="misebox-card-specimens">
    <header class="misebox-card-specimens__header">
      <h1>Misebox cards</h1>
      <label class="misebox-card-specimens__search">
        <UIcon name="i-lucide-search" aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Find a card, e.g. Kiosk · Item"
          aria-label="Find a card"
        >
        <button
          v-if="searchQuery"
          type="button"
          aria-label="Clear card search"
          @click="searchQuery = ''"
        >
          <UIcon name="i-lucide-x" aria-hidden="true" />
        </button>
      </label>
    </header>

    <section aria-labelledby="cards-app">
      <MiseboxSpecimenHeading id="cards-app" title="App" source="Core · App/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <AppCardsCell v-bind="appCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <AppCardsPill v-bind="appCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <AppCardsPreview v-bind="appCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-place">
      <MiseboxSpecimenHeading id="cards-place" title="Place" source="fireux-places · Place/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <PlaceCardsCell v-bind="placeCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <PlaceCardsPill v-bind="placePill" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <PlaceCardsPreview v-bind="placePreview" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-kitchen">
      <MiseboxSpecimenHeading id="cards-kitchen" title="Kitchen" source="fireux-kitchens · Kitchen/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell" completed>
          <div class="misebox-kitchen-cell-group">
            <KitchenCardsCell
              v-for="kitchen in kitchenCards"
              :key="kitchen.id"
              v-bind="kitchen"
            />
          </div>
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <KitchenCardsPill v-bind="kitchenPill" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <KitchenCardsPreview v-bind="kitchenPreview" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-menu">
      <MiseboxSpecimenHeading id="cards-menu" title="Menu" source="fireux-kitchens · Menu/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <MenuCardsCell :menu="menu" :route-scope="routeScope" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <MenuCardsPill :menu="menu" :route-scope="routeScope" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <MenuCardsPreview :menu="menu" :route-scope="routeScope" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-ingredient">
      <MiseboxSpecimenHeading id="cards-ingredient" title="Ingredient" source="fireux-kitchens · Ingredient/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <IngredientCardsCell v-bind="ingredientCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill" compact completed>
          <div class="misebox-ingredient-pill-group">
            <IngredientCardsPill
              v-for="ingredient in ingredientPills"
              :key="ingredient.slug"
              v-bind="ingredient"
            />
          </div>
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <IngredientCardsPreview v-bind="ingredientPreview" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-chef">
      <MiseboxSpecimenHeading id="cards-chef" title="Chef" source="fireux-kitchens · Chef/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <ChefCardsCell v-bind="chefCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <ChefCardsPill v-bind="chefCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <ChefCardsPreview v-bind="chefCard" specialties-csv="Grill, Mise en place" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-customer">
      <MiseboxSpecimenHeading id="cards-customer" title="Customer" source="fireux-kitchens · Customer/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <CustomerCardsCell v-bind="customerCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <CustomerCardsPill v-bind="customerCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-driver">
      <MiseboxSpecimenHeading id="cards-driver" title="Driver" source="fireux-kitchens · Driver/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <DriverCardsCell v-bind="driverCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <DriverCardsPill v-bind="driverCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-dish">
      <MiseboxSpecimenHeading id="cards-dish" title="Dish" source="fireux-kitchens · Console/Kitchen/Operations/Dishes/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <ConsoleKitchenOperationsDishesCardsCell
            id="deanos-classic"
            title="Deanos Classic"
            :image-url="dishImage"
            meta="Main Menu"
            price-label="18 CHF"
            class="w-32 sm:w-36"
            action
          />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-operation-ingredients">
      <MiseboxSpecimenHeading id="cards-operation-ingredients" title="Kitchen ingredient" source="fireux-kitchens · Console/Kitchen/Operations/Ingredients/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <ConsoleKitchenOperationsIngredientsCardsCell
            id="beef-mince"
            to="/"
            title="Ground beef"
            :image-url="ingredientImage"
          />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-mise">
      <MiseboxSpecimenHeading id="cards-mise" title="Mise" source="fireux-kitchens · Console/Kitchen/Operations/Mise/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <ConsoleKitchenOperationsMiseCardsCell v-bind="miseCell" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <ConsoleKitchenOperationsMiseCardsPill v-bind="misePill" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <ConsoleKitchenOperationsMiseCardsPreview v-bind="misePreview" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-recipe">
      <MiseboxSpecimenHeading id="cards-recipe" title="Recipe" source="fireux-kitchens · Console/Kitchen/Operations/Recipes/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <ConsoleKitchenOperationsRecipesCardsCell v-bind="recipeCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-kitchen-supplier">
      <MiseboxSpecimenHeading id="cards-kitchen-supplier" title="Kitchen supplier" source="fireux-kitchens · Console/Kitchen/Operations/Suppliers/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <ConsoleKitchenOperationsSuppliersCardsCell v-bind="kitchenSupplierCell" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-supplier">
      <MiseboxSpecimenHeading id="cards-supplier" title="Supplier" source="fireux-suppliers · Supplier/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <SupplierCardsCell v-bind="supplierCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <SupplierCardsPill v-bind="supplierCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <SupplierCardsPreview v-bind="supplierCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-supplier-item">
      <MiseboxSpecimenHeading id="cards-supplier-item" title="Supplier item" source="fireux-suppliers · Supplier/Item/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <SupplierItemCardsCell v-bind="supplierItemCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <SupplierItemCardsPill v-bind="supplierItemCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-agent">
      <MiseboxSpecimenHeading id="cards-agent" title="Agent" source="fireux-jobs · Agent/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <AgentCardsCell v-bind="agentCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <AgentCardsPill v-bind="agentCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <AgentCardsPreview v-bind="agentCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-job">
      <MiseboxSpecimenHeading id="cards-job" title="Job" source="fireux-jobs · Job/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <JobCardsCell v-bind="jobCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <JobCardsPill v-bind="jobCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <JobCardsPreview v-bind="jobCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-professional">
      <MiseboxSpecimenHeading id="cards-professional" title="Professional" source="fireux-jobs · Professional/Cards" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Cell">
          <ProfessionalCardsCell v-bind="professionalCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Pill">
          <ProfessionalCardsPill v-bind="professionalCard" />
        </MiseboxCardSpecimen>
        <MiseboxCardSpecimen label="Preview">
          <ProfessionalCardsPreview v-bind="professionalCard" />
        </MiseboxCardSpecimen>
      </div>
    </section>

    <section aria-labelledby="cards-kiosk">
      <MiseboxSpecimenHeading id="cards-kiosk" title="Kiosk" source="fireux-kitchens · Menu/Order/Kiosk" />
      <div class="misebox-card-specimens__grid">
        <MiseboxCardSpecimen label="Item">
          <MenuOrderKioskItem
            currency-code="CHF"
            :item="kioskItem"
            class="w-full max-w-xs justify-self-center"
          />
        </MiseboxCardSpecimen>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from '#imports'
import type { PublicMenuIndexItem } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-index.model'
import type { MenuManifestItem } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'

const dishImage = '/img/showcase/menu/deanos/deanos-classic.jpg'
const ingredientImage = '/img/showcase/ingredients/beef-mince.jpg'
const routeScope = { kind: 'root' } as const
const searchQuery = ref('')
const specimenCollection = useTemplateRef<HTMLElement>('specimenCollection')
const normalizeCardSearch = (value: string) => value
  .toLocaleLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim()

watch(searchQuery, async (value) => {
  await nextTick()

  const query = normalizeCardSearch(value)
  for (const section of specimenCollection.value?.querySelectorAll('section') || []) {
    const headingId = section.getAttribute('aria-labelledby')
    const family = headingId
      ? document.getElementById(headingId)?.textContent?.trim() || ''
      : ''

    for (const specimen of section.querySelectorAll<HTMLElement>(
      '.misebox-card-specimen'
    )) {
      const label = specimen.querySelector(
        '.misebox-card-specimen__label'
      )?.textContent?.trim() || ''
      const reference = normalizeCardSearch(`${family} ${label}`)
      specimen.hidden = Boolean(query && !reference.includes(query))
    }
  }
})

const appCard = {
  id: 'misebox-app',
  shortName: 'misebox',
  to: '/',
  thumbnailUrl: '/img/app/thumbnail.png',
  avatarText: 'M',
  displayName: 'Misebox',
  ecosystem: 'Misebox',
  tagline: 'The Control Centre For Kitchen Operations.',
  userCount: 24,
  badges: ['Global app'],
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

const kitchenCard = {
  id: 'deanos-kitchen',
  to: '/',
  name: 'Deanos Kitchen',
  shortAddress: 'Interlaken',
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  prop: 'Smash burgers, loaded sides, and shakes.',
}
const kitchenCards = [
  {
    ...kitchenCard,
    id: 'deanos',
    name: 'Deanos Smash Burger',
    shortAddress: 'Bern',
    prop: 'Smashed to order. Served fast.',
  },
  {
    ...kitchenCard,
    id: 'pizza-the-action',
    name: 'Pizza the Action',
    shortAddress: 'Lucerne',
    imageUrl: '/img/showcase/menu/pizza-the-action/action-margherita.jpg',
    prop: 'Big flavour. Zero drama.',
  },
  {
    ...kitchenCard,
    id: 'misebox-restaurant',
    name: 'Misebox Restaurant',
    shortAddress: 'Zurich',
    imageUrl: '/img/showcase/menu/misebox-restaurant/market-garden-salad.jpg',
    prop: 'Seasonal plates in a relaxed garden dining room.',
  },
]
const kitchenPill = {
  to: '/',
  title: 'Deanos Kitchen',
  subtitle: 'Interlaken',
  imageUrl: dishImage,
  imageShade: 'dark' as const,
}
const kitchenPreview = {
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  name: 'Deanos Kitchen',
  formattedAddress: 'Interlaken, Switzerland',
  shortAddress: 'Interlaken',
  prop: 'Smash burgers, loaded sides, and shakes.',
  currencyCode: 'CHF',
  details: [
    { label: 'Menu', value: 'Main Menu' },
    { label: 'Team', value: '8 members' },
  ],
}

const menu = {
  id: 'deanos-main-menu',
  name: 'Main Menu',
  description: 'Smash burgers, crispy chicken, loaded sides, and shakes.',
  status: 'published',
  contexts: ['generic', 'collection', 'kiosk'],
  kitchen: {
    name: 'Deanos Kitchen',
    image_url: dishImage,
    image_shade: 'dark',
  },
  source: {
    app_id: 'misebox-app',
    kitchen_id: 'deanos-kitchen',
    menu_id: 'deanos-main-menu',
    kitchen_slug: 'deanos-kitchen',
    kitchen_name: 'Deanos Kitchen',
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
const ingredientPills = [
  {
    slug: 'burger-buns',
    to: '/',
    title: 'Burger buns',
    subtitle: 'Bakery',
    imageUrl: '/img/showcase/ingredients/burger-buns-three.png',
  },
  {
    slug: 'beef-mince',
    to: '/',
    title: 'Ground beef',
    subtitle: 'Meat',
    imageUrl: '/img/showcase/ingredients/beef-mince.jpg',
  },
  {
    slug: 'american-cheese',
    to: '/',
    title: 'American cheese',
    subtitle: 'Dairy',
    imageUrl: '/img/showcase/ingredients/american-cheese.jpg',
  },
  {
    slug: 'dill-pickles',
    to: '/',
    title: 'Dill pickles',
    subtitle: 'Preserves',
    imageUrl: '/img/showcase/ingredients/dill-pickles.jpg',
  },
  {
    slug: 'iceberg-lettuce',
    to: '/',
    title: 'Iceberg lettuce',
    subtitle: 'Produce',
    imageUrl: '/img/showcase/ingredients/iceberg-lettuce.jpg',
  },
]
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
const misePreview = {
  imageUrl: ingredientImage,
  name: 'Burger patties',
  subtitle: '80 g beef balls',
  status: 'In progress',
  prop: 'Portion ground beef into loose balls and hold chilled.',
  badges: ['High priority'],
  details: [{ label: 'Estimate', value: '25 min' }],
}
const recipeCard = {
  to: '/',
  title: 'Deanos burger sauce',
  subtitle: 'Sauce',
  status: 'Active',
  badges: ['Yield 1 litre'],
  prop: 'House burger sauce for the main menu.',
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

const kioskItem = {
  id: 'deanos-classic',
  dishId: 'deanos-classic',
  itemKind: 'food',
  isDeal: false,
  name: 'Deanos Classic',
  description: 'Double smash patties, cheddar, pickles, lettuce, and house sauce.',
  imageUrl: dishImage,
  price: 18,
  priceLabel: 'CHF 18.00',
  priceOptions: [],
  addOns: [
    {
      id: 'extra-cheddar',
      label: 'Extra cheddar',
      price: 2,
      priceLabel: 'CHF 2.00',
    },
  ],
} satisfies MenuManifestItem
</script>

<style scoped>
.misebox-card-specimens {
  display: grid;
  min-width: 0;
  width: 100%;
  max-width: 72rem;
  grid-template-columns: minmax(0, 1fr);
  grid-auto-flow: dense;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 8) calc(var(--spacing) * 4)
    calc(var(--spacing) * 16);
  margin-inline: auto;
  overflow-x: clip;
}

.misebox-card-specimens__header {
  grid-column: 1 / -1;
  padding-block: calc(var(--spacing) * 6) calc(var(--spacing) * 8);
}

.misebox-card-specimens__header h1 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-4xl), 10vw, var(--text-6xl));
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: var(--leading-none);
}

.misebox-card-specimens__search {
  display: flex;
  width: min(100%, 28rem);
  min-height: 3.25rem;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 6);
  padding-inline: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
  color: var(--ui-text-muted);
}

.misebox-card-specimens__search:focus-within {
  border-color: color-mix(in srgb, var(--ui-primary) 56%, var(--ui-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary) 16%, transparent);
}

.misebox-card-specimens__search input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ui-text-highlighted);
}

.misebox-card-specimens__search input::placeholder {
  color: var(--ui-text-dimmed);
}

.misebox-card-specimens__search button {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 2);
}

.misebox-card-specimens__search button:hover {
  background: var(--ui-bg-muted);
  color: var(--ui-text-highlighted);
}

.misebox-card-specimens > section {
  display: contents;
}

.misebox-card-specimens > section > :first-child {
  display: none;
}

.misebox-card-specimens__grid {
  display: contents;
}

.misebox-card-specimens__grid > :nth-child(1) {
  order: var(--misebox-card-seed);
}

.misebox-card-specimens__grid > :nth-child(2) {
  order: calc(var(--misebox-card-seed) + 25);
}

.misebox-card-specimens__grid > :nth-child(3) {
  order: calc(var(--misebox-card-seed) + 50);
}

.misebox-card-specimens__grid > :nth-child(4) {
  order: calc(var(--misebox-card-seed) + 75);
}

.misebox-card-specimens__grid > :nth-child(5) {
  order: calc(var(--misebox-card-seed) + 100);
}

.misebox-card-specimens > section[aria-labelledby="cards-app"] {
  --misebox-card-family: "App · ";
  --misebox-card-seed: 18;
}

.misebox-card-specimens > section[aria-labelledby="cards-place"] {
  --misebox-card-family: "Place · ";
  --misebox-card-seed: 14;
}

.misebox-card-specimens > section[aria-labelledby="cards-kitchen"] {
  --misebox-card-family: "Kitchen · ";
  --misebox-card-seed: 24;
}

.misebox-card-specimens > section[aria-labelledby="cards-menu"] {
  --misebox-card-family: "Menu · ";
  --misebox-card-seed: 11;
}

.misebox-card-specimens > section[aria-labelledby="cards-ingredient"] {
  --misebox-card-family: "Ingredient · ";
  --misebox-card-seed: 7;
}

.misebox-card-specimens > section[aria-labelledby="cards-chef"] {
  --misebox-card-family: "Chef · ";
  --misebox-card-seed: 20;
}

.misebox-card-specimens > section[aria-labelledby="cards-customer"] {
  --misebox-card-family: "Customer · ";
  --misebox-card-seed: 4;
}

.misebox-card-specimens > section[aria-labelledby="cards-driver"] {
  --misebox-card-family: "Driver · ";
  --misebox-card-seed: 16;
}

.misebox-card-specimens > section[aria-labelledby="cards-dish"] {
  --misebox-card-family: "Dish · ";
  --misebox-card-seed: 1;
}

.misebox-card-specimens > section[aria-labelledby="cards-operation-ingredients"] {
  --misebox-card-family: "Kitchen ingredient · ";
  --misebox-card-seed: 13;
}

.misebox-card-specimens > section[aria-labelledby="cards-mise"] {
  --misebox-card-family: "Mise · ";
  --misebox-card-seed: 6;
}

.misebox-card-specimens > section[aria-labelledby="cards-recipe"] {
  --misebox-card-family: "Recipe · ";
  --misebox-card-seed: 10;
}

.misebox-card-specimens > section[aria-labelledby="cards-kitchen-supplier"] {
  --misebox-card-family: "Kitchen supplier · ";
  --misebox-card-seed: 25;
}

.misebox-card-specimens > section[aria-labelledby="cards-supplier"] {
  --misebox-card-family: "Supplier · ";
  --misebox-card-seed: 3;
}

.misebox-card-specimens > section[aria-labelledby="cards-supplier-item"] {
  --misebox-card-family: "Supplier item · ";
  --misebox-card-seed: 21;
}

.misebox-card-specimens > section[aria-labelledby="cards-agent"] {
  --misebox-card-family: "Agent · ";
  --misebox-card-seed: 8;
}

.misebox-card-specimens > section[aria-labelledby="cards-job"] {
  --misebox-card-family: "Job · ";
  --misebox-card-seed: 17;
}

.misebox-card-specimens > section[aria-labelledby="cards-professional"] {
  --misebox-card-family: "Professional · ";
  --misebox-card-seed: 12;
}

.misebox-card-specimens > section[aria-labelledby="cards-kiosk"] {
  --misebox-card-family: "Kiosk · ";
  --misebox-card-seed: 1;
}

.misebox-kitchen-cell-group {
  display: grid;
  width: min(100%, 32rem);
  margin-inline: auto;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 2);
}

.misebox-ingredient-pill-group {
  display: grid;
  width: 100%;
  gap: var(--spacing);
}

@media (min-width: 48rem) {
  .misebox-card-specimens {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-inline: calc(var(--spacing) * 8);
  }
}
</style>
