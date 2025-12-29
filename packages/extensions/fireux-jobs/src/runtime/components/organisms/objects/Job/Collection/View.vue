<template>
  <OrganismsObjectsJobCollectionManager v-slot="{ showAgentCollection }">
    <OrganismsObjectsJobSectionsAgentCollection v-if="showAgentCollection" />
    <OrganismsObjectsJobSectionsGlobalCollection />
  </OrganismsObjectsJobCollectionManager>
</template>
