<template>
  <EffectsSteam />
  <LandingHeroSection
    app-name="misebox"
    big-personality="Service-Ready"
    headline="Kitchen Control"
    hero-primary-line="Misebox is the <strong>operating system</strong> for kitchens and professionals. Run your kitchen from one <strong>connected console</strong> for ops, team, and service essentials. When you need staff, publish roles and connect with professionals already in the ecosystem."
    primary-cta-label="Get started"
    secondary-cta-label="Browse professionals"
    secondary-cta-to="/professionals"
    console-bridge-line="One connected console to run service, grow your team, and keep <strong>execution tight</strong>."
    :hero-bullets="heroBullets"
    :right-panel-items="rightPanelItems"
  >
    <template #get-started>
      <LandingGetStarted />
    </template>

    <template #apps>
      <LandingApps />
    </template>

  </LandingHeroSection>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Misebox — Kitchen operations workspace',
  description:
    'A workspace for kitchens to manage daily operations, connect with professionals, and publish roles when you need to grow your team.',
})

const heroBullets = [
  'Post jobs and preview candidates',
  'Professional profiles instead of CVs',
  'Kitchen pages that attract the right people',
  'Contact candidates directly',
]

const rightPanelItems = [
  {
    title: 'Job posts',
    description: 'Publish fixed or temporary roles.',
    icon: 'i-lucide-briefcase',
  },
  {
    title: 'Professional profiles',
    description: 'Showcase your experience or browse the professional database.',
    icon: 'i-lucide-user',
  },
  {
    title: 'Kitchen profiles',
    description: 'Showcase your kitchen, menu, and culture.',
    icon: 'i-lucide-chef-hat',
  },
]
</script>
