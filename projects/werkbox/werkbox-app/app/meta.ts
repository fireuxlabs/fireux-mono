// Concurrent edit — 2026-07-21 12:23 CEST — Cleanbox-to-Werkbox app migration: define truthful Werkbox identity and route metadata.
// Concurrent edit — 2026-07-21 13:08 CEST — Operations catalogue: declare the current empty console-operation set.
import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'cleanbox-app',
    name: 'Werkbox',
    ecosystem: 'werkbox',
  },
  copy: {
    big_personality: 'Practical work, connected',
    headline: 'A shared hub for the work that keeps places running.',
    positioning_html:
      'Werkbox connects practical jobs, service organisations, and professional profiles without tying the underlying work to one product category.',
    promise_html:
      'Start with cleaning, then use the same neutral Jobs, Agents, Professionals, Companies, and Places foundations for other practical work.',
    console_bridge_html:
      'Werkbox currently exposes public work and provider surfaces; operational consoles are added only when their authority and workflows are ready.',
  },
  seo: {
    title: 'Werkbox — Practical work, connected',
    description:
      'Browse practical jobs, service organisations, and professional profiles, starting with cleaning work.',
    keywords: [
      'practical work',
      'cleaning jobs',
      'service organisations',
      'professional profiles',
    ],
    audience: ['service businesses', 'practical workers', 'work coordinators'],
    categories: ['work platform', 'service network'],
    primary_topic: 'practical work platform',
  },
  cta: {
    primary: {
      label: 'Browse jobs',
      to: '/jobs',
    },
    secondary: {
      label: 'Explore cleaning',
      to: '/categories/cleaning',
    },
  },
  operations: [],
  routes: {
    public: [
      '/',
      '/categories/cleaning',
      '/jobs',
      '/agents',
      '/professionals',
    ],
    console: [],
  },
})
