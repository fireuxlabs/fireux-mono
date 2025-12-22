<!-- packages/core/fireux-core/src/runtime/components/layouts/dashboard/ProfileEdit.vue -->
<template>
  <section class="space-y-6">
    <slot name="preview" />
    <slot name="core" />
    <slot v-if="isTenant" name="app" />
  </section>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'

const { isTenant } = useFireUXConfig()
</script>
