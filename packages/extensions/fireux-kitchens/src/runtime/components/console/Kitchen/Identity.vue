<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenIdentityRead />

    <OrganismsConsoleKitchenIdentityWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIdentity } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleIdentity'

const { canWrite } = useKitchenConsoleIdentity()
</script>
