// Package-owned demo payloads for Apps.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.
// Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: move App fixtures to their domain owner.
// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: keep private join requests out of public App fixtures.

import { createEmptyAppSocialLinks } from '../composables/fireux/firestore/core/app/utils/factories/createEmptyAppSocialLinks'
import { AppModel as AppModelRuntime, type App } from '../models/core/app.model'

const ts = (seconds: number, nanoseconds = 0) =>
  ({ seconds, nanoseconds } as any)

function makeApp(partial: Partial<App>): App {
  return {
    ...AppModelRuntime,
    ...partial,
    social_links: {
      ...createEmptyAppSocialLinks(),
      ...(partial.social_links ?? {}),
    },
    derived: {
      ...AppModelRuntime.derived,
      ...(partial.derived ?? {}),
    },
    media: {
      ...AppModelRuntime.media,
      ...(partial.media ?? {}),
    },
    created: {
      ...AppModelRuntime.created,
      ...(partial.created ?? {}),
    },
    updated: {
      ...AppModelRuntime.updated,
      ...(partial.updated ?? {}),
    },
  }
}

export const demoAppList: App[] = [
  makeApp({
    id: 'rank-lens',
    app_name: 'Rank Lens',
    app_short_name: 'Rank Lens',
    role: 'global',
    project_id: 'northstar',
    ecosystem_id: 'northstar',
    tagline: 'Search visibility planning and audit workflows.',
    description:
      'Northstar Works SEO system for audits, keyword planning, opportunity mapping, and search visibility reviews.',
    short_bio: 'Northstar SEO workspace for audits and opportunity tracking.',
    long_bio:
      'Rank Lens is the SEO-facing system in the Northstar lane. It is used in dev previews to exercise shared app surfaces with a clear search and growth story.',
    social_links: {
      website: 'https://rank-lens.demo',
      instagram: '',
      github: '',
      twitter: '',
      linkedin: 'https://linkedin.com/company/rank-lens-demo',
      facebook: '',
      youtube: '',
      email: '',
    },
    derived: {
      user_count: 6,
    },
    media: {
      thumbnail_url: 'https://picsum.photos/seed/rank-lens-thumb/128/128',
      logo_url: 'https://picsum.photos/seed/rank-lens-logo/256/256',
      wordmark_light_url: 'https://picsum.photos/seed/rank-lens-wordmark-light/500/120',
      wordmark_dark_url: 'https://picsum.photos/seed/rank-lens-wordmark-dark/500/120',
      cover_url: '',
    },
    created: {
      at: ts(1761565481, 831000000),
      by: 'uid_demo_northstar_admin',
      app_id: 'rank-lens',
    },
    updated: {
      at: ts(1770309146, 296000000),
      by: 'uid_demo_northstar_admin',
    },
  }),
  makeApp({
    id: 'line-pass',
    app_name: 'Line Pass',
    app_short_name: 'Line Pass',
    role: 'global',
    project_id: 'harbor',
    ecosystem_id: 'harbor',
    tagline: 'Kitchen execution, prep cadence, and service flow.',
    description:
      'Harbor Grid operations app for kitchen stations, prep runs, service rhythm, and shift visibility.',
    short_bio: 'Harbor hospitality workspace for service and prep.',
    long_bio:
      'Line Pass anchors the Harbor lane in dev previews. It gives the app surfaces a clear hospitality operations identity without reusing any real ecosystem names.',
    social_links: createEmptyAppSocialLinks(),
    derived: {
      user_count: 12,
    },
    media: {
      thumbnail_url: 'https://picsum.photos/seed/line-pass-thumb/128/128',
      logo_url: 'https://picsum.photos/seed/line-pass-logo/256/256',
      wordmark_light_url: 'https://picsum.photos/seed/line-pass-wordmark-light/500/120',
      wordmark_dark_url: 'https://picsum.photos/seed/line-pass-wordmark-dark/500/120',
      cover_url: '',
    },
    created: {
      at: ts(1762777006, 64000000),
      by: 'uid_demo_harbor_admin',
      app_id: 'line-pass',
    },
    updated: {
      at: ts(1767606233, 131000000),
      by: 'uid_demo_harbor_admin',
    },
  }),
  makeApp({
    id: 'site-ledger',
    app_name: 'Site Ledger',
    app_short_name: 'Site Ledger',
    role: 'global',
    project_id: 'cedar',
    ecosystem_id: 'cedar',
    tagline: 'Property records, site oversight, and asset operations.',
    description:
      'Cedar Loop property operations app for portfolio records, site context, and asset visibility.',
    short_bio: 'Cedar property workspace for sites and records.',
    long_bio:
      'Site Ledger is the Cedar lane anchor app in dev previews. It keeps the asset and property surfaces aligned with the portfolio scenarios.',
    social_links: {
      website: 'https://site-ledger.demo',
      instagram: '',
      github: '',
      twitter: '',
      linkedin: '',
      facebook: '',
      youtube: '',
      email: '',
    },
    derived: {
      user_count: 4,
    },
    media: {
      thumbnail_url: 'https://picsum.photos/seed/site-ledger-thumb/128/128',
      logo_url: 'https://picsum.photos/seed/site-ledger-logo/256/256',
      wordmark_light_url: 'https://picsum.photos/seed/site-ledger-wordmark-light/500/120',
      wordmark_dark_url: 'https://picsum.photos/seed/site-ledger-wordmark-dark/500/120',
      cover_url: '',
    },
    created: {
      at: ts(1761379153, 222000000),
      by: 'uid_demo_cedar_admin',
      app_id: 'site-ledger',
    },
    updated: {
      at: ts(1767563278, 742000000),
      by: 'uid_demo_cedar_admin',
    },
  }),
]
