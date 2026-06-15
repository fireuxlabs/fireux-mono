<template>
  <SolutionPage :solution="solution">
    <ProviderGoQrTools
      tool="url"
      :payload="tool"
    />
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

const goQrBaseUrl = 'https://go-qr.web.app'
const tool = {
  copy: {
    title: 'Menu URL QR',
    description: 'Paste an existing menu URL and get a printable QR menu.',
    ctaLabel: 'Create menu URL QR',
    downloadLabel: 'Download QR',
    openTargetLabel: 'Open menu URL',
  },
  url: {
    label: 'Menu URL',
    placeholder: 'https://example.com/menu',
    initialValue: '',
    invalidMessage: 'Enter a valid public menu URL.',
  },
  qr: {
    centreLabel: 'Menu',
  },
}

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
        path: 'Go QR /api/tools/url',
        description: 'Creates a configured Go QR URL tool with Misebox menu labels.',
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
