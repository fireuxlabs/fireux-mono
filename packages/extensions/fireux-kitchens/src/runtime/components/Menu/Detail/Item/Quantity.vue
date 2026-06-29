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
