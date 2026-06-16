<template>
  <SolutionPage :solution="solution">
    <UPageCard
      title="Upload from a kitchen"
      description="Menus belong to kitchens in Misebox. Select a kitchen, then upload the source document from the kitchen menu console."
      variant="subtle"
    >
      <template #footer>
        <UButton
          to="/console/kitchen/menus"
          icon="i-lucide-utensils"
        >
          Open Kitchen Menus
        </UButton>
      </template>
    </UPageCard>

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
  description: 'Upload a kitchen menu source, then publish a QR menu.',
  instructions: [
    {
      title: 'Select kitchen',
      icon: 'i-lucide-utensils',
      body: 'Choose the kitchen that owns the menu.',
    },
    {
      title: 'Upload source',
      icon: 'i-lucide-file-up',
      body: 'Upload the original menu PDF or image against that kitchen.',
    },
    {
      title: 'Publish QR',
      icon: 'i-lucide-qr-code',
      body: 'Use the kitchen menu route for the public QR destination.',
    },
  ],
  integrations: {
    body: 'Go QR provides the upload tool. Misebox stores menu meaning on the selected kitchen.',
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
        body: 'Owns the kitchen, menu upload record, public route, and hospitality meaning.',
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
        path: 'Go QR /api/tools/doc',
        description: 'Creates a configured Go QR doc tool with Misebox menu labels.',
      },
      {
        method: 'POST',
        path: '/api/console/kitchen/menus/upload',
        description: 'Stores the selected kitchen menu source document.',
      },
    ],
  },
  seo: {
    title: 'QR menu',
    ogTitle: 'QR menu',
    twitterTitle: 'QR menu',
    description: 'Upload a kitchen menu source, then publish a QR menu.',
    ogDescription: 'Upload a kitchen menu source, then publish a QR menu.',
    twitterDescription: 'Upload a kitchen menu source, then publish a QR menu.',
  },
}

useSeoMeta(solution.seo)
</script>
