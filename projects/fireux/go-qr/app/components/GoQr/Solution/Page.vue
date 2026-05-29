<template>
  <PublicSimplePage
    :title="solution.title"
    :description="solution.description"
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <slot />
      <GoQrSolutionInstructions :items="literature.instructions" />
      <GoQrSolutionIntegrations :integrations="literature.integrations" />
      <GoQrSolutionUpgrades :items="literature.upgrades" />
      <GoQrSolutionDev :dev="literature.dev" />
    </div>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type SolutionLiterature = {
  instructions?: {
    title: string
    icon: string
    body: string
  }[]
  integrations?: {
    body: string
    links?: {
      label: string
      to: string
    }[]
    consumers?: {
      name: string
      icon: string
      to: string
      cta: string
      useGoQr: string
      useApp: string
      external?: boolean
    }[]
  }
  upgrades?: string[]
  dev?: {
    endpoints?: {
      method: string
      path: string
      description: string
    }[]
    examples?: {
      title: string
      code: string
    }[]
  }
}

type Solution = SolutionLiterature & {
  slug?: string
  title: string
  description: string
}

const props = defineProps<{
  solution: Solution
}>()

const solutionLiterature: Record<string, SolutionLiterature> = {
  doc: {
    instructions: [
      {
        title: 'Tool',
        icon: 'i-lucide-file-text',
        body: 'Doc is the Go QR primitive for document-to-QR work.',
      },
      {
        title: 'Contract',
        icon: 'i-lucide-plug',
        body: 'The tool exposes a small API contract that other apps can consume.',
      },
      {
        title: 'Consumer',
        icon: 'i-lucide-box',
        body: 'Misebox can add menu meaning while Go QR stays focused on QR mechanics.',
      },
    ],
    integrations: {
      body: 'Doc is a Go QR primitive. Industry-specific workflows should live in the consuming app.',
      consumers: [
        {
          name: 'Misebox',
          icon: 'i-lucide-utensils',
          to: 'https://misebox.app/solutions/qr-menu',
          cta: 'Menu flow',
          useGoQr: 'Use Doc for the document-to-QR provider pipeline.',
          useApp: 'Use Misebox for kitchen-owned menus, dishes, translations, and ordering.',
          external: true,
        },
      ],
    },
    dev: {
      endpoints: [
        {
          method: 'GET',
          path: '/api/tools/doc',
          description: 'Read the Go QR doc tool contract.',
        },
      ],
    },
  },
}

const literature = computed(() => ({
  ...solutionLiterature[props.solution.slug || ''],
  instructions: props.solution.instructions || solutionLiterature[props.solution.slug || '']?.instructions,
  integrations: props.solution.integrations || solutionLiterature[props.solution.slug || '']?.integrations,
  upgrades: props.solution.upgrades || solutionLiterature[props.solution.slug || '']?.upgrades,
  dev: props.solution.dev || solutionLiterature[props.solution.slug || '']?.dev,
}))
</script>
