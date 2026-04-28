<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleSupplierIdentityRead :hello="hello" />

    <OrganismsConsoleSupplierIdentityWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsole } from '../../../composables/fireux/app/supplier-console/useSupplierConsole'

const { selectedSupplier, selectedMode } = useSupplierConsole()

const hello = computed(() => String(selectedSupplier.value?.hello ?? '').trim())
const canWrite = computed(() => selectedMode.value !== 'demo')
</script>
