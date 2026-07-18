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
  gap: calc(var(--spacing) * 2);
  padding: 0 calc(var(--spacing) * 4);
  background-color: var(--ui-bg);
}

.subheader-icon {
  font-size: var(--text-xl);
}

.subheader-title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
}
</style>
