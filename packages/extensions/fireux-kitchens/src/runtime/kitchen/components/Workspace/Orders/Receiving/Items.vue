<template>
  <div class="receiving-items">
    <p v-for="line in lines" :key="line.id" class="receiving-items__line">
      <UBadge color="primary" variant="soft" size="sm">
        {{ line.quantity }}×
      </UBadge>
      <strong>{{ line.label }}</strong>
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'WorkspaceKitchenOrdersReceivingItems' })

defineProps<{
  lines: Array<{
    id: string
    label: string
    quantity: number
  }>
}>()
</script>

<style scoped>
.receiving-items {
  display: grid;
  gap: var(--spacing);
}

.receiving-items__line {
  display: flex;
  align-items: center;
  margin: 0;
  gap: calc(var(--spacing) * 2);
}
</style>
