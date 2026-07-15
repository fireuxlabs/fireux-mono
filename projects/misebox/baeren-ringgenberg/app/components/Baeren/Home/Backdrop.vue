<template>
  <div class="baeren-home-backdrop" aria-hidden="true">
    <img :src="backdrop.src" alt="">
  </div>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../../../config/content.config'

defineOptions({ name: 'BaerenHomeBackdrop' })

const backdrop = baerenRinggenbergContent.assets.backdrop
</script>

<style scoped>
.baeren-home-backdrop {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--baeren-forest);
}

.baeren-home-backdrop img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.baeren-home-backdrop img {
  display: block;
  object-fit: cover;
  object-position: center;
}

@media (min-width: 56rem) {
  .baeren-home-backdrop {
    grid-area: 1 / 1;
    position: absolute;
    inset: 0;
    aspect-ratio: auto;
  }
}
</style>
