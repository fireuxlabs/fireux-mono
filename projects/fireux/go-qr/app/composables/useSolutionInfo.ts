import { computed } from 'vue'

export type GoQrSolutionInfo = {
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

export type GoQrSolution = GoQrSolutionInfo & {
  slug?: string
  title: string
  description: string
}

const solutionInfo: Record<string, GoQrSolutionInfo> = {
  text: {
    instructions: [
      {
        title: 'Tool',
        icon: 'i-lucide-type',
        body: 'Text is the smallest Go QR primitive for turning a message into a QR.',
      },
      {
        title: 'Contract',
        icon: 'i-lucide-plug',
        body: 'The tool exposes a small API contract that can grow into saved text QR records.',
      },
      {
        title: 'Consumer',
        icon: 'i-lucide-box',
        body: 'Apps can use Text for simple notes while keeping their own domain workflow separate.',
      },
    ],
    integrations: {
      body: 'Text is a Go QR primitive. Use it when the scan should show a short message without a larger app-owned workflow.',
      links: [
        {
          label: 'Doc',
          to: '/solutions/doc',
        },
        {
          label: 'URL',
          to: '/solutions/url',
        },
      ],
    },
    dev: {
      endpoints: [
        {
          method: 'GET',
          path: '/api/tools/text',
          description: 'Read the Go QR text tool contract.',
        },
      ],
    },
  },
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

export function useSolutionInfo(solution: GoQrSolution) {
  return computed(() => {
    const base = solutionInfo[solution.slug || ''] || {}

    return {
      ...base,
      instructions: solution.instructions || base.instructions,
      integrations: solution.integrations || base.integrations,
      upgrades: solution.upgrades || base.upgrades,
      dev: solution.dev || base.dev,
    }
  })
}
