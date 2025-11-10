<template>
  <section class="solutions">
    <header class="solutions__header">
      <div class="solutions__eyebrow">Signature stations</div>
      <h2 class="solutions__title">Curated for alpine hospitality</h2>
      <p class="solutions__copy">
        Niederhorn kitchens are designed for high altitude service with zero-compromise mise en place. Pick from ready-to-run stations or tailor your own with our production planners.
      </p>
    </header>

    <div class="solutions__grid">
      <article v-for="card in cards" :key="card.title" class="solutions__card">
        <div class="solutions__card-icon">
          <UIcon :name="card.icon" />
        </div>
        <h3>{{ card.title }}</h3>
        <p>{{ card.copy }}</p>
        <ULink :to="card.href" class="solutions__cta">
          {{ card.cta }}
          <UIcon name="i-heroicons-arrow-up-right-20-solid" />
        </ULink>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface SolutionsCard {
  title: string
  copy: string
  cta: string
  href: string
  icon: string
}

defineProps<{ cards: SolutionsCard[] }>()

defineOptions({ name: 'NiederhornLandingSolutions' })
</script>

<style scoped>
.solutions {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3rem);
}

.solutions__header {
  max-width: 48rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.solutions__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}

.solutions__title {
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 700;
}

.solutions__copy {
  font-size: 1rem;
  color: var(--ui-text-muted);
}

.solutions__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

.solutions__card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid var(--ui-border-subtle);
  border-radius: 1.25rem;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--ui-shadow-sm);
}

.solutions__card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at top, #0f172a, #020617);
  color: #f8fafc;
}

.solutions__cta {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}
</style>
