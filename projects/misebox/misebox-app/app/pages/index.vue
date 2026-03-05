<template>
  <EffectsSteam />
  <LandingHeroSection
    app-name="misebox"
    big-personality="Command <br> the Line"
    headline="Operating System for Kitchens"
    hero-primary-line="Misebox is the <strong>operating system</strong> for <a href='/kitchens'><strong>kitchens</strong></a> and <a href='/professionals'><strong>professionals</strong></a>.<br>Run your kitchen with connected <strong>ops</strong>, <strong>team</strong>, and <strong>service</strong>.<br>Publish <a href='/jobs'><strong>roles</strong></a> and connect with professionals across the <strong>Misebox ecosystem</strong>."
    primary-cta-label="Get started"
    secondary-cta-label="Browse professionals"
    secondary-cta-to="/professionals"
    console-bridge-line="One <strong>connected console</strong> to run service, grow your team, and keep execution tight."
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
    'Run your kitchen from one platform - managing menus, recipes, dishes, prep tasks, team coordination, and recruitment.',
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
