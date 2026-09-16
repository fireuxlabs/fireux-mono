<template>
  <UCard>
    <div class="workspace-single-card">
      <div class="workspace-single-card__avatar"><slot name="avatar" /></div>
      <div class="workspace-single-card__identity">
        <h2 class="workspace-single-card__name">{{ name }}</h2>
        <p v-if="description" class="workspace-single-card__description">
          {{ description }}
        </p>
        <div v-if="$slots.default" class="workspace-single-card__preview">
          <slot />
        </div>
      </div>
      <UButton
        class="workspace-single-card__open"
        :to="to"
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        :aria-label="`Configure ${name}`"
        @click="$emit('open')"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
defineProps<{ name: string; to?: string; description?: string }>()
defineEmits<{ open: [] }>()
</script>
<style scoped>
.workspace-single-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: calc(var(--spacing) * 4);
}
.workspace-single-card__avatar {
  display: flex;
  padding-top: calc(var(--spacing) * 0.5);
}
.workspace-single-card__name {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--text-lg--line-height);
}
.workspace-single-card__open {
  align-self: center;
}
.workspace-single-card__identity {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
  overflow-wrap: anywhere;
}
.workspace-single-card__description {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.workspace-single-card__preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
</style>
