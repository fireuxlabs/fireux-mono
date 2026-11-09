<template>
  <UPage>
    <UPageHeader
      title="Misebox Cards"
      description="Examples of the real domain Cards used by this App."
    />
    <UPageBody>
      <UPageCard
        as="section"
        icon="i-lucide-map-pinned"
        description="fireux-places · Place/Cards"
        aria-labelledby="cards-place"
      >
        <template #title><h2 id="cards-place">Place</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Place" label="Cell">
            <PlaceCardsCell v-bind="placeCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Place" label="Pill">
            <PlaceCardsPill v-bind="placePill" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Place" label="Preview">
            <PlaceCardsPreview v-bind="placePreview" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-cooking-pot"
        description="fireux-kitchens · Kitchen/Cards"
        aria-labelledby="cards-kitchen"
      >
        <template #title><h2 id="cards-kitchen">Kitchen</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Kitchen" label="Pill">
            <KitchenCardsPill v-bind="kitchenPill" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Kitchen" label="Preview">
            <KitchenCardsPreview v-bind="kitchenPreview" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-notebook-tabs"
        description="fireux-kitchens · Menu/Cards"
        aria-labelledby="cards-menu"
      >
        <template #title><h2 id="cards-menu">Menu</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Menu" label="Cell">
            <MenuCardsCell :menu="menu" :route-scope="routeScope" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Menu" label="Pill">
            <MenuCardsPill :menu="menu" :route-scope="routeScope" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Menu" label="Preview">
            <MenuCardsPreview :menu="menu" :route-scope="routeScope" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-wheat"
        description="fireux-kitchens · Ingredient/Cards"
        aria-labelledby="cards-ingredient"
      >
        <template #title><h2 id="cards-ingredient">Ingredient</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Ingredient" label="Cell">
            <IngredientCardsCell v-bind="ingredientCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Ingredient" label="Preview">
            <IngredientCardsPreview v-bind="ingredientPreview" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-chef-hat"
        description="fireux-kitchens · Chef/Cards"
        aria-labelledby="cards-chef"
      >
        <template #title><h2 id="cards-chef">Chef</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Chef" label="Cell">
            <ChefCardsCell v-bind="chefCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Chef" label="Pill">
            <ChefCardsPill v-bind="chefCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Chef" label="Preview">
            <ChefCardsPreview v-bind="chefCard" specialties-csv="Grill" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-user-round"
        description="fireux-kitchens · Customer/Cards"
        aria-labelledby="cards-customer"
      >
        <template #title><h2 id="cards-customer">Customer</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Customer" label="Cell">
            <CustomerCardsCell v-bind="customerCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Customer" label="Pill">
            <CustomerCardsPill v-bind="customerCard" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-bike"
        description="fireux-kitchens · Driver/Cards"
        aria-labelledby="cards-driver"
      >
        <template #title><h2 id="cards-driver">Driver</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Driver" label="Cell">
            <DriverCardsCell v-bind="driverCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Driver" label="Pill">
            <DriverCardsPill v-bind="driverCard" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-carrot"
        description="fireux-kitchens · kitchen/PrepAndProduction/Ingredients/Cards"
        aria-labelledby="cards-operation-ingredients"
      >
        <template #title
          ><h2 id="cards-operation-ingredients">
            Kitchen ingredient
          </h2></template
        >
        <UPageGrid>
          <DemoCardsSpecimen family="Kitchen ingredient" label="Cell">
            <KitchenPrepAndProductionIngredientsCardsCell
              id="beef-mince"
              to="/"
              title="Ground beef"
              :image-url="ingredientImage"
            />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-warehouse"
        description="fireux-kitchens · kitchen/Suppliers/Cards"
        aria-labelledby="cards-kitchen-supplier"
      >
        <template #title
          ><h2 id="cards-kitchen-supplier">Kitchen supplier</h2></template
        >
        <UPageGrid>
          <DemoCardsSpecimen family="Kitchen supplier" label="Cell">
            <KitchenSuppliersCardsCell v-bind="kitchenSupplierCell" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-truck"
        description="fireux-suppliers · Supplier/Cards"
        aria-labelledby="cards-supplier"
      >
        <template #title><h2 id="cards-supplier">Supplier</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Supplier" label="Cell">
            <SupplierCardsCell v-bind="supplierCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Supplier" label="Pill">
            <SupplierCardsPill v-bind="supplierCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Supplier" label="Preview">
            <SupplierCardsPreview v-bind="supplierCard" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-package-open"
        description="fireux-suppliers · Supplier/Item/Cards"
        aria-labelledby="cards-supplier-item"
      >
        <template #title
          ><h2 id="cards-supplier-item">Supplier item</h2></template
        >
        <UPageGrid>
          <DemoCardsSpecimen family="Supplier item" label="Pill">
            <SupplierItemCardsPill v-bind="supplierItemCard" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-handshake"
        description="fireux-jobs · Agent/Cards"
        aria-labelledby="cards-agent"
      >
        <template #title><h2 id="cards-agent">Agent</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Agent" label="Cell">
            <AgentCardsCell v-bind="agentCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Agent" label="Pill">
            <AgentCardsPill v-bind="agentCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Agent" label="Preview">
            <AgentCardsPreview v-bind="agentCard" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-briefcase-business"
        description="fireux-jobs · Job/Cards"
        aria-labelledby="cards-job"
      >
        <template #title><h2 id="cards-job">Job</h2></template>
        <UPageGrid>
          <DemoCardsSpecimen family="Job" label="Cell">
            <JobCardsCell v-bind="jobCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Job" label="Pill">
            <JobCardsPill v-bind="jobCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Job" label="Preview">
            <JobCardsPreview v-bind="jobCard" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
      <UPageCard
        as="section"
        icon="i-lucide-id-card"
        description="fireux-jobs · Professional/Cards"
        aria-labelledby="cards-professional"
      >
        <template #title
          ><h2 id="cards-professional">Professional</h2></template
        >
        <UPageGrid>
          <DemoCardsSpecimen family="Professional" label="Cell">
            <ProfessionalCardsCell v-bind="professionalCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Professional" label="Pill">
            <ProfessionalCardsPill v-bind="professionalCard" />
          </DemoCardsSpecimen>
          <DemoCardsSpecimen family="Professional" label="Preview">
            <ProfessionalCardsPreview v-bind="professionalCard" />
          </DemoCardsSpecimen>
        </UPageGrid>
      </UPageCard>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
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
} from '~/content/demo-cards'
</script>
