// Concurrent edit — 2026-07-21 12:23 CEST — Cleanbox-to-Werkbox app migration: define truthful Werkbox identity and route metadata.
// Concurrent edit — 2026-07-21 13:08 CEST — Operations catalogue: declare the current empty workspace-operation set.
import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'cleanbox-app',
    name: 'Werkbox',
    ecosystem: 'werkbox',
  },
  copy: {
    big_personality: 'Open work, direct hiring',
    headline: 'Find good work. Build a strong team.',
    positioning_html:
      'Browse published practical jobs before you join, see who is hiring, and connect directly without an agency in between.',
    promise_html:
      'Professionals reuse one work profile. Employers publish roles and manage direct applications without a hiring commission.',
    workspace_bridge_html:
      'Werkbox currently provides public work, organisation, professional, and hiring surfaces.',
  },
  seo: {
    title: 'Werkbox — Practical work, connected',
    description:
      'Browse public practical jobs, meet named employers, and hire directly without a hiring commission.',
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
    public: ['/', '/categories/cleaning', '/jobs', '/agents', '/professionals'],
    workspace: [],
  },
})
