// richies-reinigung layout/default
<template>
  <ClientOnly>
    <CleanboxDefault />
  </ClientOnly>
  <!-- Client-only to avoid SSR-time useCurrentUser calls from tenant default -->
</template>
