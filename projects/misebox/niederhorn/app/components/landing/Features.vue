<template>
  <section class="features">
    <header class="features__header">
      <h2>What crews love</h2>
      <p>
        Everything you need for consistent alpine service; nothing that slows
        you down.
      </p>
    </header>

    <div class="features__grid">
      <article
        v-for="feature in features"
        :key="feature.title"
        class="features__card"
      >
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.copy }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface FeatureItem {
  title: string
  copy: string
}

defineProps<{ features: FeatureItem[] }>()

defineOptions({ name: 'NiederhornLandingFeatures' })
</script>

<style scoped>
.features {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.features__header {
  max-width: 36rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.features__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}

.features__card {
  border-radius: 1rem;
  border: 1px solid var(--ui-border-subtle);
  background: white;
  padding: 1.5rem;
  box-shadow: var(--ui-shadow-xs);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.features__card h3 {
  font-weight: 600;
  font-size: 1.05rem;
}

.features__card p {
  color: var(--ui-text-muted);
  font-size: 0.95rem;
}
</style>
