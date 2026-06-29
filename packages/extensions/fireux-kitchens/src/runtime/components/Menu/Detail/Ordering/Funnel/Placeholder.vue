<template>
  <div class="menu-order-panel__details">
    <p class="menu-order-panel__copy">hello world</p>

    <FunnelActions
      action-label="Continue"
      @back="$emit('back')"
      @action="$emit('continue')"
    />
  </div>
</template>

<script setup lang="ts">
import FunnelActions from './Actions.vue'

defineEmits<{
  (event: 'back'): void
  (event: 'continue'): void
}>()
</script>
