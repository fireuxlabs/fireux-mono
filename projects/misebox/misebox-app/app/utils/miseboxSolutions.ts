export type MiseboxSolutionInstruction = {
  title: string
  icon: string
  body: string
}

export type MiseboxSolutionIntegration = {
  name: string
  icon: string
  body: string
  cta?: string
  to?: string
  external?: boolean
}

export type MiseboxSolutionEndpoint = {
  method: string
  path: string
  description: string
}

export type MiseboxSolution = {
  title: string
  description: string
  instructions: MiseboxSolutionInstruction[]
  integrations: {
    body: string
    items: MiseboxSolutionIntegration[]
  }
  upgrades: string[]
  dev: {
    endpoints: MiseboxSolutionEndpoint[]
  }
  seo: {
    title: string
    ogTitle: string
    twitterTitle: string
    description: string
    ogDescription: string
    twitterDescription: string
  }
}

const qrMenuDescription = 'Upload a menu, choose a short path, and get a QR menu.'

export const miseboxSolutions = {
  qrMenu: {
    title: 'QR menu',
    description: qrMenuDescription,
    instructions: [
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
    ],
    integrations: {
      body: 'Use QR menu when the restaurant has a finished file and needs a clean guest-facing scan path.',
      items: [
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
      ],
    },
    upgrades: [
      'Turn the uploaded menu into editable sections, dishes, prices, and allergens.',
      'Send the menu through Sproochli for translations and review.',
      'Add ordering, delivery, table flows, or kitchen-managed availability later.',
    ],
    dev: {
      endpoints: [],
    },
    seo: {
      title: 'QR menu',
      ogTitle: 'QR menu',
      twitterTitle: 'QR menu',
      description: qrMenuDescription,
      ogDescription: qrMenuDescription,
      twitterDescription: qrMenuDescription,
    },
  },
} satisfies Record<string, MiseboxSolution>
