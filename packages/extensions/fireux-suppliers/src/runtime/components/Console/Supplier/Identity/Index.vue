<template>
  <section class="console-surface">
    <ConsoleSupplierIdentityRead />

    <ClientOnly>
      <div
        v-if="selectedSupplier && canWrite"
        class="console-profile__section"
      >
        <ConsoleSupplierIdentityEdit />
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleIdentity } from '../../../../composables/fireux/console/supplier/identity/useSupplierConsoleIdentity'

const { selectedSupplier, canWrite } = useSupplierConsoleIdentity()
</script>
