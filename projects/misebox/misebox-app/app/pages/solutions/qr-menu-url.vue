<template>
  <SolutionPage :solution="solution">
    <ProviderGoQrUrlTool />
    <SolutionInstructions :items="solution.instructions" />
    <SolutionIntegrations :integrations="solution.integrations" />
    <SolutionUpgrades :items="solution.upgrades" />
    <SolutionDev :dev="solution.dev" />
  </SolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const goQrBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const solution = {
  title: 'Menu URL QR',
  description: 'Paste an existing menu URL and get a printable QR menu.',
  instructions: [
    {
      title: 'Paste URL',
      icon: 'i-lucide-link',
      body: 'Use this when the menu already lives online and only needs a scannable table QR.',
    },
    {
      title: 'Generate QR',
      icon: 'i-lucide-qr-code',
      body: 'Go QR creates the code while Misebox keeps the hospitality wording and route.',
    },
    {
      title: 'Print',
      icon: 'i-lucide-printer',
      body: 'Download the QR for tables, windows, counter signs, or printed menus.',
    },
  ],
  integrations: {
    body: 'This is the Misebox packaging of the Go QR URL primitive.',
    items: [
      {
        name: 'Go QR',
        icon: 'i-lucide-qr-code',
        body: 'Provides the generic URL-to-QR tool.',
        cta: 'Open primitive',
        to: `${goQrBaseUrl}/solutions/url`,
        external: true,
      },
      {
        name: 'Misebox',
        icon: 'i-lucide-utensils',
        body: 'Packages the primitive for restaurant menu use.',
      },
    ],
  },
  upgrades: [
    'Save menu URL QR records to a kitchen later.',
    'Add branded QR print layouts for table cards.',
    'Track scans and replace destinations without reprinting.',
  ],
  dev: {
    endpoints: [
      {
        method: 'GET',
        path: 'Go QR /tools/url',
        description: 'Embeds the Go QR URL tool with Misebox menu labels.',
      },
    ],
  },
  seo: {
    title: 'Menu URL QR',
    ogTitle: 'Menu URL QR',
    twitterTitle: 'Menu URL QR',
    description: 'Paste an existing menu URL and get a printable QR menu.',
    ogDescription: 'Paste an existing menu URL and get a printable QR menu.',
    twitterDescription: 'Paste an existing menu URL and get a printable QR menu.',
  },
}

useSeoMeta(solution.seo)
</script>
