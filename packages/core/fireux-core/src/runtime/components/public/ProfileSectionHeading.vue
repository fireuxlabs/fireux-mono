<template>
  <div
    class="public-profile-section-heading"
    :data-compact="compact || undefined"
  >
    <div
      class="public-profile-section-heading__icon"
      aria-hidden="true"
    >
      <UIcon :name="icon" />
    </div>
    <div class="min-w-0">
      <p class="fx-type-label">{{ eyebrow }}</p>
      <h2 :class="compact ? 'fx-type-card-title' : 'fx-type-card-heading'">
        {{ title }}
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PublicProfileSectionHeading' })

withDefaults(
  defineProps<{
    compact?: boolean
    eyebrow: string
    icon: string
    title: string
  }>(),
  {
    compact: false,
  }
)
</script>

<style scoped>
.public-profile-section-heading {
  align-items: center;
  display: flex;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}

.public-profile-section-heading__icon {
  align-items: center;
  background: color-mix(
    in srgb,
    var(--fx-profile-accent, var(--ui-primary)) 12%,
    transparent
  );
  border-radius: calc(var(--ui-radius) * 3);
  color: var(--fx-profile-accent, var(--ui-primary));
  display: flex;
  flex: none;
  height: calc(var(--spacing) * 10);
  justify-content: center;
  width: calc(var(--spacing) * 10);
}

.public-profile-section-heading__icon :deep(svg) {
  height: calc(var(--spacing) * 5);
  width: calc(var(--spacing) * 5);
}

.public-profile-section-heading[data-compact='true']
  .public-profile-section-heading__icon {
  height: calc(var(--spacing) * 9);
  width: calc(var(--spacing) * 9);
}

.public-profile-section-heading[data-compact='true']
  .public-profile-section-heading__icon
  :deep(svg) {
  height: calc(var(--spacing) * 4);
  width: calc(var(--spacing) * 4);
}

.public-profile-section-heading h2 {
  margin-top: calc(var(--spacing) * 0.5);
}
</style>
