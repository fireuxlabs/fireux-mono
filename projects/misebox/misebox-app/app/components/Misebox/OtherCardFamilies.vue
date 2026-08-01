<template>
<MiseboxCardFamilySection
  id="cards-place"
  icon="i-lucide-map-pinned"
  title="Place"
  source="fireux-places · Place/Cards"
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
  :variants="['cell', 'pill', 'preview']"
>
  <MiseboxCardSpecimen label="Cell">
    <ChefCardsCell v-bind="chefCard" />
  </MiseboxCardSpecimen>
  <MiseboxCardSpecimen label="Pill">
    <ChefCardsPill v-bind="chefCard" />
  </MiseboxCardSpecimen>
  <MiseboxCardSpecimen label="Preview">
    <ChefCardsPreview
      v-bind="chefCard"
      specialties-csv="Grill, Mise en place"
    />
  </MiseboxCardSpecimen>
</MiseboxCardFamilySection>

<MiseboxCardFamilySection
  id="cards-customer"
  icon="i-lucide-user-round"
  title="Customer"
  source="fireux-kitchens · Customer/Cards"
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
  :variants="['cell']"
>
  <MiseboxCardSpecimen label="Cell" candidate>
    <ConsoleKitchenOperationsSuppliersCardsCell
      v-bind="kitchenSupplierCell"
    />
  </MiseboxCardSpecimen>
</MiseboxCardFamilySection>

<MiseboxCardFamilySection
  id="cards-supplier"
  icon="i-lucide-truck"
  title="Supplier"
  source="fireux-suppliers · Supplier/Cards"
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
  :query="query"
  :variant="variant"
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
</template>

<script setup lang="ts">
import MiseboxCardFamilySection from './CardFamilySection.vue'
import {
  ingredientImage,
  routeScope,
  placeCard,
  placePill,
  placePreview,
  kitchenPill,
  kitchenPreview,
  menu,
  ingredientCard,
  ingredientPreview,
  chefCard,
  customerCard,
  driverCard,
  miseCell,
  misePill,
  kitchenSupplierCell,
  supplierCard,
  supplierItemCard,
  agentCard,
  jobCard,
  professionalCard,
} from './other-cards-fixtures'

defineProps<{
  query: string
  variant: 'all' | 'cell' | 'pill' | 'preview'
}>()
</script>
