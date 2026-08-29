<template>
  <CardFamilySection
    id="cards-place"
    icon="i-lucide-map-pinned"
    title="Place"
    source="fireux-places · Place/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill', 'preview']"
  >
    <CardSpecimen label="Cell">
      <PlaceCardsCell v-bind="placeCard" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <PlaceCardsPill v-bind="placePill" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <PlaceCardsPreview v-bind="placePreview" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-kitchen"
    icon="i-lucide-cooking-pot"
    title="Kitchen"
    source="fireux-kitchens · Kitchen/Cards"
    :query="query"
    :variant="variant"
    :variants="['pill', 'preview']"
  >
    <CardSpecimen label="Pill">
      <KitchenCardsPill v-bind="kitchenPill" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <KitchenCardsPreview v-bind="kitchenPreview" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-menu"
    icon="i-lucide-notebook-tabs"
    title="Menu"
    source="fireux-kitchens · Menu/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill', 'preview']"
  >
    <CardSpecimen label="Cell" candidate>
      <MenuCardsCell :menu="menu" :route-scope="routeScope" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <MenuCardsPill :menu="menu" :route-scope="routeScope" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <MenuCardsPreview :menu="menu" :route-scope="routeScope" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-ingredient"
    icon="i-lucide-wheat"
    title="Ingredient"
    source="fireux-kitchens · Ingredient/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'preview']"
  >
    <CardSpecimen label="Cell">
      <IngredientCardsCell v-bind="ingredientCard" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <IngredientCardsPreview v-bind="ingredientPreview" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-chef"
    icon="i-lucide-chef-hat"
    title="Chef"
    source="fireux-kitchens · Chef/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill', 'preview']"
  >
    <CardSpecimen label="Cell">
      <ChefCardsCell v-bind="chefCard" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <ChefCardsPill v-bind="chefCard" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <ChefCardsPreview v-bind="chefCard" specialties-csv="Grill" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-customer"
    icon="i-lucide-user-round"
    title="Customer"
    source="fireux-kitchens · Customer/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill']"
  >
    <CardSpecimen label="Cell">
      <CustomerCardsCell v-bind="customerCard" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <CustomerCardsPill v-bind="customerCard" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-driver"
    icon="i-lucide-bike"
    title="Driver"
    source="fireux-kitchens · Driver/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill']"
  >
    <CardSpecimen label="Cell">
      <DriverCardsCell v-bind="driverCard" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <DriverCardsPill v-bind="driverCard" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-operation-ingredients"
    icon="i-lucide-carrot"
    title="Kitchen ingredient"
    source="fireux-kitchens · Workspace/Kitchen/Operations/Ingredients/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell']"
  >
    <CardSpecimen label="Cell" candidate>
      <WorkspaceKitchenIngredientsCardsCell
        id="beef-mince"
        to="/"
        title="Ground beef"
        :image-url="ingredientImage"
      />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-kitchen-supplier"
    icon="i-lucide-warehouse"
    title="Kitchen supplier"
    source="fireux-kitchens · Workspace/Kitchen/Operations/Suppliers/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell']"
  >
    <CardSpecimen label="Cell" candidate>
      <WorkspaceKitchenSuppliersCardsCell v-bind="kitchenSupplierCell" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-supplier"
    icon="i-lucide-truck"
    title="Supplier"
    source="fireux-suppliers · Supplier/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill', 'preview']"
  >
    <CardSpecimen label="Cell">
      <SupplierCardsCell v-bind="supplierCard" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <SupplierCardsPill v-bind="supplierCard" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <SupplierCardsPreview v-bind="supplierCard" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-supplier-item"
    icon="i-lucide-package-open"
    title="Supplier item"
    source="fireux-suppliers · Supplier/Item/Cards"
    :query="query"
    :variant="variant"
    :variants="['pill']"
  >
    <CardSpecimen label="Pill">
      <SupplierItemCardsPill v-bind="supplierItemCard" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-agent"
    icon="i-lucide-handshake"
    title="Agent"
    source="fireux-jobs · Agent/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill', 'preview']"
  >
    <CardSpecimen label="Cell">
      <AgentCardsCell v-bind="agentCard" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <AgentCardsPill v-bind="agentCard" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <AgentCardsPreview v-bind="agentCard" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-job"
    icon="i-lucide-briefcase-business"
    title="Job"
    source="fireux-jobs · Job/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill', 'preview']"
  >
    <CardSpecimen label="Cell">
      <JobCardsCell v-bind="jobCard" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <JobCardsPill v-bind="jobCard" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <JobCardsPreview v-bind="jobCard" />
    </CardSpecimen>
  </CardFamilySection>

  <CardFamilySection
    id="cards-professional"
    icon="i-lucide-id-card"
    title="Professional"
    source="fireux-jobs · Professional/Cards"
    :query="query"
    :variant="variant"
    :variants="['cell', 'pill', 'preview']"
  >
    <CardSpecimen label="Cell">
      <ProfessionalCardsCell v-bind="professionalCard" />
    </CardSpecimen>
    <CardSpecimen label="Pill">
      <ProfessionalCardsPill v-bind="professionalCard" />
    </CardSpecimen>
    <CardSpecimen label="Preview">
      <ProfessionalCardsPreview v-bind="professionalCard" />
    </CardSpecimen>
  </CardFamilySection>
</template>

<script setup lang="ts">
import CardFamilySection from './CardFamilySection.vue'
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
