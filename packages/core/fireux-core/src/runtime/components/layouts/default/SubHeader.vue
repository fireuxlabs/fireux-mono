<template>
  <div class="subheader">
    <UIcon :name="iconTitle.icon" class="subheader-icon" />
    <h2 class="subheader-title">{{ iconTitle.label }}</h2>
  </div>
</template>

<script setup lang="ts">
defineProps<{ iconTitle: { label: string; icon: string } }>()
</script>

<style scoped>
.subheader {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  background-color: var(--ui-bg);
}

.subheader-icon {
  font-size: 1.2rem;
}

.subheader-title {
  font-size: 1.2rem;
  font-weight: 600;
}
</style>
