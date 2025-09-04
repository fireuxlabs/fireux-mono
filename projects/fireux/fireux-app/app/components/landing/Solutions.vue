<!-- COMMENT: app/components/landing/Solutions.vue -->
<template>
  <section>
    <div class="grid">
      <UCard
        v-for="solution in solutions"
        :key="solution.title"
        :to="solution.link"
      >
        <template #header>
          <LogoFlame size="small" />
          <h3>{{ solution.title }}</h3>
        </template>

        <p>{{ solution.description }}</p>

        <template #footer>
          <UButton variant="soft">
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
    title: 'Products',
    description: 'Instant business tools, fully hosted and ready to go.',
    link: '/products',
    buttonText: 'Explore Products',
  },
  {
    title: 'White-Label',
    description: 'Rebrand and resell FIReUX products as your own.',
    link: '/whitelabel',
    buttonText: 'Become a Partner',
  },
  {
    title: 'SaaS',
    description:
      'Fully managed, subscription-based applications built for scale.',
    link: '/saas',
    buttonText: 'See SaaS Solutions',
  },
  {
    title: 'Templates',
    description: 'Pre-built software frameworks for developers and startups.',
    link: '/templates',
    buttonText: 'Browse Templates',
  },
  {
    title: 'API-First',
    description: 'Headless & modular, FIReUX integrates with any backend.',
    link: '/api',
    buttonText: 'Explore APIs',
  },
  {
    title: 'Automation',
    description: 'No-code triggers & workflows for seamless business ops.',
    link: '/automation',
    buttonText: 'Set Up Automations',
  },
]
</script>

<style scoped>
/* No styles for now — testing the grid system */
</style>
