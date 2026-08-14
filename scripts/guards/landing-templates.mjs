// @fireux-script
// last_used: 2026-08-13
// usage_note: guards the Misebox template catalogue, thin detail route, and Template One ownership.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

export function run(ctx) {
  const root = ctx?.repoRoot ?? process.cwd()
  const read = relative => readFileSync(path.join(root, relative), 'utf8')
  const runtime = 'packages/ecosystem/fireux-misebox/src/runtime'
  const fixtures = read(`${runtime}/template-one-fixtures.ts`)
  const contract = read(`${runtime}/template-one.ts`)
  const page = read(`${runtime}/TemplateOnePage.vue`)
  const scene = read(`${runtime}/TemplateOneSceneOne.vue`)
  const sceneCss = read(`${runtime}/styles/template-one-scene-one.css`)
  const sceneFiles = [
    'TemplateOneSceneOne.vue',
    'TemplateOneMenuSection.vue',
    'TemplateOneOrderingScene.vue',
    'TemplateOneFranchiseScene.vue',
    'TemplateOneProviderScene.vue',
    'TemplateOneFooterScene.vue',
  ]
  const catalogue = read('projects/misebox/misebox-app/app/pages/templates/index.vue')
  const detail = read('projects/misebox/misebox-app/app/pages/templates/[slug].vue')
  const friiitesPage = read('projects/misebox/friiites/app/pages/index.vue')
  const fireuxIndex = read('projects/fireux/fireux-app/app/pages/templates/index.vue')
  const fireuxDetail = read('projects/fireux/fireux-app/app/pages/templates/[slug].vue')
  const violations = []
  const projectFiles = [
    'projects/misebox/friiites/app',
    'projects/misebox/misebox-app/app/pages/templates',
  ].flatMap(relative => readdirSync(path.join(root, relative), { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(?:vue|ts|css)$/.test(entry.name))
    .map(entry => path.join(entry.parentPath, entry.name)))

  for (const [id, tier] of [
    ['seehotel-bonigen', 'root'],
    ['pizza-the-action', 'console'],
    ['friiites', 'app'],
    ['deanos', 'app'],
  ]) {
    if (!new RegExp(`id: '${id}',[\\s\\S]{0,100}tier: '${tier}'`).test(fixtures))
      violations.push(`${id} must remain the ${tier} development specimen`)
  }
  for (const slug of ['default', 'theme', 'template-one'])
    if (!fixtures.includes(`slug: '${slug}'`)) violations.push(`missing ${slug} presentation`)
  if (fixtures.includes("slug: 'template-two'"))
    violations.push('unimplemented Template Two must not appear')

  if (
    !catalogue.includes('Select a Kitchen. Compare templates.') ||
    !catalogue.includes('<TemplatesKitchenPalette') ||
    !catalogue.includes('<TemplatesKitchenTypography') ||
    !catalogue.includes('v-for="item in templates"')
  ) violations.push('catalogue must select one Kitchen, show its configuration, and list presentations')
  if (!catalogue.includes('Kitchen readiness') || !catalogue.includes('Exactly one flagship Dish'))
    violations.push('catalogue must report Kitchen-level Template One readiness')
  if (/Storage|TemplateOneScene/.test(catalogue))
    violations.push('catalogue must not inspect Storage or render template scenes')

  if (
    !detail.includes('<TemplateOnePage') ||
    !detail.includes('createTemplateOneFixtureProjection') ||
    !detail.includes('layout: false') ||
    !detail.includes('Presentation unavailable for this Kitchen')
  ) violations.push('detail must remain a thin compatible-presentation resolver')
  if (/TemplateOneAtoms|BrandSwitcher|HeroProps|PlacePreview|KitchenPreview/.test(detail))
    violations.push('detail must not restore inspection UI')

  if (
    !scene.includes('data-landing-scene="hero"') ||
    !scene.includes('data-scene-layer="content"') ||
    !scene.includes('styles/template-one-scene-one.css') ||
    !existsSync(path.join(root, runtime, 'public/img/template-one/charcoal-texture.webp')) ||
    !sceneCss.includes("url('/img/template-one/charcoal-texture.webp')")
  ) violations.push('Template One Scene One must retain shared scene/layer anatomy and owned texture')
  if (/gsap|ScrollTrigger|useLandingMotion/.test(`${page}\n${scene}\n${sceneCss}\n${detail}`))
    violations.push('templates must not own shared motion infrastructure')
  if (!contract.includes('TemplateOneSceneOneRequirements'))
    violations.push('Template One must retain a typed Scene One contract')
  if (!contract.includes('TemplateOneKitchenProjection') || !contract.includes('projectTemplateOneKitchen'))
    violations.push('Template One must retain its canonical Kitchen projection')
  for (const file of sceneFiles) {
    if (!page.includes(file.replace('.vue', '')) || !existsSync(path.join(root, runtime, file)))
      violations.push(`TemplateOnePage must own ${file}`)
  }
  if (!friiitesPage.includes('<TemplateOnePage') || !friiitesPage.includes('createTemplateOneFixtureProjection'))
    violations.push('Friiites must render the canonical TemplateOnePage projection directly')
  if (detail.includes('<iframe') || friiitesPage.includes('<iframe'))
    violations.push('Template One consumers must not use iframe previews')
  for (const file of projectFiles) {
    const relative = path.relative(root, file)
    const source = readFileSync(file, 'utf8')
    if (/projects\/misebox\/friiites\/app\/components\/Friiites.*Scene\.vue$/.test(relative))
      violations.push(`consumer-owned Template One scene forbidden: ${relative}`)
    if (
      relative !== 'projects/misebox/friiites/app/pages/index.vue' &&
      relative !== 'projects/misebox/misebox-app/app/pages/templates/[slug].vue' &&
      /TemplateOne(?:SceneOne|MenuSection|OrderingScene|FranchiseScene|ProviderScene|FooterScene)/.test(source)
    ) violations.push(`consumer-specific Template One composition forbidden: ${relative}`)
    if (/projects\/misebox\/friiites\//.test(relative) && /data-landing-scene=/.test(source))
      violations.push(`consumer-owned landing scene anatomy forbidden: ${relative}`)
  }

  if (!fireuxIndex.includes('http://localhost:3001/templates/${template.slug}'))
    violations.push('FireUX catalogue must refer to the Misebox owner')
  if (!fireuxDetail.includes('http://localhost:3001/templates/template-one'))
    violations.push('FireUX detail must redirect to the Misebox owner')

  if (violations.length)
    throw new Error(`[guard] ❌ Landing templates:\n- ${violations.join('\n- ')}`)
  console.log('[guard] ✅ Misebox template catalogue and Template One ownership valid')
}
