<template>
  <div class="landing-page">
    <EffectsStars />

    <LandingShell>
      <template #left>
        <LandingHero
          :title="heroContent.title"
          :accent="heroContent.accent"
          :paragraph="heroContent.paragraph"
          :badges="heroContent.badges"
          :primary="heroContent.primary"
          :secondary="heroContent.secondary"
          :bullets="heroContent.bullets"
        />
      </template>

      <template #right>
        <LandingQuickPeek :items="quickPeek" :footer-badge="quickPeekFooter" />
      </template>
    </LandingShell>

    <LandingSolutions :cards="solutionCards" />

    <LandingFuel
      :meters="fuelMeters"
      @bookTour="handleBookTour"
      @downloadSpecs="handleDownloadSpecs"
    />

    <LandingFeatures :features="featureList" />

    <LandingSkillsIcons :skills="skillTags" />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

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
  title: 'Niederhorn — MiseBox Kitchens',
  description:
    'Alpine hospitality kitchens that sync mise en place, production, and service windows with MiseBox.',
})

const heroContent = {
  title: 'Niederhorn Kitchens',
  accent: 'Alpine mise en place, on tempo',
  paragraph:
    'Run altitude-ready production, sync pantry replenishment, and keep every <span class="text-primary">service window</span> prepared before the gondola arrives.',
  badges: [
    { src: '/img/misebox-logo.svg', alt: 'MiseBox' },
    { src: '/img/firebase-white.png', alt: 'Firebase' },
  ],
  primary: { label: 'Open kitchen console', to: '/apps' },
  secondary: { label: 'Invite brigade', to: '/users' },
  bullets: [
    {
      icon: 'i-lucide-thermometer-sun',
      text: 'Altitude calibrated prep plans',
    },
    { icon: 'i-lucide-gauge', text: 'Real-time production meters' },
    { icon: 'i-lucide-truck', text: 'Supply runs synced to gondola drops' },
    { icon: 'i-lucide-sparkles', text: 'Sanitation routines automated' },
  ],
}

const quickPeek = [
  {
    title: "Tonight's service",
    copy: 'Plated menu locked. 6 covers flagged VIP.',
    icon: 'i-lucide-calendar-clock',
  },
  {
    title: 'Pantry hold',
    copy: 'Protein pulls complete · pastry freezer restocked.',
    icon: 'i-lucide-ice-cream',
  },
  {
    title: 'Brigade',
    copy: 'Sous, garde manger, and steward synced to tasks.',
    icon: 'i-lucide-users',
  },
]

const quickPeekFooter = 'MiseBox · Firestore · IoT sensors'

const solutionCards = [
  {
    title: 'Station planner',
    copy: 'Configure pass, garde manger, and pastry to match your service.',
    href: '/stations',
    cta: 'Plan stations',
    icon: 'i-lucide-layers',
  },
  {
    title: 'Production log',
    copy: 'Audit prep yields, variance, and temp logs straight from the line.',
    href: '/production',
    cta: 'View log',
    icon: 'i-lucide-clipboard-check',
  },
  {
    title: 'Crew roster',
    copy: 'Update roles, availability, and onboarding for each service week.',
    href: '/users',
    cta: 'Manage crew',
    icon: 'i-lucide-users',
  },
]

const fuelMeters = [
  { label: 'Prep complete', value: 86, icon: 'i-lucide-knife' },
  { label: 'Service readiness', value: 92, icon: 'i-lucide-badge-check' },
  { label: 'Inventory sync', value: 74, icon: 'i-lucide-package-search' },
]

const featureList = [
  {
    title: 'Altitude smart timers',
    copy: 'Automatic adjustments for simmer, proof, and rest at 1960 m.',
  },
  {
    title: 'Prep-to-pass sync',
    copy: 'Line dashboards align mise en place with pass tickets in real time.',
  },
  {
    title: 'Supplier cadence',
    copy: 'Purchasing schedules anchored to lift and road access windows.',
  },
  {
    title: 'Safety + HACCP logs',
    copy: 'Document temp checks, sanitation, and hold times without clipboards.',
  },
]

const skillTags = [
  { label: 'Sous chef', icon: 'i-lucide-sparkles' },
  { label: 'Garde manger', icon: 'i-lucide-leaf' },
  { label: 'Pastry lead', icon: 'i-lucide-cookie' },
  { label: 'Steward', icon: 'i-lucide-droplets' },
  { label: 'Sommelier', icon: 'i-lucide-wine' },
  { label: 'Service captain', icon: 'i-lucide-badge-check' },
]

const handleBookTour = () => {
  router.push('/contact')
}

const handleDownloadSpecs = () => {
  router.push('/docs/niederhorn-stations')
}
</script>

<style scoped>
.landing-page {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: clamp(2.5rem, 6vw, 4rem);
  padding: clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 5vw, 3rem)
    clamp(4rem, 8vw, 6rem);
}
</style>
