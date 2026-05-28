<template>
  <MiseboxSolutionPage
    title="QR menu"
    description="Upload a menu, choose a short path, and get a QR menu."
  >
    <MiseboxSolutionTool>
      <MenuQrTool />
    </MiseboxSolutionTool>

    <MiseboxSolutionInstructions :items="instructions" />
    <MiseboxSolutionIntegrations
      body="Use QR menu when the restaurant has a finished file and needs a clean guest-facing scan path."
      :items="integrations"
    />
    <MiseboxSolutionUpgrades :items="upgrades" />
    <MiseboxSolutionDev :endpoints="endpoints" />
  </MiseboxSolutionPage>
</template>

<script setup lang="ts">
const instructions = [
  {
    title: 'Menu',
    icon: 'i-lucide-file-up',
    body: 'Upload a finished PDF, DOC, or DOCX menu.',
  },
  {
    title: 'Path',
    icon: 'i-lucide-link',
    body: 'Choose a short Misebox path like `/menus/my-menu`.',
  },
  {
    title: 'QR',
    icon: 'i-lucide-qr-code',
    body: 'Open the public menu or QR page for printing.',
  },
]

const integrations = [
  {
    name: 'Go QR',
    icon: 'i-lucide-qr-code',
    body: 'Provides the doc-to-QR primitive contract and QR mechanics.',
    cta: 'Open Doc',
    to: 'https://go-qr.web.app/solutions/doc',
    external: true,
  },
  {
    name: 'Sproochli',
    icon: 'i-lucide-languages',
    body: 'Use when the menu needs translation workflow, review, or multilingual routes.',
    cta: 'Open Sproochli',
    to: 'https://sproochli.web.app',
    external: true,
  },
  {
    name: 'Misebox menus',
    icon: 'i-lucide-list-tree',
    body: 'Use when the venue needs sections, dishes, prices, allergens, availability, or ordering.',
    cta: 'Menu management',
    to: '/solutions/restaurant-menu-management',
  },
]

const upgrades = [
  'Turn the uploaded menu into editable sections, dishes, prices, and allergens.',
  'Send the menu through Sproochli for translations and review.',
  'Add ordering, delivery, table flows, or kitchen-managed availability later.',
]

const endpoints = [
  {
    method: 'GET',
    path: '/api/menu-qr/tool',
    description: 'Read the Misebox menu QR contract derived from the Go QR doc primitive.',
  },
  {
    method: 'GET',
    path: '/api/menu-qr/availability?id=my-menu',
    description: 'Check whether a menu path is valid and available before upload.',
  },
  {
    method: 'POST',
    path: '/api/menus',
    description: 'Upload the menu file into Misebox storage and create the root Menu record.',
  },
]
</script>
