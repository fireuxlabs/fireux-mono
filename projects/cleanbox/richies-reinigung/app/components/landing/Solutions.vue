<template>
  <section>
    <div class="section-header">
      <h2>Cleaning Solutions for Every Need</h2>
      <p>Professional tools designed for cleaning businesses of all sizes</p>
    </div>
    <div class="grid">
      <UCard
        v-for="solution in solutions"
        :key="solution.title"
        :to="solution.link"
        class="solution-card"
      >
        <template #header>
          <div class="card-header">
            <UIcon :name="solution.icon" class="solution-icon" />
            <h3>{{ solution.title }}</h3>
          </div>
        </template>

        <p>{{ solution.description }}</p>

        <template #footer>
          <UButton variant="soft" size="sm" block>
            {{ solution.buttonText }}
          </UButton>
        </template>
      </UCard>
    </div>
  </section>
</template>

<script setup>
const solutions = [
  {
    title: 'Residential Cleaning',
    description:
      'Manage home cleaning services with automated scheduling and client communication.',
    icon: 'i-lucide-home',
    link: '/residential',
    buttonText: 'Learn More',
  },
  {
    title: 'Commercial Cleaning',
    description:
      'Scale your business with tools for office buildings, retail spaces, and facilities.',
    icon: 'i-lucide-building',
    link: '/commercial',
    buttonText: 'Get Started',
  },
  {
    title: 'Specialized Services',
    description:
      'Carpet cleaning, window washing, post-construction cleanup and more.',
    icon: 'i-lucide-sparkles',
    link: '/specialized',
    buttonText: 'Explore Services',
  },
  {
    title: 'Team Management',
    description:
      'Coordinate staff, track hours, and manage payroll for your cleaning team.',
    icon: 'i-lucide-users',
    link: '/team',
    buttonText: 'Manage Team',
  },
  {
    title: 'Client Portal',
    description:
      'Give clients easy access to booking, billing, and service history.',
    icon: 'i-lucide-user-check',
    link: '/portal',
    buttonText: 'View Portal',
  },
  {
    title: 'Analytics & Reports',
    description:
      'Track performance, revenue, and growth with detailed business insights.',
    icon: 'i-lucide-bar-chart-3',
    link: '/analytics',
    buttonText: 'See Reports',
  },
]
</script>

<style scoped>
.section-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.section-header h2 {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.section-header p {
  font-size: var(--text-lg);
  color: var(--color-gray-600);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.solution-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.solution-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.solution-icon {
  color: var(--color-primary-500);
  font-size: 1.5rem;
}

.card-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0;
}
</style>
