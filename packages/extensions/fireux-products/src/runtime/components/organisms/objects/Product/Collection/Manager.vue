<template>
  <OrganismsObjectsProductCollectionProvider v-slot="slotProps">
    <slot v-bind="slotProps">
      <OrganismsObjectsProductCollectionView :products="slotProps.products" />
    </slot>
  </OrganismsObjectsProductCollectionProvider>
</template>

