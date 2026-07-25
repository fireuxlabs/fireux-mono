// @fireux-script
// last_used: 2026-07-24
// usage_note: run through pnpm guard; protects reviewed Sproochli copy authority, language-state assets, and the Interlaken pilot.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  defineSproochliCopyPack,
  defineSproochliDialectProfile,
  formatSproochliCopy,
  resolveApprovedSproochliCopy,
} from '../../packages/extensions/fireux-sproochli/src/runtime/copy.ts'
import {
  isSproochliRtlLanguage,
  readSproochliAttachmentConfig,
  resolveSproochliLanguageOptions,
  resolveSproochliLanguageState,
  SPROOCHLI_LANGUAGE_OPTIONS,
} from '../../packages/extensions/fireux-sproochli/src/runtime/sproochli.ts'
import {
  MENU_BROWSE_SURFACE_COPY_FIELDS,
  MENU_SURFACE_COPY_VERSION,
  resolveMenuBrowseSurfaceCopy,
} from '../../packages/extensions/fireux-kitchens/src/runtime/content/menu-surface-copy.ts'
import {
  TranslationMemoryStorage,
} from '../../packages/extensions/fireux-sproochli/src/runtime/models/translation.model.ts'
import {
  makeSproochliMenuCacheKey,
  makeSproochliSourceHash,
} from '../../projects/fireux/sproochli/server/utils/sproochliTranslationKey.ts'
import {
  INTERLAKEN_SITE_DEFAULT_LANGUAGE,
  INTERLAKEN_SITE_LANGUAGE_CODES,
  INTERLAKEN_SITE_LANGUAGE_OPTIONS,
  normalizeInterlakenSiteLanguage,
  resolveInterlakenSiteLanguage,
} from '../../projects/misebox/interlaken-essen/app/content/sproochli-site.ts'
import {
  interlakenCopy,
  interlakenCopyPack,
} from '../../projects/misebox/interlaken-essen/app/content/sproochli-copy.ts'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const languages = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/composables/fireux/sproochli/publicLanguage.ts'
  )
  const endpoint = read(
    repoRoot,
    'projects/fireux/sproochli/server/api/tools/copy/draft.post.ts'
  )
  const pilot = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/content/sproochli-copy.ts'
  )
  const interlakenSiteLanguage = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/composables/useInterlakenSproochli.ts'
  )
  const interlakenMarketplaceLayout = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/layouts/marketplace.vue'
  )
  const interlakenApp = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/app.vue'
  )
  const interlakenPublicCopy = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/content/sproochli-copy-public.ts'
  )
  const interlakenManifest = read(
    repoRoot,
    'projects/misebox/interlaken-essen/public/manifest.webmanifest'
  )
  const interlakenMeta = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/meta.ts'
  )
  const interlakenFutter = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/content/futter.ts'
  )
  const interlakenFeed = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/components/marketplace/Shared.vue'
  )
  const interlakenStyles = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/assets/styles/main.css'
  )
  const interlakenOwnedCopyConsumers = [
    'projects/misebox/interlaken-essen/app/layouts/marketplace.vue',
    'projects/misebox/interlaken-essen/app/pages/index.vue',
    'projects/misebox/interlaken-essen/app/pages/marktplatz/index.vue',
    'projects/misebox/interlaken-essen/app/pages/marktplatz/[sellerId].vue',
    'projects/misebox/interlaken-essen/app/pages/choufe/index.vue',
    'projects/misebox/interlaken-essen/app/pages/choufe/[sectionId].vue',
    'projects/misebox/interlaken-essen/app/pages/verchoufe.vue',
    'projects/misebox/interlaken-essen/app/pages/mis.vue',
    'projects/misebox/interlaken-essen/app/components/Market/OnboardingModal.vue',
    'projects/misebox/interlaken-essen/app/components/MarketLaunchNotice.vue',
    'projects/misebox/interlaken-essen/app/components/choufe/Main.vue',
    'projects/misebox/interlaken-essen/app/components/verchoufe/Main.vue',
    'projects/misebox/interlaken-essen/app/components/marketplace/Shared.vue',
    'projects/misebox/interlaken-essen/app/components/marketplace/SellerCard.vue',
    'projects/misebox/interlaken-essen/app/components/marketplace/Storefront.vue',
  ].map(relativePath => read(repoRoot, relativePath))
  const translationReadme = read(
    repoRoot,
    'packages/extensions/fireux-translation/README.md'
  )
  const languageTrigger = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/components/Sproochli/LanguageTrigger.vue'
  )
  const defaultLanguageMark = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/components/Sproochli/DefaultLanguageMark.vue'
  )
  const assetsPage = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/pages/assets.vue'
  )
  const appConfig = read(
    repoRoot,
    'projects/fireux/sproochli/app/app.config.ts'
  )
  const defaultAsset = read(
    repoRoot,
    'projects/fireux/sproochli/public/img/app/language-default.svg'
  )
  const kitchenSproochliEndpoint = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/sproochli.ts'
  )
  const menuBrowse = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/components/Menu/Browse/Index.vue'
  )
  const menuReader = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/menu/useMenu.ts'
  )
  const menuTranslator = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/menu/useSproochliMenuTranslation.ts'
  )
  const menuEndpoint = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId].get.ts'
  )
  const menuPayload = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/menu/payload/build.ts'
  )
  const menuTranslationEndpoint = read(
    repoRoot,
    'projects/fireux/sproochli/server/api/tools/menu/translate.post.ts'
  )
  const translationMemory = read(
    repoRoot,
    'projects/fireux/sproochli/server/utils/sproochliTranslationMemory.ts'
  )
  const kitchenMenuScope = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/menu/ownership/kitchen-scope.ts'
  )

  assert.match(languages, /\|\s*'gsw'/)
  assert.match(endpoint, /sourceLanguage !== 'en'/)
  assert.match(endpoint, /targetLanguage !== 'gsw'/)
  assert.match(endpoint, /status: 'ai_draft'/)
  assert.doesNotMatch(endpoint, /translateSproochliTextBatch|google/i)
  assert.match(pilot, /defineSproochliCopyPack/)
  assert.equal(
    interlakenCopyPack.profile.id,
    'interlaken-berner-oberland-v1'
  )
  assert.equal(INTERLAKEN_SITE_DEFAULT_LANGUAGE, 'gsw')
  assert.deepEqual(
    INTERLAKEN_SITE_LANGUAGE_CODES,
    ['gsw', 'en']
  )
  assert.deepEqual(
    INTERLAKEN_SITE_LANGUAGE_OPTIONS.map(option => option.code),
    ['gsw', 'en']
  )
  assert.ok(
    INTERLAKEN_SITE_LANGUAGE_OPTIONS.every(
      option => option.source === 'attached'
    )
  )
  assert.equal(
    INTERLAKEN_SITE_LANGUAGE_OPTIONS.some(option => !option.code),
    false
  )
  assert.equal(normalizeInterlakenSiteLanguage('en'), 'en')
  assert.equal(normalizeInterlakenSiteLanguage('fr'), '')
  assert.equal(normalizeInterlakenSiteLanguage('es'), '')
  assert.equal(resolveInterlakenSiteLanguage('unsupported'), 'gsw')
  assert.equal(interlakenCopy('buy', 'gsw'), 'Choufe')
  assert.equal(interlakenCopy('buy', 'en'), 'Buy')
  assert.ok(Object.keys(interlakenCopyPack.entries).length >= 100)
  assert.ok(
    Object.values(interlakenCopyPack.entries).every(
      entry =>
        entry.status === 'approved' &&
        entry.source_language === 'en' &&
        entry.target_language === 'gsw' &&
        entry.provenance.reviewed_by === 'interlaken-essen' &&
        Boolean(entry.provenance.reviewed_at)
    )
  )
  for (const [key, entry] of Object.entries(interlakenCopyPack.entries)) {
    const variables = Object.fromEntries(
      [...entry.source_text.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
        .map(match => [match[1], 'test'])
    )
    assert.equal(typeof interlakenCopy(key, 'en', variables), 'string')
    assert.equal(typeof interlakenCopy(key, 'gsw', variables), 'string')
  }
  assert.match(interlakenSiteLanguage, /useCookie<string>/)
  assert.match(interlakenSiteLanguage, /route\.query\.sproochli/)
  assert.match(interlakenMarketplaceLayout, /SproochliLanguageTrigger/)
  assert.match(interlakenMarketplaceLayout, /siteSproochli\.languageOptions/)
  assert.match(interlakenMarketplaceLayout, /siteSproochli\.selectedLanguage/)
  assert.match(interlakenMarketplaceLayout, /language_trigger_heading/)
  assert.match(interlakenMarketplaceLayout, /language_trigger_current/)
  assert.match(interlakenApp, /useInterlakenCopy/)
  assert.match(interlakenApp, /htmlAttrs/)
  assert.match(interlakenApp, /lang: locale\.value/)
  assert.doesNotMatch(interlakenMarketplaceLayout, /htmlAttrs/)
  assert.ok(
    interlakenOwnedCopyConsumers.every(
      consumer => consumer.includes('useInterlakenCopy')
    )
  )
  assert.match(interlakenPublicCopy, /language_trigger_description/)
  assert.match(interlakenManifest, /Lokali Läbensmittel/)
  assert.match(interlakenManifest, /"lang": "gsw-CH"/)
  assert.doesNotMatch(interlakenManifest, /Lokale Lebensmittel/)
  assert.match(interlakenMeta, /defaultCopy\('app_meta_headline'\)/)
  assert.match(
    interlakenMeta,
    /defaultCopy\('app_meta_seo_description'\)/
  )
  assert.doesNotMatch(interlakenMeta, /Local food, offered nearby/)
  assert.match(
    interlakenFutter,
    /slug: 'wo-sind-die-chuehlschraenke'/
  )
  assert.match(
    interlakenFutter,
    /slug: 'interlaken-essen-isch-live'/
  )
  assert.doesNotMatch(interlakenFutter, /feed_launch_title/)
  assert.match(interlakenFeed, /blogPost\.featuredImage/)
  assert.match(
    interlakenStyles,
    /button\.market-language\.sproochli-language-trigger--emoji/
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'projects/misebox/interlaken-essen/app/pages/choufe.vue'
      )
    ),
    false
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'projects/misebox/interlaken-essen/app/pages/choufe/index.vue'
      )
    ),
    true
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'projects/misebox/interlaken-essen/public/img/app/social-launch-en.png'
      )
    ),
    true
  )
  assert.match(translationReadme, /does not own reviewed authored copy/)
  assert.match(languageTrigger, /pageHasMixedSource/)
  assert.match(languageTrigger, /SproochliDefaultLanguageMark/)
  assert.match(languageTrigger, /copy\?: Partial<SproochliLanguageTriggerCopy>/)
  assert.match(languageTrigger, /triggerCopy\.heading/)
  assert.match(languageTrigger, /triggerCopy\.description/)
  assert.match(languageTrigger, /triggerCopy\.cached/)
  assert.match(languageTrigger, /sproochli-language-trigger--emoji/)
  assert.match(languageTrigger, /background: transparent !important/)
  assert.doesNotMatch(languageTrigger, /transform:\s*scale/)
  assert.doesNotMatch(languageTrigger, /i-lucide-languages/)
  assert.match(languageTrigger, /defaultOption\.value\?\.label/)
  assert.match(
    languageTrigger,
    /return triggerCopy\.value\.defaultSelection/
  )
  assert.match(languageTrigger, /showWhenSingleOption/)
  assert.match(languageTrigger, /onlyOriginalOption/)
  assert.doesNotMatch(languageTrigger, />\s*Cached\s*</)
  assert.match(languageTrigger, /key: 'cached'/)
  assert.match(languageTrigger, /showSeparator: cached\.length > 0/)
  assert.match(languageTrigger, /option\.source !== 'on_demand'/)
  assert.match(languageTrigger, /option\.source === 'on_demand'/)
  assert.doesNotMatch(languageTrigger, /:disabled=/)
  assert.doesNotMatch(languageTrigger, /Not published/)
  assert.match(assetsPage, /fireuxAssets/)
  assert.match(appConfig, /language-default\.svg/)
  assert.doesNotMatch(appConfig, /language-default-english/)
  assert.match(defaultAsset, /Default language indicator/)
  for (const signature of [
    'M25 38C39 24 58 21 73 29',
    'M103 90C89 104 70 107 55 99',
    'circle cx="53" cy="64" r="4"',
    'circle cx="75" cy="64" r="4"',
    '#A78BFA',
    '#FF947E',
    '#FFF4DE',
  ]) {
    assert.ok(defaultLanguageMark.includes(signature))
    assert.ok(defaultAsset.includes(signature))
  }
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'projects/fireux/sproochli/public/img/app/language-default-english.svg'
      )
    ),
    false
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-sproochli/src/runtime/assets/sproochli/translate-trigger-compact.png'
      )
    ),
    false
  )
  assert.match(kitchenSproochliEndpoint, /transaction\.update\(rootRef/)
  assert.match(kitchenSproochliEndpoint, /FieldValue\.delete\(\)/)
  assert.match(kitchenSproochliEndpoint, /serverAuditStamp/)
  assert.match(menuBrowse, /SproochliLanguageTrigger/)
  assert.match(menuBrowse, /show-group-labels/)
  assert.match(menuBrowse, /show-when-single-option/)
  assert.match(menuBrowse, /useSproochliMenuTranslation/)
  assert.match(menuBrowse, /browseSurfaceCopy\.browseLabel/)
  assert.match(menuBrowse, /browseSurfaceCopy\.allergyTitle/)
  assert.doesNotMatch(menuBrowse, /label="Browse"/)
  assert.doesNotMatch(menuBrowse, />Allergies or intolerances\?<\/strong>/)
  assert.match(menuTranslator, /requestSproochliMenuTranslations/)
  assert.match(menuTranslator, /source: 'cache' as const/)
  assert.match(menuTranslator, /cachedLanguages/)
  assert.match(menuTranslator, /MENU_BROWSE_SURFACE_COPY_FIELDS/)
  assert.match(menuTranslator, /surfaceCopyCacheKey/)
  assert.match(menuTranslator, /resolveMenuBrowseSurfaceCopy/)
  assert.doesNotMatch(menuTranslator, /\$fetch<[^>]*>\([^)]*method:\s*'POST'/s)
  assert.match(menuReader, /query\.set\('sproochli'/)
  assert.match(menuEndpoint, /normalizeSproochliLanguage\(query\.sproochli\)/)
  assert.match(menuPayload, /publicLanguages: \[\]/)
  assert.doesNotMatch(menuPayload, /onDemandLanguages:\s*\[\]/)
  assert.doesNotMatch(menuPayload, /catalogueLanguages/)
  assert.match(kitchenMenuScope, /readKitchenSproochliConfig\(kitchenData\)/)
  assert.equal(TranslationMemoryStorage.collection, 'translation_memory')
  assert.equal(TranslationMemoryStorage.access, 'server-only')
  assert.match(menuTranslationEndpoint, /readSproochliTranslationMemory/)
  assert.match(menuTranslationEndpoint, /writeSproochliTranslationMemory/)
  assert.match(menuTranslationEndpoint, /memory_hit = true/)
  assert.match(menuTranslationEndpoint, /MAX_TOTAL_SOURCE_TEXT_LENGTH/)
  assert.match(menuTranslationEndpoint, /MAX_TARGET_LANGUAGES/)
  assert.match(menuTranslationEndpoint, /MAX_TRANSLATION_UNITS/)
  assert.match(menuTranslationEndpoint, /SUPPORTED_LANGUAGES/)
  assert.match(menuTranslationEndpoint, /google-cloud-translation/)
  assert.ok(
    menuTranslationEndpoint.indexOf(
      'memoryHits = await readSproochliTranslationMemory'
    ) <
      menuTranslationEndpoint.indexOf('translateSproochliMenuFieldWithAi(event')
  )
  assert.match(translationMemory, /getRuntimeFirestore\('sproochli'\)/)
  assert.match(translationMemory, /review_status:\s*'unreviewed'/)
  assert.match(translationMemory, /transaction\.getAll\(\.\.\.refs\)/)
  assert.match(translationMemory, /transaction\.create\(snapshot\.ref/)
  assert.doesNotMatch(translationMemory, /batch\.set|transaction\.set/)

  const memoryKeyInput = {
    cacheVersion: 'menu_translation_memory_v1',
    domain: 'restaurant_menu',
    fieldKind: 'dish_name',
    sourceHash: makeSproochliSourceHash('Margherita'),
    sourceLanguage: 'auto',
    targetLanguage: 'fr',
    glossaryVersion: 'restaurant_menu_v1',
  }
  const memoryKey = makeSproochliMenuCacheKey(memoryKeyInput)
  assert.match(memoryKey, /^fr__[a-f0-9]{40}$/)
  for (const patch of [
    { cacheVersion: 'menu_translation_memory_v2' },
    { domain: 'public_chrome' },
    { fieldKind: 'dish_description' },
    { sourceHash: makeSproochliSourceHash('Marinara') },
    { sourceLanguage: 'en' },
    { targetLanguage: 'it' },
    { glossaryVersion: 'restaurant_menu_v2' },
  ]) {
    assert.notEqual(
      makeSproochliMenuCacheKey({ ...memoryKeyInput, ...patch }),
      memoryKey
    )
  }

  assert.deepEqual(
    readSproochliAttachmentConfig({
      enabled: true,
      default_language: 'mixed',
      requested_languages: ['gsw', 'gsw', 'unsupported'],
    }),
    {
      enabled: true,
      default_language: 'mixed',
      requested_languages: ['gsw'],
    }
  )
  assert.deepEqual(
    resolveSproochliLanguageOptions({
      enabled: true,
      onDemandLanguages: [],
    }),
    [{ code: '', label: '', name: 'Original', source: 'original' }]
  )
  const catalogueState = resolveSproochliLanguageState({ enabled: true })
  assert.equal(
    catalogueState.options.length,
    SPROOCHLI_LANGUAGE_OPTIONS.length
  )
  assert.equal(
    catalogueState.selectableLanguages.length,
    SPROOCHLI_LANGUAGE_OPTIONS.length
  )
  assert.ok(
    catalogueState.options
      .filter(option => option.code)
      .every(option => option.source === 'on_demand')
  )
  assert.equal(isSproochliRtlLanguage('fa'), true)
  assert.equal(isSproochliRtlLanguage('ur'), true)
  assert.equal(MENU_SURFACE_COPY_VERSION, 'v1')
  assert.equal(MENU_BROWSE_SURFACE_COPY_FIELDS.length, 5)
  assert.equal(
    new Set(MENU_BROWSE_SURFACE_COPY_FIELDS.map(field => field.id)).size,
    MENU_BROWSE_SURFACE_COPY_FIELDS.length
  )
  assert.ok(
    MENU_BROWSE_SURFACE_COPY_FIELDS.every(
      field => field.id.startsWith('menu-surface:v1:') && field.sourceText
    )
  )
  assert.deepEqual(resolveMenuBrowseSurfaceCopy(), {
    browseLabel: 'Browse',
    browseDescription: 'View the menu or choose how you would like to order.',
    allergyAriaLabel: 'Allergy information',
    allergyTitle: 'Allergies or intolerances?',
    allergyBody:
      'Please ask the kitchen about allergies or dietary requirements.',
  })
  assert.deepEqual(
    resolveMenuBrowseSurfaceCopy(new Map([
      ['menu-surface:v1:browse:label', 'Parcourir'],
    ])),
    {
      browseLabel: 'Parcourir',
      browseDescription: 'View the menu or choose how you would like to order.',
      allergyAriaLabel: 'Allergy information',
      allergyTitle: 'Allergies or intolerances?',
      allergyBody:
        'Please ask the kitchen about allergies or dietary requirements.',
    }
  )

  const profile = defineSproochliDialectProfile({
    id: 'test-profile',
    language_code: 'gsw',
    locale: 'gsw-CH',
    region: 'Berner Oberland',
    style: 'Readable',
    glossary: {},
  })
  const approved = defineSproochliCopyPack({
    id: 'test-pack',
    profile,
    entries: {
      buy: {
        key: 'buy',
        source_language: 'en',
        source_text: 'Buy',
        target_language: 'gsw',
        target_text: 'Choufe',
        profile_id: profile.id,
        status: 'approved',
        provenance: { kind: 'human', reviewed_by: 'reviewer' },
      },
    },
  })
  assert.equal(resolveApprovedSproochliCopy(approved, 'buy'), 'Choufe')
  assert.equal(resolveApprovedSproochliCopy(approved, 'buy', 'en'), 'Buy')
  assert.equal(formatSproochliCopy('Hello {name}', { name: 'Ada' }), 'Hello Ada')
  assert.throws(() => formatSproochliCopy('Hello {name}'))
  assert.throws(() =>
    defineSproochliCopyPack({
      id: 'bad-token-pack',
      profile,
      entries: {
        greeting: {
          key: 'greeting',
          source_language: 'en',
          source_text: 'Hello {name}',
          target_language: 'gsw',
          target_text: 'Hoi {person}',
          profile_id: profile.id,
          status: 'approved',
          provenance: { kind: 'human', reviewed_by: 'reviewer' },
        },
      },
    })
  )
  assert.throws(() =>
    resolveApprovedSproochliCopy(
      {
        ...approved,
        entries: { buy: { ...approved.entries.buy, status: 'ai_draft' } },
      },
      'buy'
    )
  )
}
