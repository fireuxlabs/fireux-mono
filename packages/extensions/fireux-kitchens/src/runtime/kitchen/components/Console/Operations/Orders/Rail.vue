<template>
  <UCard
    as="section"
    variant="soft"
    class="orders-rail"
    :data-order-rail="label.toLowerCase().replace(/\s+/g, '-')"
  >
    <template #header>
      <header class="orders-rail__header">
        <div class="orders-rail__identity">
          <h2 class="orders-rail__title">
            {{ label }}
          </h2>
        </div>

        <UBadge :color="accent" variant="soft" size="sm">
          {{ count }}
        </UBadge>
      </header>
    </template>

    <div v-if="count" class="orders-rail__content">
      <slot />
    </div>

    <UAlert v-else color="neutral" variant="soft" :title="emptyLabel" />
  </UCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  accent?: 'neutral' | 'primary' | 'success' | 'warning'
  count: number
  emptyLabel: string
  label: string
}>(), {
  accent: 'neutral',
})

</script>

<style scoped>
.orders-rail {
  min-width: 0;
}

.orders-rail__header,
.orders-rail__identity {
  display: flex;
  align-items: center;
}

.orders-rail__header {
  min-height: 1.75rem;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.orders-rail__identity {
  min-width: 0;
  gap: calc(var(--spacing) * 2);
}

.orders-rail__title {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.orders-rail__content {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
}

</style>
