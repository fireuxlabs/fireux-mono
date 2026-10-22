import type { IgnitionSearchPlan } from '../models/ignition.js'

/** Reviews declared policy only. It does not crawl, certify rankings or authorize release. */
export function reviewSearchPlan(plan: IgnitionSearchPlan | undefined) {
  if (!plan)
    return {
      status: 'missing' as const,
      findings: ['Search plan not supplied.'],
    }
  const findings: string[] = []
  const nonempty = (value: string) => Boolean(value?.trim())
  let origin: URL | undefined
  try {
    origin = new URL(plan.origin)
  } catch {
    findings.push('Search origin must be an absolute URL.')
  }
  if (origin) {
    if (
      !['http:', 'https:'].includes(origin.protocol) ||
      origin.username ||
      origin.password ||
      origin.pathname !== '/' ||
      origin.search ||
      origin.hash
    )
      findings.push('Search origin must be a credential-free HTTP(S) origin.')
    const host = origin.hostname.toLowerCase()
    const loopback =
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      /^127\./.test(host) ||
      host === '[::1]' ||
      host === '0.0.0.0'
    if (plan.mode === 'public' && (origin.protocol !== 'https:' || loopback))
      findings.push('Public search requires HTTPS and a non-loopback origin.')
  }
  if (!['preview', 'public', 'private'].includes(plan.mode))
    findings.push('Search mode is invalid.')
  if (
    !nonempty(plan.owner) ||
    !nonempty(plan.geography) ||
    !plan.languages.length ||
    plan.languages.some((value) => !nonempty(value))
  )
    findings.push('Search plan needs an owner, geography and languages.')
  const journeys = new Set(plan.journeys.map((item) => item.id))
  if (
    journeys.size !== plan.journeys.length ||
    plan.journeys.some(
      (item) =>
        !nonempty(item.id) ||
        !nonempty(item.audience) ||
        !nonempty(item.intent) ||
        !nonempty(item.action) ||
        !item.references.length ||
        item.references.some((value) => !nonempty(value))
    )
  )
    findings.push(
      'Search journeys need unique ids, audience, intent, action and source references.'
    )
  if (plan.mode !== 'private' && (!plan.journeys.length || !plan.pages.length))
    findings.push('Public or preview plans need journeys and pages.')
  const paths = new Set(plan.pages.map((page) => page.path))
  if (paths.size !== plan.pages.length)
    findings.push('Search page paths must be unique.')
  for (const page of plan.pages) {
    if (
      !page.path.startsWith('/') ||
      page.path.startsWith('//') ||
      /[?#]/.test(page.path) ||
      !nonempty(page.owner) ||
      !nonempty(page.title) ||
      !nonempty(page.description) ||
      !journeys.has(page.journey)
    )
      findings.push(
        `Search page ${page.path} needs a canonical path, known journey, owner and metadata.`
      )
    if (
      (plan.mode !== 'public' && (page.index || page.sitemap)) ||
      (page.sitemap && !page.index)
    )
      findings.push(
        `Search page ${page.path} contradicts indexing or sitemap policy.`
      )
  }
  if (
    !nonempty(plan.measurement.owner) ||
    !plan.measurement.measures.length ||
    plan.measurement.measures.some((value) => !nonempty(value)) ||
    !['planned', 'connected'].includes(plan.measurement.status)
  )
    findings.push('Search measurement needs a status, owner and measures.')
  return {
    status: findings.length ? ('needs-review' as const) : ('declared' as const),
    findings,
  }
}
