<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Identity</div>
      </div>
    </template>

    <p class="console-card-header__description">
      {{ hello || 'No value set' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  hello: string
}>()
</script>
