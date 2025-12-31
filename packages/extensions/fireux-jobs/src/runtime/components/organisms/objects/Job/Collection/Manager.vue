<template>
  <OrganismsObjectsJobCollectionProvider v-slot="slotProps">
    <slot v-bind="slotProps">
      <OrganismsObjectsJobSectionsAgentCollection
        v-if="slotProps.showAgentCollection"
      />
      <OrganismsObjectsJobSectionsGlobalCollection />
    </slot>
  </OrganismsObjectsJobCollectionProvider>
</template>

