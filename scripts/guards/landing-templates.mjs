// @fireux-script
// last_used: 2026-08-10
// usage_note: guards the FireUX landing-template anatomy and injection boundary.
import { readFileSync } from 'node:fs'
import path from 'node:path'

const requiredBrands = [
  "id: 'friiites'",
  "id: 'deanos'",
  "id: 'misebox-restaurant'",
]
const requiredScenes = ['hero', 'proof', 'story']

export function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const root = path.join(repoRoot, 'projects/fireux/fireux-app/app')
  const catalogue = readFileSync(
    path.join(root, 'content/landing-templates.ts'),
    'utf8'
  )
  const preview = readFileSync(
    path.join(root, 'components/Template/SceneOnePreview.vue'),
    'utf8'
  )
  const detail = readFileSync(
    path.join(root, 'pages/templates/[slug].vue'),
    'utf8'
  )
  const miseboxDoorway = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/pages/templates/index.vue'
    ),
    'utf8'
  )
  const violations = []

  for (const brand of requiredBrands) {
    if (!catalogue.includes(brand))
      violations.push(`missing brand injection ${brand}`)
  }
  for (const scene of requiredScenes) {
    if (!preview.includes(`data-landing-scene="${scene}"`)) {
      violations.push(`Scene One is missing neutral ${scene} scene anatomy`)
    }
  }
  if ((preview.match(/data-scene-layer=/g) || []).length !== 9) {
    violations.push(
      'Scene One must keep exactly three neutral layers per scene'
    )
  }
  if (/Friiites|Deanos|Misebox Restaurant/.test(preview)) {
    violations.push('template anatomy must not contain injected brand content')
  }
  if (!detail.includes('<TemplateSceneOnePreview :brand="activeBrand" />')) {
    violations.push(
      'template detail must render one anatomy with the active injection'
    )
  }
  for (const seller of ["seller: 'FireUX'", "seller: 'Misebox'"]) {
    if (!catalogue.includes(seller))
      violations.push(`missing template purchase option ${seller}`)
  }
  if (
    !miseboxDoorway.includes(
      'https://fireux.app/templates/scene-one?brand=misebox-restaurant'
    ) ||
    !miseboxDoorway.includes('to="/get-started"')
  ) {
    violations.push(
      'Misebox /templates must remain a seller doorway to the canonical preview and Misebox request path'
    )
  }
  if (/TemplateSceneOnePreview|landingTemplateBrands/.test(miseboxDoorway)) {
    violations.push(
      'Misebox seller doorway must not copy canonical anatomy or injection fixtures'
    )
  }
  if (
    /gsap|ScrollTrigger|useLandingMotion/.test(
      `${catalogue}\n${preview}\n${detail}\n${miseboxDoorway}`
    )
  ) {
    violations.push(
      'template catalogue must not own shared motion infrastructure'
    )
  }

  if (violations.length) {
    throw new Error(
      `[guard] ❌ landing template spine:\n- ${violations.join('\n- ')}`
    )
  }
  console.log(
    '[guard] ✅ landing template anatomy and injection boundary valid'
  )
}
