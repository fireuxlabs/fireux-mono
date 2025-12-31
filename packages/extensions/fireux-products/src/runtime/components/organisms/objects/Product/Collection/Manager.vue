<template>
  <OrganismsObjectsProductCollectionProvider v-slot="slotProps">
    <slot v-bind="slotProps">
      <OrganismsObjectsProductCardsCollectionView :products="slotProps.products" />
    </slot>
  </OrganismsObjectsProductCollectionProvider>
</template>

