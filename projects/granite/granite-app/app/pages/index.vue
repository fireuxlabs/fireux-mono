<template>
  <EffectsHexagons />
  <LandingHeroSection
    app-name="granite"
    big-personality="Rock Solid"
    headline="Portfolio Control"
    hero-primary-line="Granite is the <a href='/get-started'><strong>operating system</strong></a> for landlords, agencies and portfolio managers. Oversee properties, compliance exposure, documents, incidents, and financial signals from one <a href='/console/portfolio'><strong>structured portfolio console</strong></a>."
    primary-cta-label="Get started"
    secondary-cta-label="Browse portfolios"
    secondary-cta-to="/portfolios"
    console-bridge-line="<strong>Branch-grade</strong> portfolio oversight with <strong>audit-ready</strong> records and clear accountability."
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
  title: 'Granite — Rock solid property portfolio control',
  description:
    'A branch console for structured oversight across client portfolios, properties, compliance, documents, and finance signals.',
})

const heroBullets = [
  'Compliance oversight across every managed property',
  'Documents organised by client portfolio and asset',
  'Incidents and follow-ups tracked with clear ownership',
  'Finance and advisory signals surfaced at portfolio level',
]

const rightPanelItems = [
  {
    title: 'Portfolios',
    description: 'One client portfolio with many properties.',
    icon: 'i-lucide-layers',
  },
  {
    title: 'Compliance',
    description: 'Obligations, evidence, and exposure signals.',
    icon: 'i-lucide-shield-check',
  },
  {
    title: 'Incidents',
    description: 'Repairs, issues, and follow-ups with ownership.',
    icon: 'i-lucide-alert-triangle',
  },
]
</script>
