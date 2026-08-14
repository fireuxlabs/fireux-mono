// @fireux-script
// last_used: 2026-08-13
// usage_note: guards the Misebox template catalogue, thin detail route, and Template One ownership.
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export function run(ctx) {
  const root = ctx?.repoRoot ?? process.cwd()
  const read = relative => readFileSync(path.join(root, relative), 'utf8')
  const runtime = 'packages/ecosystem/fireux-misebox/src/runtime'
  const fixtures = read(`${runtime}/template-one-fixtures.ts`)
  const contract = read(`${runtime}/template-one.ts`)
  const scene = read(`${runtime}/TemplateOneSceneOne.vue`)
  const sceneCss = read(`${runtime}/styles/template-one-scene-one.css`)
  const processScene = read(`${runtime}/TemplateOneProcessScene.vue`)
  const catalogue = read('projects/misebox/misebox-app/app/pages/templates/index.vue')
  const detail = read('projects/misebox/misebox-app/app/pages/templates/[slug].vue')
  const friiitesHero = read('projects/misebox/friiites/app/components/FriiitesHeroScene.vue')
  const friiitesProcess = read('projects/misebox/friiites/app/components/FriiitesProcessScene.vue')
  const fireuxIndex = read('projects/fireux/fireux-app/app/pages/templates/index.vue')
  const fireuxDetail = read('projects/fireux/fireux-app/app/pages/templates/[slug].vue')
  const violations = []

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
  if (/AssetReadiness|Storage|TemplateOneScene|useAsyncData|\$fetch/.test(catalogue))
    violations.push('catalogue must not own readiness, Storage, fetching, or scene rendering')

  if (
    !detail.includes('<TemplateOneSceneOne') ||
    !detail.includes("layout: 'landing'") ||
    !detail.includes('Presentation unavailable for this Kitchen')
  ) violations.push('detail must remain a thin compatible-presentation resolver')
  if (/TemplateOneAtoms|BrandSwitcher|HeroProps|PlacePreview|KitchenPreview|<style/.test(detail))
    violations.push('detail must not restore inspection UI or route-owned CSS')

  if (
    !scene.includes('data-landing-scene="hero"') ||
    !scene.includes('data-scene-layer="content"') ||
    !scene.includes('styles/template-one-scene-one.css') ||
    !existsSync(path.join(root, runtime, 'public/img/template-one/charcoal-texture.webp')) ||
    !sceneCss.includes("url('/img/template-one/charcoal-texture.webp')")
  ) violations.push('Template One Scene One must retain shared scene/layer anatomy and owned texture')
  if (/gsap|ScrollTrigger|useLandingMotion/.test(`${scene}\n${sceneCss}\n${detail}`))
    violations.push('templates must not own shared motion infrastructure')
  if (!contract.includes('TemplateOneSceneOneRequirements'))
    violations.push('Template One must retain a typed Scene One contract')

  if (!friiitesHero.includes('TemplateOneSceneOne'))
    violations.push('Friiites must consume shared Template One Scene One')
  if (!friiitesProcess.includes('TemplateOneProcessScene'))
    violations.push('Friiites Method must retain the shared process scene adapter')
  if (!processScene.includes('data-landing-scene="process"'))
    violations.push('Template One process must retain its scene hook')

  if (!fireuxIndex.includes('http://localhost:3001/templates/${template.slug}'))
    violations.push('FireUX catalogue must refer to the Misebox owner')
  if (!fireuxDetail.includes('http://localhost:3001/templates/template-one'))
    violations.push('FireUX detail must redirect to the Misebox owner')

  if (violations.length)
    throw new Error(`[guard] ❌ Landing templates:\n- ${violations.join('\n- ')}`)
  console.log('[guard] ✅ Misebox template catalogue and Template One ownership valid')
}
