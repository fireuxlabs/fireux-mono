<template>
  <section class="fuel">
    <header>
      <h2>Ready to extend?</h2>
      <p>Swap in real tenant assets once you are ready to go live.</p>
    </header>
    <div class="fuel__grid">
      <article v-for="step in steps" :key="step.title" class="fuel__card">
        <h3>{{ step.title }}</h3>
        <p>{{ step.copy }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    title: '1 · Theme',
    copy: 'Update runtime colors and branding in tenant config.',
  },
  {
    title: '2 · Members',
    copy: 'Invite teammates by adding them to apps/{appId}/users.',
  },
  {
    title: '3 · Objects',
    copy: 'Introduce domain models when you are ready for CRUD.',
  },
]

defineOptions({ name: 'TenantLandingFuel' })
</script>

<style scoped>
.fuel {
  padding: clamp(2rem, 6vw, 3rem) 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fuel header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fuel header h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  font-weight: 700;
}

.fuel header p {
  color: var(--ui-text-muted);
}

.fuel__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.fuel__card {
  border-radius: var(--radius-xl);
  border: 1px dashed var(--ui-border-subtle);
  padding: 1.25rem;
  background: var(--ui-surface-subtle);
}

.fuel__card h3 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.fuel__card p {
  color: var(--ui-text-muted);
}
</style>
