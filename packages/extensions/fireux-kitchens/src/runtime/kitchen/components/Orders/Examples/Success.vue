<template>
  <UCard data-testid="success-preview">
    <div class="fx-card-body-stack">
      <div>
        <UIcon :name="view.icon" aria-hidden="true" />
      </div>
      <h3>{{ view.title }}</h3>
      <p>{{ view.message }}</p>
      <UButton :label="view.action" block />
    </div>
  </UCard>
</template>
<script setup lang="ts">
defineProps<{
  view: { title: string; message: string; action: string; icon: string }
}>()
</script>
