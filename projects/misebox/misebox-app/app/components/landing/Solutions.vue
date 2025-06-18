<template>
  <section>
    <div class="section-header">
      <h2>Kitchen Solutions for Every Operation</h2>
      <p>Professional tools designed for culinary businesses of all scales</p>
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
    title: 'Recipe Management',
    description:
      'Digital recipe cards with cost calculation, scaling, and version control.',
    icon: 'i-lucide-book-open',
    link: '/recipes',
    buttonText: 'Manage Recipes',
  },
  {
    title: 'Inventory Tracking',
    description:
      'Real-time ingredient tracking with automatic reorder points and supplier management.',
    icon: 'i-lucide-package',
    link: '/inventory',
    buttonText: 'Track Inventory',
  },
  {
    title: 'Menu Planning',
    description:
      'Strategic menu design with cost analysis, seasonal planning, and profit optimization.',
    icon: 'i-lucide-clipboard-list',
    link: '/menu-planning',
    buttonText: 'Plan Menus',
  },
  {
    title: 'Kitchen Operations',
    description:
      'Streamline prep schedules, cooking times, and kitchen workflow management.',
    icon: 'i-lucide-chef-hat',
    link: '/operations',
    buttonText: 'Optimize Kitchen',
  },
  {
    title: 'Cost Control',
    description:
      'Monitor food costs, track waste, and analyze profitability by dish and ingredient.',
    icon: 'i-lucide-calculator',
    link: '/cost-control',
    buttonText: 'Control Costs',
  },
  {
    title: 'Team Management',
    description:
      'Coordinate kitchen staff, track certifications, and manage scheduling.',
    icon: 'i-lucide-users',
    link: '/team',
    buttonText: 'Manage Team',
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
