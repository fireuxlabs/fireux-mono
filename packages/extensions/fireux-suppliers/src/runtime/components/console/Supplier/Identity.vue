<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleSupplierIdentityRead />

    <OrganismsConsoleSupplierIdentityWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleIdentity } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleIdentity'

const { canWrite } = useSupplierConsoleIdentity()
</script>
