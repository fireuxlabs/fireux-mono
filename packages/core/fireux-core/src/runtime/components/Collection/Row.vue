<template>
  <component :is="as" class="collection-row py-3">
    <div class="collection-row__content"><slot /></div>
    <div v-if="$slots.value" class="collection-row__value">
      <slot name="value" />
    </div>
    <div v-if="$slots.actions" class="collection-row__actions">
      <slot name="actions" />
    </div>
  </component>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ as?: 'article' | 'div' | 'li' }>(), {
  as: 'article',
})
</script>
<style scoped>
.collection-row {
  display: flex;
  align-items: center;
  gap: var(--collection-row-gap, 0.5rem);
  min-width: 0;
}
.collection-row__content {
  flex: 1;
  min-width: 0;
}
.collection-row__value {
  flex: 0 0 var(--collection-row-value-width, auto);
  min-width: 0;
  text-align: right;
}
.collection-row__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  flex: 0 0 var(--collection-row-actions-width, auto);
}
</style>
