<script setup lang="ts"></script>

<template>
  <div class="page">
    <EffectsFloatingParticles />
    <LogoType size="hero" />
    <LandingHero
      title="Clean. Organize. Thrive."
      subtitle="Transform your workspace and digital life with powerful organization tools"
    />
    <LandingFeatureGrid
      :features="[
        {
          icon: 'mdi:folder-multiple',
          title: 'Smart Organization',
          description:
            'Automatically categorize and organize your files and projects',
        },
        {
          icon: 'mdi:clock-check',
          title: 'Time Management',
          description: 'Track time, set goals, and boost your productivity',
        },
        {
          icon: 'mdi:chart-line',
          title: 'Progress Analytics',
          description: 'Visualize your organizational improvements over time',
        },
        {
          icon: 'mdi:team',
          title: 'Team Collaboration',
          description: 'Share organizational systems with your team',
        },
      ]"
    />
    <LandingCTA
      title="Ready to Get Organized?"
      subtitle="Join thousands who have transformed their workflow"
      button-text="Start Organizing"
    />
  </div>
</template>

<style scoped>
.page {
  gap: var(--space-16);
}
@media (min-width: 768px) {
  .page {
    gap: var(--space-24);
    max-width: 1000px;
  }
}
</style>
