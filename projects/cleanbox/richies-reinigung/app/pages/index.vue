<template>
  <div class="landing-page">
    <EffectsBubbles />

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
      @startTour="handleStartTour"
      @downloadPlaybook="handleDownloadPlaybook"
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
  title: 'Richies Reinigung — CleanBox Tenant',
  description:
    'Book recurring cleans, coordinate crews, and surprise clients with spotless routes — powered by CleanBox.',
})

const heroContent = {
  title: 'Richies Reinigung',
  accent: 'Sparkling spaces. Happy clients.',
  paragraph:
    'Keep recurring cleans on schedule, balance crews across city zones, and automate every <span class="text-primary">follow-up</span>. It is the clean sweep for ops leads.',
  badges: [
    { src: '/img/cleanbox-logo.svg', alt: 'CleanBox' },
    { src: '/img/firebase-white.png', alt: 'Firebase' },
  ],
  primary: { label: 'Open booking board', to: '/bookings' },
  secondary: { label: 'Manage clients', to: '/professionals' },
  bullets: [
    {
      icon: 'i-lucide-calendar-check-2',
      text: 'Route-ready scheduling templates',
    },
    { icon: 'i-lucide-map', text: 'Zone-based crew assignments' },
    { icon: 'i-lucide-message-circle', text: 'Automated client updates' },
    { icon: 'i-lucide-droplets', text: 'Inventory tied to job kits' },
  ],
}

const quickPeek = [
  {
    title: 'Routes dispatched',
    copy: '15 stops across Kreis 1–4 · traffic buffer applied.',
    icon: 'i-lucide-route',
  },
  {
    title: 'Crew coverage',
    copy: 'All hands confirmed · 2 floaters on standby.',
    icon: 'i-lucide-users',
  },
  {
    title: 'Client feedback',
    copy: 'NPS 68 · 4 kudos waiting for replies.',
    icon: 'i-lucide-heart-handshake',
  },
]

const quickPeekFooter = 'CleanBox · Firestore · Twilio'

const solutionCards = [
  {
    title: 'Booking board',
    copy: 'Drag-and-drop jobs, lock teams, and keep routes balanced.',
    href: '/bookings',
    cta: 'View board',
    icon: 'i-lucide-calendar-clock',
  },
  {
    title: 'Client CRM',
    copy: 'Track preferences, notes, and service agreements without spreadsheets.',
    href: '/professionals',
    cta: 'Open CRM',
    icon: 'i-lucide-id-card',
  },
  {
    title: 'Supplies & kits',
    copy: 'Assign consumables to jobs and auto-reorder when bins run low.',
    href: '/inventory',
    cta: 'Manage kits',
    icon: 'i-lucide-sprout',
  },
]

const fuelMeters = [
  { label: 'Route readiness', value: 88, icon: 'i-lucide-map' },
  { label: 'Crew availability', value: 95, icon: 'i-lucide-smile' },
  { label: 'Customer delight', value: 91, icon: 'i-lucide-stars' },
]

const featureList = [
  {
    title: 'Zone smart routing',
    copy: 'Optimise travel blocks with postcode-level grouping and live traffic buffers.',
  },
  {
    title: 'Checklist automation',
    copy: 'Push tailored checklists to each crew member before arrival.',
  },
  {
    title: 'Customer pulse',
    copy: 'Get instant feedback and queue responses before the team drives away.',
  },
  {
    title: 'Cleaner wallets',
    copy: 'Handle payouts, tips, and reimbursements in one ledger.',
  },
]

const skillTags = [
  { label: 'Deep clean lead', icon: 'i-lucide-sparkles' },
  { label: 'Window specialist', icon: 'i-lucide-scan' },
  { label: 'Floor care pro', icon: 'i-lucide-squeegee' },
  { label: 'Office route', icon: 'i-lucide-briefcase' },
  { label: 'Move-out crew', icon: 'i-lucide-box' },
  { label: 'Eco supplies', icon: 'i-lucide-leaf' },
]

const handleStartTour = () => {
  router.push('/getting-started')
}

const handleDownloadPlaybook = () => {
  router.push('/docs/cleaning-playbook')
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
