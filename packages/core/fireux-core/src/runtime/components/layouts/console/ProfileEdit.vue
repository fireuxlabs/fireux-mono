<!-- packages/core/fireux-core/src/runtime/components/layouts/console/ProfileEdit.vue -->
<template>
  <section class="min-w-0">
    <div class="min-w-0 panels-masonry__item mb-10">
      <slot name="preview" />
    </div>
    <div class="min-w-0 panels-masonry__item mb-10">
      <slot name="core" />
    </div>
    <div v-if="isTenant" class="min-w-0 panels-masonry__item mb-10">
      <slot name="app" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig';

const { isTenant } = useFireUXConfig()
</script>
