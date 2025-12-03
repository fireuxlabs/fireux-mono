<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/Profile/Edit/Profile.vue -->
<template>
  <section class="space-y-6">
    <slot name="core" />
    <slot v-if="isTenant" name="app" />
  </section>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

const { isTenant } = useFireUXConfig()
</script>
