<template>
  <section class="space-y-4">
    <CompanyClaimPanel :company="company" :id="id" />
  </section>
</template>

<script setup lang="ts">
import type { CompanyHydrated } from '../../composables/fireux/firestore/company/fetch/types'

defineProps<{
  company: CompanyHydrated | null
  id: string
}>()
</script>
