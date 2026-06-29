<template>
  <div class="menu-item__quantity">
    <template v-if="quantity">
      <UButton
        size="xs"
        color="neutral"
        variant="soft"
        icon="i-lucide-minus"
        :aria-label="`Remove ${label}`"
        @click="$emit('remove')"
      />
      <span>{{ quantity }}</span>
    </template>

    <UButton
      size="xs"
      color="neutral"
      variant="soft"
      icon="i-lucide-plus"
      :aria-label="`Add ${label}`"
      @click="$emit('add')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  quantity: number
}>()

defineEmits<{
  (event: 'add'): void
  (event: 'remove'): void
}>()
</script>

<style scoped>
.menu-item__quantity {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.menu-item__quantity span {
  min-width: 1.5rem;
  color: var(--menu-primary);
  font-size: 0.9rem;
  font-weight: 900;
  text-align: center;
}
</style>
