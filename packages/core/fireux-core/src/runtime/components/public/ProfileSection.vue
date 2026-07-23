<template>
  <UPageCard
    as="section"
    variant="outline"
    class="public-profile-section rounded-3xl shadow-sm"
    :data-compact="compact || undefined"
    :ui="sectionUi"
  >
    <div class="public-profile-section__header">
      <PublicProfileSectionHeading
        :compact="compact"
        :eyebrow="eyebrow"
        :icon="icon"
        :title="title"
      />

      <div v-if="$slots.meta" class="public-profile-section__meta">
        <slot name="meta" />
      </div>
    </div>

    <div class="public-profile-section__body">
      <slot />
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'PublicProfileSection' })

const props = withDefaults(
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

const sectionUi = computed(() => ({
  container: props.compact ? 'p-5 sm:p-5' : 'p-5 sm:p-7',
}))
</script>

<style scoped>
.public-profile-section__header {
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  justify-content: space-between;
}

.public-profile-section__meta {
  flex: none;
}

.public-profile-section__body {
  margin-top: calc(var(--spacing) * 6);
  min-width: 0;
}

.public-profile-section[data-compact='true'] .public-profile-section__body {
  margin-top: calc(var(--spacing) * 5);
}
</style>
