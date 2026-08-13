// @fireux-script
// last_used: 2026-08-11
// usage_note: guards Misebox-owned Template One and FireUX referral ownership.
import { readFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
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
  const basicPresentation = readFileSync(
    path.join(runtime, 'kitchen-basic-presentation.ts'),
    'utf8'
  )
  const atoms = readFileSync(path.join(runtime, 'TemplateOneAtoms.vue'), 'utf8')
  const switcher = readFileSync(
    path.join(runtime, 'TemplateOneBrandSwitcher.vue'),
    'utf8'
  )
  const processScene = readFileSync(
    path.join(runtime, 'TemplateOneProcessScene.vue'),
    'utf8'
  )
  const sceneOne = readFileSync(
    path.join(runtime, 'TemplateOneSceneOne.vue'),
    'utf8'
  )
  const contract = readFileSync(path.join(runtime, 'template-one.ts'), 'utf8')
  const typography = readFileSync(
    path.join(runtime, 'TemplateOneTypography.vue'),
    'utf8'
  )
  const themeTypes = readFileSync(
    path.join(repoRoot, 'packages/core/fireux-core/src/types/theme.ts'),
    'utf8'
  )
  const appMedia = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/appMedia.ts'
    ),
    'utf8'
  )
  const appMediaRequirements = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/app-media-requirements.ts'
    ),
    'utf8'
  )
  const entityAssetOnboarding = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/models/operations/entity-asset-onboarding.ts'
    ),
    'utf8'
  )
  const miseboxDetail = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/pages/templates/[slug].vue'
    ),
    'utf8'
  )
  const assetReadiness = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/components/templates/TemplateOneAssetReadiness.vue'
    ),
    'utf8'
  )
  const paletteProgression = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/components/templates/TemplatePaletteProgression.vue'
    ),
    'utf8'
  )
  const heroProps = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/components/templates/TemplateOneHeroProps.vue'
    ),
    'utf8'
  )
  const placePreview = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/components/templates/TemplateOnePlacePreview.vue'
    ),
    'utf8'
  )
  const kitchenPreview = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/misebox-app/app/components/templates/TemplateOneKitchenPreview.vue'
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
  const friiitesProcess = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/friiites/app/components/FriiitesProcessScene.vue'
    ),
    'utf8'
  )
  const friiitesHero = readFileSync(
    path.join(
      repoRoot,
      'projects/misebox/friiites/app/components/FriiitesHeroScene.vue'
    ),
    'utf8'
  )
  const friiitesIndex = readFileSync(
    path.join(repoRoot, 'projects/misebox/friiites/app/pages/index.vue'),
    'utf8'
  )

  for (const fixture of [
    "id: 'seehotel-bonigen'",
    "id: 'pizza-the-action'",
    "id: 'friiites'",
    "id: 'deanos'",
  ])
    if (!fixtures.includes(fixture))
      violations.push(`missing Template One fixture ${fixture}`)
  for (const [id, tier] of [
    ['seehotel-bonigen', 'root'],
    ['pizza-the-action', 'console'],
    ['friiites', 'app'],
    ['deanos', 'app'],
  ]) {
    const fixturePattern = new RegExp(
      `id: '${id}',[\\s\\S]{0,100}tier: '${tier}'`
    )
    if (!fixturePattern.test(fixtures))
      violations.push(`${id} must remain classified as ${tier}`)
  }
  if (!fixtures.includes("slug: 'template-one'"))
    violations.push('Template One must own the neutral slug')
  if (!fixtures.includes("slug: 'template-two'"))
    violations.push('Template Two must be independently routable')
  if (
    !basicPresentation.includes("MISEBOX_BASIC_PRIMARY_COLOR = '#2563eb'") ||
    !basicPresentation.includes("placePrimaryColorSource: 'projected' | 'misebox-default'") ||
    !basicPresentation.includes('identityImageRole') ||
    !fixtures.includes('MISEBOX_BASIC_PRIMARY_COLOR')
  )
    violations.push(
      'Misebox Basic must resolve one provenance-aware ecosystem fallback without invented identity media'
    )
  if (
    !atoms.includes('Root · Basic') ||
    !atoms.includes("value ? 'Present' : 'Missing'") ||
    !atoms.includes('basicPresentation.placeImageSrc') ||
    !miseboxDetail.includes('/api/kitchens/${selectedKitchen.value.id}') ||
    !miseboxDetail.includes(':basic-presentation="basicPresentation"') ||
    !miseboxDetail.includes("'kitchens/pizza-the-action/logo.png'") ||
    !atoms.includes('basicPresentation.identityImageSrc')
  )
    violations.push(
      'Root comparison must present live Basic identity and explicit missing fields'
    )
  if (
    !contract.includes("present: 'wordmark'") ||
    fixtures.match(/present: 'wordmark'/g)?.length !== 2 ||
    !contract.includes("identityAlignment: 'left' | 'center'") ||
    !fixtures.includes("identityAlignment: 'left'") ||
    !fixtures.includes("identityAlignment: 'center'")
  )
    violations.push(
      'Scene One must align identity media through one bounded injection option'
    )
  if (
    contract.includes('textureSrc') ||
    fixtures.includes('textureSrc') ||
    !existsSync(
      path.join(runtime, 'public/img/template-one/charcoal-texture.webp')
    )
  )
    violations.push(
      'Scene One texture must remain Template One-owned and identical across brands'
    )
  if (
    !sceneOne.includes('class="template-one-scene-one__scroll-cue"') ||
    !sceneOne.includes('href="#method"') ||
    !sceneOne.includes('aria-label="Scroll to explore"') ||
    !sceneOne.includes('<span>Scroll to explore</span>') ||
    contract.includes('scrollLabel') ||
    fixtures.includes('scrollLabel')
  )
    violations.push(
      'Scene One scroll cue must remain fixed Template One anatomy rather than an App injection'
    )
  if (
    !switcher.includes("brand.tier === 'root'") ||
    !switcher.includes("brand.tier === 'console'") ||
    !switcher.includes("brand.tier === 'app'") ||
    !switcher.includes('App Kitchens · inherited base')
  )
    violations.push(
      'the four Kitchen choices must be grouped as Root, Console, and two App injections'
    )
  if (
    !contract.includes(
      "import type { BrandPalette } from 'fireux-core/runtime/models/utils/style.model'"
    )
  )
    violations.push('Template One must consume the canonical Core BrandPalette')
  if (!contract.includes('export type TemplateOneKitchenSpecimen'))
    violations.push(
      'Root and Console examples must remain progression specimens, not brand injections'
    )
  if (!fixtures.includes('Place primary colour, Console theme, then App template.'))
    violations.push('Template One must preserve the presentation progression')
  if (
    !fixtures.includes('const friiitesConsolePalette = consolePaletteFromApp(friiitesAppPalette)') ||
    !fixtures.includes('const deanosConsolePalette = consolePaletteFromApp(deanosAppPalette)') ||
    !fixtures.includes('compactAppPalette(friiitesAppPalette, friiitesConsolePalette)') ||
    !fixtures.includes('compactAppPalette(deanosAppPalette, deanosConsolePalette)')
  )
    violations.push(
      'App-tier template specimens must derive Console and sparse App layers from one complete source palette'
    )
  if (
    !paletteProgression.includes('What comes from where') ||
    !paletteProgression.includes('No override stored. Contributes no colour at this layer.') ||
    !paletteProgression.includes('appKeyOrder.filter')
  )
    violations.push(
      'Palette ownership must show each stored contribution once without inherited duplicates or absent App roles'
    )
  if (
    !themeTypes.includes('export type AppTypography = {') ||
    !themeTypes.includes('display_family: string') ||
    !themeTypes.includes('body_family: string') ||
    !contract.includes('typography: AppTypography') ||
    !fixtures.includes('display_family:') ||
    !fixtures.includes('body_family:') ||
    !typography.includes('Two families. Four roles.') ||
    !typography.includes('COMING SOON.') ||
    !typography.includes('HOUSE SPECIALS') ||
    !typography.includes('Coming soon to a location near you.') ||
    !typography.includes('03 · LOCATIONS') ||
    !typography.includes('ORDER NOW') ||
    !typography.includes('--template-one-display-family') ||
    !typography.includes('--template-one-body-family') ||
    !miseboxDetail.includes("v-if=\"template.slug === 'template-one'\"") ||
    !miseboxDetail.includes(':typography="selectedKitchen.appProps.typography"')
  )
    violations.push(
      'Template One typography must derive four semantic roles from exactly two App family inputs'
    )
  if (
    !miseboxDetail.includes('<TemplateOneAtoms') ||
    !miseboxDetail.includes(':injection="selectedKitchen"') ||
    !miseboxDetail.includes('TemplateOneBrandSwitcher')
  )
    violations.push('Misebox detail must render the four-Kitchen comparison')
  if (
    !miseboxDetail.includes('<TemplateOneSceneOne') ||
    !miseboxDetail.includes("'template-one-page--preview': isTemplatePreview") ||
    !miseboxDetail.includes("template.kind === 'template' && Boolean(selectedKitchen.value.appProps)") ||
    !miseboxDetail.includes('aria-label="Template preview tools"') ||
    !miseboxDetail.includes('<TemplateOneHeroProps') ||
    !heroProps.includes('aria-label="Level One Hero variables"') ||
    !miseboxDetail.includes('selectedKitchen.rootProps.placePrimaryColor') ||
    !miseboxDetail.includes('selectedKitchen.appProps.sceneOne.present') ||
    !miseboxDetail.includes('layout: false') ||
    miseboxDetail.includes('<TemplateOneProcessScene')
  )
    violations.push(
      'App fixtures must render only the shared full-screen Scene One composition'
    )
  if (
    fixtures.includes('localhost:3033') ||
    fixtures.includes('/__template-brands/') ||
    fixtures.includes('/img/app/brand/wordmark-dark-transparent.png') ||
    fixtures.includes('deanosWordmarkSrc') ||
    fixtures.includes('kitchens%2Fdeanos%2Flogo.png') ||
    sceneOne.includes('<AppBrandWordmark')
  )
    violations.push(
      'Tenant template previews must use owner Storage projections without sibling App mounts or FireUX fallback'
    )
  if (
    !appMedia.includes('apps/${appId}/${APP_IMAGE_RELATIVE_PATHS[kind]}') ||
    !appMedia.includes('resolveAppImageSources') ||
    !appMedia.includes('owningAppBundle') ||
    !appMediaRequirements.includes("wordmarkDark: 'img/app/wordmark-dark.png'")
  )
    violations.push(
      'App media must preserve canonical role paths and local-first owner resolution'
    )
  if (!heroProps.includes("wordmarkSrc ? 'Present' : 'Missing'"))
    violations.push('Template inspection must report canonical wordmark presence honestly')
  if (
    !entityAssetOnboarding.includes("root: ['logo', 'wordmarkLight', 'wordmarkDark']") ||
    !entityAssetOnboarding.includes("console: ['logo', 'wordmarkLight', 'wordmarkDark', 'cover', 'thumbnail']") ||
    !entityAssetOnboarding.includes("app: ['logo', 'wordmarkLight', 'wordmarkDark', 'cover', 'thumbnail']") ||
    !entityAssetOnboarding.includes('entityAssetDimensionsMatch') ||
    !miseboxIndex.includes('<TemplateOneAssetReadiness') ||
    !miseboxIndex.includes(':storage-readiness="appAssetReadiness"') ||
    !miseboxIndex.includes(":authority=\"selectedKitchen.demo ? 'demo' : 'app'\"") ||
    miseboxDetail.includes('<TemplateOneAssetReadiness') ||
    !assetReadiness.includes("props.authority !== 'demo'") ||
    !assetReadiness.includes("invalid: 'Needs attention'") ||
    !assetReadiness.includes('new Image()') ||
    !assetReadiness.includes("props.stage === 'app'")
  )
    violations.push(
      'Template inspection must enforce progressive Root, Console, and App asset readiness'
    )
  if (
    !miseboxDetail.includes('aria-label="Presentation inheritance"') ||
    !miseboxDetail.includes('<TemplateOnePlacePreview') ||
    miseboxDetail.indexOf('<TemplateOnePlacePreview') >
      miseboxDetail.indexOf('class="template-one-page__preview-shell"') ||
    !placePreview.includes('Place preview') ||
    !miseboxDetail.includes('<TemplateOneKitchenPreview') ||
    !kitchenPreview.includes('Kitchen preview') ||
    !kitchenPreview.includes('Browse menu') ||
    !miseboxDetail.includes("const levels = ['Place', 'Kitchen']") ||
    !miseboxDetail.includes('levels.push(\'Console\', `App + ${template.name}`)')
  )
    violations.push(
      'Template detail shell must expose the Place-to-Template inheritance path'
    )
  if (
    !miseboxIndex.includes('query: { kitchen: selectedKitchen.id }') ||
    !miseboxIndex.includes('`/templates/${item.slug}`') ||
    !miseboxDetail.includes('route.query.kitchen || route.query.brand')
  )
    violations.push('Misebox catalogue must select one Kitchen and carry it into each template')
  if (!fireuxIndex.includes('http://localhost:3001/templates/${template.slug}'))
    violations.push('FireUX catalogue must refer to the local Misebox owner')
  if (!fireuxReferral.includes('http://localhost:3001/templates/template-one'))
    violations.push('FireUX detail must redirect locally to Misebox')
  if (/Friiites|Deano/.test(atoms))
    violations.push('Template One anatomy must not contain fixture content')
  if (
    !sceneOne.includes('data-scene-layer="texture-shadow"') ||
    !sceneOne.includes('data-scene-layer="texture-highlight"')
  )
    violations.push('Template One must retain its fixed texture-layer anatomy')
  for (const removedAtom of ['displayTitle', 'filledAction', 'mediaFrame'])
    if (atoms.includes(removedAtom))
      violations.push(`first slice must not render ${removedAtom}`)
  if (
    !contract.includes('placePrimaryColor: string') ||
    !atoms.includes('Place primary colour') ||
    !atoms.includes('Out-of-box Menu')
  )
    violations.push(
      'Root comparison must expose the Place backdrop and out-of-box Menu'
    )
  if (/rootProps\.palette|Root atom/.test(`${contract}\n${atoms}`))
    violations.push('Place props must not own the App template palette')
  if (!atoms.includes('Inherited · Console') || !atoms.includes('Theme applied'))
    violations.push('App Kitchens must identify their inherited Console theme')
  if (atoms.includes('Root Kitchen has no Console theme'))
    violations.push(
      'Root presentation must not render or describe absent Console capability'
    )
  if (
    !processScene.includes('data-landing-scene="process"') ||
    !processScene.includes('data-scene-layer="content"')
  )
    violations.push('Template One process must preserve Scene and Layer hooks')
  if (!friiitesProcess.includes('TemplateOneProcessScene'))
    violations.push('Friiites Method must retain the audited Template One scene adapter')
  if (friiitesIndex.includes('<FriiitesProcessScene'))
    violations.push(
      'Friiites must not mount the next Template One composition before the identity and asset gates are complete'
    )
  if (
    !friiitesHero.includes('TemplateOneSceneOne') ||
    !sceneOne.includes('data-landing-scene="hero"') ||
    !sceneOne.includes('data-scene-layer="content"')
  )
    violations.push('Friiites Hero must consume the shared Template One Scene One')
  if (/hero\/drafts\//.test(friiitesHero))
    violations.push('Friiites Hero must not ship draft imagery')
  if (
    !fixtures.includes("label: 'Small plates'") ||
    !miseboxDetail.includes(':menu="templateOneMenuSample"')
  )
    violations.push(
      'Level One must render one shared neutral Menu section and item'
    )
  if (
    !atoms.includes(
      "MenuBrowseCatalogue from 'fireux-kitchens/runtime/components/Menu/Browse/Catalogue.vue'"
    )
  )
    violations.push('The sample Menu must use the real default Menu renderer')
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
      `${fixtures}\n${atoms}\n${processScene}\n${miseboxDetail}`
    )
  )
    violations.push('Template One must not own shared motion')

  if (violations.length)
    throw new Error(
      `[guard] ❌ Template One spine:\n- ${violations.join('\n- ')}`
    )
  console.log('[guard] ✅ Misebox-owned Template One and FireUX referral valid')
}
