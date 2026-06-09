<template>
  <SolutionPage :solution="solution">
    <ProviderGoQrDoc
      :preview-base-url="`${consumerBaseUrl}/menus`"
      preview-path-suffix="/qr"
      :create-endpoint="`${consumerBaseUrl}/api/menus/create`"
      :availability-endpoint="`${consumerBaseUrl}/api/menus/availability`"
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

const consumerBaseUrl = import.meta.dev
  ? 'http://localhost:3001'
  : 'https://misebox.app'
const goQrBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const solution = {
  title: 'QR menu',
  description: 'Upload a menu, choose a short path, and get a QR menu.',
  instructions: [
    {
      title: 'Upload menu',
      icon: 'i-lucide-file-up',
      body: 'Upload a finished PDF, DOC, or DOCX menu.',
    },
    {
      title: 'Choose path',
      icon: 'i-lucide-route',
      body: 'Choose a short Misebox menu path that can be printed as a QR.',
    },
    {
      title: 'Publish',
      icon: 'i-lucide-qr-code',
      body: 'Misebox stores the menu while Go QR provides the tool surface.',
    },
  ],
  integrations: {
    body: 'This is the Misebox packaging of the Go QR doc primitive.',
    items: [
      {
        name: 'Go QR',
        icon: 'i-lucide-qr-code',
        body: 'Provides the generic doc-to-QR upload tool.',
        cta: 'Open primitive',
        to: `${goQrBaseUrl}/solutions/doc`,
        external: true,
      },
      {
        name: 'Misebox',
        icon: 'i-lucide-utensils',
        body: 'Owns the menu route, storage, allergen copy, and hospitality meaning.',
      },
    ],
  },
  upgrades: [
    'Replace uploaded menus without changing the table QR.',
    'Move from a document menu into kitchen-managed dishes and sections.',
    'Add translations through Sproochli after onboarding.',
  ],
  dev: {
    endpoints: [
      {
        method: 'GET',
        path: 'Go QR /tools/doc',
        description: 'Embeds the Go QR doc tool with Misebox menu labels.',
      },
      {
        method: 'POST',
        path: '/api/menus/create',
        description: 'Creates the Misebox-owned root menu document and file.',
      },
    ],
  },
  seo: {
    title: 'QR menu',
    ogTitle: 'QR menu',
    twitterTitle: 'QR menu',
    description: 'Upload a menu, choose a short path, and get a QR menu.',
    ogDescription: 'Upload a menu, choose a short path, and get a QR menu.',
    twitterDescription: 'Upload a menu, choose a short path, and get a QR menu.',
  },
}

useSeoMeta(solution.seo)
</script>
