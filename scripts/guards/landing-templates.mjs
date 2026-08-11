// @fireux-script
// last_used: 2026-08-11
// usage_note: guards Misebox-owned Template One and FireUX referral ownership.
import { readFileSync } from 'node:fs'
import path from 'node:path'

export function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const runtime = path.join(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/runtime'
  )
  const fixtures = readFileSync(
    path.join(runtime, 'template-one-fixtures.ts'),
    'utf8'
  )
  const atoms = readFileSync(path.join(runtime, 'TemplateOneAtoms.vue'), 'utf8')
  const contract = readFileSync(path.join(runtime, 'template-one.ts'), 'utf8')
  const miseboxDetail = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/pages/templates/[slug].vue'
    ),
    'utf8'
  )
  const miseboxIndex = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/pages/templates/index.vue'
    ),
    'utf8'
  )
  const fireuxIndex = readFileSync(
    path.join(
      repoRoot,
      'projects/fireux/fireux-app/app/pages/templates/index.vue'
    ),
    'utf8'
  )
  const fireuxReferral = readFileSync(
    path.join(
      repoRoot,
      'projects/fireux/fireux-app/app/pages/templates/[slug].vue'
    ),
    'utf8'
  )
  const violations = []

  for (const fixture of [
    "id: 'basic-kitchen'",
    "id: 'pizza-the-action'",
    "id: 'friiites'",
    "id: 'deanos'",
  ])
    if (!fixtures.includes(fixture))
      violations.push(`missing Template One fixture ${fixture}`)
  for (const [id, tier] of [
    ['basic-kitchen', 'basic'],
    ['pizza-the-action', 'console'],
    ['friiites', 'app'],
    ['deanos', 'console'],
  ]) {
    const fixturePattern = new RegExp(
      `id: '${id}',[\\s\\S]{0,100}tier: '${tier}'`
    )
    if (!fixturePattern.test(fixtures))
      violations.push(`${id} must remain classified as ${tier}`)
  }
  if (!fixtures.includes("slug: 'template-one'"))
    violations.push('Template One must own the neutral slug')
  if (
    !contract.includes(
      "import type { BrandPalette } from 'fireux-core/runtime/models/utils/style.model'"
    )
  )
    violations.push('Template One must consume the canonical Core BrandPalette')
  if (
    !miseboxDetail.includes('<TemplateOneAtoms :injection="selectedKitchen" />')
  )
    violations.push('Misebox detail must render the shared atom anatomy')
  if (!miseboxIndex.includes('to="/templates/template-one"'))
    violations.push('Misebox catalogue must link to its canonical local detail')
  if (!fireuxIndex.includes('http://localhost:3001/templates/${template.slug}'))
    violations.push('FireUX catalogue must refer to the local Misebox owner')
  if (!fireuxReferral.includes('http://localhost:3001/templates/template-one'))
    violations.push('FireUX detail must redirect locally to Misebox')
  if (/Friiites|Deano/.test(atoms))
    violations.push('Template One anatomy must not contain fixture content')
  for (const removedAtom of ['displayTitle', 'filledAction', 'mediaFrame'])
    if (atoms.includes(removedAtom))
      violations.push(`first slice must not render ${removedAtom}`)
  if (!atoms.includes('<p>Basic atom</p>') || !atoms.includes('<hr />'))
    violations.push('Rule must remain the one visible Template One atom')
  if (
    /data:image\/svg|wordmark-fallback|media-fallback/i.test(
      `${fixtures}\n${atoms}`
    )
  )
    violations.push('Template One must not invent identity/media fallbacks')
  if (/MenuItem|Ingredient/.test(`${contract}\n${atoms}`))
    violations.push('food entity integration is outside the atom-only slice')
  if (
    /gsap|ScrollTrigger|useLandingMotion/.test(
      `${fixtures}\n${atoms}\n${miseboxDetail}`
    )
  )
    violations.push('Template One must not own shared motion')

  if (violations.length)
    throw new Error(
      `[guard] ❌ Template One spine:\n- ${violations.join('\n- ')}`
    )
  console.log('[guard] ✅ Misebox-owned Template One and FireUX referral valid')
}
