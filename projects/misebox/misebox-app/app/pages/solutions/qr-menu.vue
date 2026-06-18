<template>
  <SolutionPage :solution="solution">
    <MenuCTA count-label="No kitchen needed" />
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

const solution = {
  title: 'QR menu',
  description: 'Upload a menu photo or document, choose a short link, and get a QR menu.',
  instructions: [
    {
      title: 'Upload menu',
      icon: 'i-lucide-file-up',
      body: 'Start with a photo, PDF, DOC, or DOCX. No kitchen setup is needed.',
    },
    {
      title: 'Choose link',
      icon: 'i-lucide-link',
      body: 'Pick the public menu path people will scan, such as /menus/lunch-menu.',
    },
    {
      title: 'Share QR',
      icon: 'i-lucide-qr-code',
      body: 'Print or share the QR. The public menu route can improve later without changing the idea.',
    },
  ],
  integrations: {
    body: 'Go QR provides the upload tool. Misebox stores the public menu doorway and source file.',
    items: [
      {
        name: 'Go QR',
        icon: 'i-lucide-qr-code',
        body: 'Provides the generic document-to-QR tool surface.',
        cta: 'Open primitive',
        to: `${goQrBaseUrl}/solutions/doc`,
        external: true,
      },
      {
        name: 'Misebox',
        icon: 'i-lucide-utensils',
        body: 'Stores the menu upload under /menus first, then can upgrade it into a kitchen menu later.',
      },
    ],
  },
  upgrades: [
    'Replace the uploaded source without changing the printed QR route.',
    'Process the menu into dishes and sections when you are ready.',
    'Move the menu into a kitchen console later.',
    'Add translations through Sproochli after the menu is structured.',
  ],
  dev: {
    endpoints: [
      {
        method: 'GET',
        path: 'Go QR /api/tools/doc',
        description: 'Loads the generic Go QR document upload tool.',
      },
      {
        method: 'POST',
        path: '/api/menus/create',
        description: 'Stores the root public menu upload and source file.',
      },
      {
        method: 'GET',
        path: '/api/menus/availability',
        description: 'Checks whether the chosen public menu path is available.',
      },
    ],
  },
  seo: {
    title: 'QR menu',
    ogTitle: 'QR menu',
    twitterTitle: 'QR menu',
    description: 'Upload a menu photo or document, choose a short link, and get a QR menu.',
    ogDescription: 'Upload a menu photo or document, choose a short link, and get a QR menu.',
    twitterDescription: 'Upload a menu photo or document, choose a short link, and get a QR menu.',
  },
}

useSeoMeta(solution.seo)
</script>
