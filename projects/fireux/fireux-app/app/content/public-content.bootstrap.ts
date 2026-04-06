import { defineFireuxPublicContentBootstrap } from 'fireux-core/runtime/models/system/public-app-content.model'

export const fireuxPublicContentBootstrap = defineFireuxPublicContentBootstrap({
  meta: {
    messaging: {
      hero_prefix: 'Ignite With',
      hero_headline: 'Powerful Applications',
      hero_html:
        'FireUX is the <strong>console architecture</strong> for builders and operators. A low-code ecosystem for <strong>responsive</strong>, <strong>scalable</strong>, and <strong>data-driven</strong> applications built upon <strong>Nuxt 4</strong> and <strong>Firebase</strong>.',
      summary:
        'FireUX is the operating system for builders and operators. We run app discovery, module composition, and ecosystem operations from one structured platform.',
      console_bridge_html:
        'The operating system for building and running domain applications from one shared, <strong>extensible core</strong>.',
      highlight_terms: [
        'console architecture',
        'responsive',
        'scalable',
        'data-driven',
        'Nuxt 4',
        'Firebase',
        'extensible core',
      ],
    },
    seo: {
      title: 'FireUX — Vue.js Development Ecosystem',
      description:
        'Build faster with FireUX Core and deploy streamlined, data-driven applications.',
      keywords: [
        'nuxt firebase platform',
        'low-code app ecosystem',
        'console architecture',
        'multi-tenant app framework',
        'firebase app builder',
        'nuxt 4 firebase',
      ],
      audience: ['developers', 'product teams', 'operators', 'founders'],
      categories: ['app platform', 'console architecture', 'firebase framework'],
      primary_topic: 'nuxt firebase app platform',
      canonical_path: '/',
      open_graph: {
        title: 'FireUX — Vue.js Development Ecosystem',
        description:
          'Build faster with FireUX Core and deploy streamlined, data-driven applications.',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'FireUX — Vue.js Development Ecosystem',
        description:
          'Build faster with FireUX Core and deploy streamlined, data-driven applications.',
      },
    },
  },
  landing: {
    hero: {
      app_name: 'fireux',
      prefix: 'Ignite With',
      headline: 'Powerful Applications',
      body_html:
        'FireUX is the <strong>console architecture</strong> for builders and operators. A low-code ecosystem for <strong>responsive</strong>, <strong>scalable</strong>, and <strong>data-driven</strong> applications built upon <strong>Nuxt 4</strong> and <strong>Firebase</strong>.',
      console_bridge_html:
        'The operating system for building and running domain applications from one shared, <strong>extensible core</strong>.',
      highlight_terms: [
        'console architecture',
        'responsive',
        'scalable',
        'data-driven',
        'Nuxt 4',
        'Firebase',
        'extensible core',
      ],
    },
    actions: {
      primary: {
        label: 'Get started',
        to: '/get-started',
      },
      secondary: {
        label: 'Browse projects',
        to: '/projects',
      },
    },
    bullets: [
      'Nuxt 4 + Firebase orchestration out of the box',
      'Reusable design system and shared components',
      'Tenant-aware and white-label runtime',
      'Automations, PWA, and CI presets',
    ],
    panel_items: [
      {
        title: 'Modules',
        description: 'Wire Nuxt + Firebase with ready composables.',
        icon: 'i-lucide-puzzle',
      },
      {
        title: 'Tenant theming',
        description: 'White-label overrides from one config.',
        icon: 'i-lucide-palette',
      },
      {
        title: 'Automation',
        description: 'PWA, CI presets, and deploy pipelines.',
        icon: 'i-lucide-rocket',
      },
    ],
    about_intro: {
      label: 'About FireUX',
      title: 'Platform Operating System for Ecosystem Apps',
      description:
        'FireUX is the operating system for builders and operators. We run app discovery, module composition, and ecosystem operations from one structured platform.',
      supporting_copy:
        'We run ecosystem apps from one platform surface, so teams can ship faster, keep architecture aligned, and scale modules without fragmenting the system.',
      primary_action: {
        label: 'Open apps',
        to: '/apps',
      },
      secondary_action: {
        label: 'Browse modules',
        to: '/modules',
      },
      panel_title: 'What this page covers',
      panel_ticks: [
        'How platform modules fit together across apps',
        'The key platform records and their relationships',
        'Small realistic sample objects for context',
        'Direct links to public and console surfaces',
      ],
    },
  },
} as const)
