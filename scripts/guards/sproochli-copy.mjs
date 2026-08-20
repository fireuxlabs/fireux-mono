// @fireux-script
// last_used: 2026-07-30
// usage_note: run through pnpm guard; protects reviewed Sproochli copy authority, language-state assets, and the Interlaken pilot.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  defineSproochliCopyPack,
  defineSproochliCopyProfile,
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
} from '../../packages/extensions/fireux-kitchens/src/runtime/menu/utils/menu-surface-copy.ts'
import { TranslationMemoryStorage } from '../../packages/extensions/fireux-sproochli/src/runtime/models/translation.model.ts'
import {
  makeSproochliMenuMemoryKey,
  makeSproochliSourceHash,
} from '../../packages/extensions/fireux-sproochli/src/runtime/server/menu/key.ts'
import {
  INTERLAKEN_SITE_DEFAULT_LANGUAGE,
  INTERLAKEN_SITE_LANGUAGE_CODES,
  INTERLAKEN_SITE_LANGUAGE_OPTIONS,
  isInterlakenSiteLanguageAvailableOnPath,
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
  const interlakenCopyComposable = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/composables/useInterlakenCopy.ts'
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
  const interlakenOnboardingModal = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/components/Market/OnboardingModal.vue'
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
  const interlakenStyleFacade = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/assets/styles/main.css'
  )
  const interlakenStyles = [
    interlakenStyleFacade,
    read(
      repoRoot,
      'projects/misebox/interlaken-essen/app/assets/styles/market-shell.css'
    ),
    read(
      repoRoot,
      'projects/misebox/interlaken-essen/app/assets/styles/market-discovery.css'
    ),
  ].join('\n')
  const interlakenPersonalMarketplace = [
    'projects/misebox/interlaken-essen/app/pages/mis.vue',
    'projects/misebox/interlaken-essen/app/composables/usePersonalMarketplace.ts',
  ]
    .map((relativePath) => read(repoRoot, relativePath))
    .join('\n')
  const interlakenMarketplaceOnboarding = [
    'projects/misebox/interlaken-essen/app/components/Market/OnboardingModal.vue',
    'projects/misebox/interlaken-essen/app/composables/useMarketplaceOnboarding.ts',
  ]
    .map((relativePath) => read(repoRoot, relativePath))
    .join('\n')
  const interlakenOwnedCopyConsumers = [
    ...[
      'projects/misebox/interlaken-essen/app/layouts/marketplace.vue',
      'projects/misebox/interlaken-essen/app/pages/index.vue',
      'projects/misebox/interlaken-essen/app/pages/marktplatz/index.vue',
      'projects/misebox/interlaken-essen/app/pages/marktplatz/[sellerId].vue',
      'projects/misebox/interlaken-essen/app/pages/choufe/index.vue',
      'projects/misebox/interlaken-essen/app/pages/choufe/[sectionId].vue',
      'projects/misebox/interlaken-essen/app/pages/verchoufe.vue',
      'projects/misebox/interlaken-essen/app/components/MarketLaunchNotice.vue',
      'projects/misebox/interlaken-essen/app/components/choufe/Main.vue',
      'projects/misebox/interlaken-essen/app/components/verchoufe/Main.vue',
      'projects/misebox/interlaken-essen/app/components/marketplace/Shared.vue',
      'projects/misebox/interlaken-essen/app/components/marketplace/CanonicalSellerCard.vue',
      'projects/misebox/interlaken-essen/app/components/marketplace/CanonicalStorefront.vue',
    ].map((relativePath) => read(repoRoot, relativePath)),
    interlakenPersonalMarketplace,
    interlakenMarketplaceOnboarding,
  ]
  const interlakenMarketplacePublicSurfaces = [
    'projects/misebox/interlaken-essen/app/pages/marktplatz/index.vue',
    'projects/misebox/interlaken-essen/app/pages/marktplatz/[sellerId].vue',
    'projects/misebox/interlaken-essen/app/pages/choufe/[sectionId].vue',
  ]
    .map((relativePath) => read(repoRoot, relativePath))
    .join('\n')
  const translationReadme = read(
    repoRoot,
    'packages/extensions/fireux-translation/README.md'
  )
  const sproochliReadme = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/README.md'
  )
  const languageTriggerFacade = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/components/Sproochli/LanguageTrigger.vue'
  )
  const languageTrigger = [
    languageTriggerFacade,
    read(
      repoRoot,
      'packages/extensions/fireux-sproochli/src/runtime/components/Sproochli/language-trigger.css'
    ),
  ].join('\n')
  const defaultLanguageMark = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/components/Sproochli/DefaultLanguageMark.vue'
  )
  const sproochliWordmark = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/components/Sproochli/Wordmark.vue'
  )
  const assetsPage = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/pages/assets.vue'
  )
  const appConfig = read(
    repoRoot,
    'projects/fireux/sproochli/app/app.config.ts'
  )
  const sharedDefaultAsset = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-sproochli/src/runtime/assets/sproochli/default-language-mark.webp'
    )
  )
  const defaultAsset = readFileSync(
    path.join(
      repoRoot,
      'projects/fireux/sproochli/public/img/app/language-default.webp'
    )
  )
  const kitchenSproochliEndpoint = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/sproochli.ts'
  )
  const menuBrowse = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/components/Browse/Index.vue'
  )
  const menuReader = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenu.ts'
  )
  const menuResolver = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/sproochli/resolve.ts'
  )
  const menuManifestModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-detail.model.ts'
  )
  const menuProvider = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/composables/fireux/sproochli/provider.ts'
  )
  const menuProviderClient = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/server/menu/provider-client.ts'
  )
  const coreEcosystemConfigTypes = read(
    repoRoot,
    'packages/core/fireux-core/src/types/ecosystem.ts'
  )
  const coreNitroConfig = read(
    repoRoot,
    'packages/core/fireux-core/src/config/app/nitro.ts'
  )
  const coreEcosystemWiring = read(
    repoRoot,
    'packages/core/fireux-core/src/config/module/ecosystem-wiring.ts'
  )
  const miseboxEcosystemConfig = read(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/config/firebase/ecosystem.config.ts'
  )
  const firebaseOutputPreparation = read(
    repoRoot,
    'scripts/prepare-firebase-output.mjs'
  )
  const sproochliRuntimeEnvironment = read(
    repoRoot,
    'projects/fireux/sproochli/server/firebase.runtime-env.json'
  )
  const miseboxRuntimeEnvironment = read(
    repoRoot,
    'projects/misebox/misebox-app/server/firebase.runtime-env.json'
  )
  const menuEndpoint = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId].get.ts'
  )
  const menuPayload = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/build.ts'
  )
  const kitchenMenuModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/models/kitchen-menu.model.ts'
  )
  const rootMenuModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/models/menu.model.ts'
  )
  const menuRootEntry = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/utils/root-entry.ts'
  )
  const menuPayloadTypes = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/types.ts'
  )
  const menuTranslationEndpoint = read(
    repoRoot,
    'projects/fireux/sproochli/server/api/tools/menu/index.post.ts'
  )
  const menuTranslationOptions = read(
    repoRoot,
    'projects/fireux/sproochli/server/api/tools/menu/index.options.ts'
  )
  const menuProviderAuth = read(
    repoRoot,
    'projects/fireux/sproochli/server/utils/sproochliMenuProviderAuth.ts'
  )
  const sproochliTools = read(
    repoRoot,
    'projects/fireux/sproochli/server/utils/sproochliTools.ts'
  )
  const sproochliHostTarget = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/host.ts'
  )
  const sproochliHostStorage = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/server/menu/storage.ts'
  )
  const menuCompleteCache = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/server/menu/translation-cache.ts'
  )
  const translationMemory = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/server/menu/translation-memory.ts'
  )
  const menuMemoryRecipe = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/server/menu/translation-recipe.ts'
  )
  const translationModel = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/models/translation.model.ts'
  )
  const menuCacheContract = read(
    repoRoot,
    'packages/extensions/fireux-sproochli/src/runtime/menu-cache.ts'
  )
  const menuAiSchema = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/ai/schema.ts'
  )
  const menuAiExtraction = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/ai/extraction.ts'
  )
  const menuAiNormalization = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/ai/normalization.ts'
  )
  const menuDraftSections = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/draft/sections.ts'
  )
  const menuDraftWrite = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/draft/write.ts'
  )
  const kitchenMenuCacheImport = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/sproochli/cache-import.ts'
  )
  const menuConfirmEndpoint = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/menus/confirm.post.ts'
  )
  const sproochliHostRules = read(
    repoRoot,
    'scripts/firebase/sproochli/server-only.rules'
  )
  const sproochliHostFirebaseConfig = read(
    repoRoot,
    'scripts/firebase/sproochli/misebox.firebase.json'
  )
  const sproochliHostMigration = read(
    repoRoot,
    'scripts/migrate-sproochli-host-storage.mjs'
  )
  const kitchenMenuScope = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/menu/server/ownership/kitchen-scope.ts'
  )

  assert.match(languages, /\|\s*'gsw'/)
  assert.match(endpoint, /sourceLanguage !== 'en'/)
  assert.match(endpoint, /targetLanguage !== 'gsw'/)
  assert.match(endpoint, /translations:\s*{\s*gsw:/s)
  assert.match(endpoint, /status: 'ai_draft'/)
  assert.doesNotMatch(endpoint, /target_text/)
  assert.doesNotMatch(endpoint, /translateSproochliTextBatch|google/i)
  assert.match(pilot, /defineSproochliCopyPack/)
  assert.equal(
    interlakenCopyPack.profiles.gsw.id,
    'interlaken-berner-oberland-v1'
  )
  assert.equal(
    interlakenCopyPack.profiles.de.id,
    'interlaken-swiss-standard-german-v1'
  )
  assert.equal(interlakenCopyPack.profiles.de.locale, 'de-CH')
  assert.equal(INTERLAKEN_SITE_DEFAULT_LANGUAGE, 'gsw')
  assert.deepEqual(INTERLAKEN_SITE_LANGUAGE_CODES, ['gsw', 'de', 'en'])
  assert.deepEqual(
    INTERLAKEN_SITE_LANGUAGE_OPTIONS.map((option) => option.code),
    ['gsw', 'de', 'en']
  )
  assert.ok(
    INTERLAKEN_SITE_LANGUAGE_OPTIONS.every(
      (option) => option.source === 'attached'
    )
  )
  assert.equal(
    INTERLAKEN_SITE_LANGUAGE_OPTIONS.some((option) => !option.code),
    false
  )
  assert.equal(normalizeInterlakenSiteLanguage('de'), 'de')
  assert.equal(normalizeInterlakenSiteLanguage('de-CH'), '')
  assert.equal(normalizeInterlakenSiteLanguage('en'), 'en')
  assert.equal(normalizeInterlakenSiteLanguage('fr'), '')
  assert.equal(normalizeInterlakenSiteLanguage('es'), '')
  assert.equal(resolveInterlakenSiteLanguage('unsupported'), 'gsw')
  assert.equal(isInterlakenSiteLanguageAvailableOnPath('de', '/'), true)
  assert.equal(
    isInterlakenSiteLanguageAvailableOnPath('de', '/marktplatz/example-store'),
    true
  )
  assert.equal(isInterlakenSiteLanguageAvailableOnPath('de', '/blog'), true)
  assert.equal(isInterlakenSiteLanguageAvailableOnPath('de', '/auth'), false)
  assert.equal(interlakenCopy('buy', 'gsw'), 'Choufe')
  assert.equal(interlakenCopy('buy', 'de'), 'Kaufen')
  assert.equal(interlakenCopy('buy', 'en'), 'Buy')
  for (const removedKey of [
    'onboarding_locality_body',
    'onboarding_offer_body',
  ]) {
    assert.equal(Object.hasOwn(interlakenCopyPack.entries, removedKey), false)
    assert.doesNotMatch(interlakenOnboardingModal, new RegExp(removedKey))
  }
  assert.equal(
    interlakenCopy('onboarding_introduction_placeholder', 'en'),
    'My product is…'
  )
  assert.equal(
    interlakenCopy('onboarding_introduction_placeholder', 'de'),
    'Mein Produkt ist …'
  )
  assert.equal(
    interlakenCopy('onboarding_introduction_placeholder', 'gsw'),
    'Mis Produkt isch …'
  )
  assert.match(
    interlakenOnboardingModal,
    /copy\('onboarding_introduction_placeholder'\)/
  )
  assert.ok(Object.keys(interlakenCopyPack.entries).length >= 100)
  assert.ok(
    Object.values(interlakenCopyPack.entries).every(
      (entry) =>
        entry.source_language === 'en' &&
        ['de', 'gsw'].every((language) => {
          const translation = entry.translations[language]
          return (
            translation?.status === 'approved' &&
            translation.profile_id ===
              interlakenCopyPack.profiles[language].id &&
            translation.provenance.reviewed_by === 'interlaken-essen' &&
            Boolean(translation.provenance.reviewed_at)
          )
        })
    )
  )
  assert.ok(
    Object.values(interlakenCopyPack.entries).every(
      (entry) =>
        entry.translations.de.provenance.kind === 'ai' &&
        entry.translations.de.provenance.provider === 'openai-codex' &&
        Boolean(entry.translations.de.provenance.generated_at) &&
        entry.translations.gsw.provenance.kind === 'human'
    )
  )
  assert.doesNotMatch(
    Object.values(interlakenCopyPack.entries)
      .map((entry) => entry.translations.de.text)
      .join('\n'),
    /ß/
  )
  assert.doesNotMatch(
    Object.values(interlakenCopyPack.entries)
      .flatMap((entry) => [
        entry.source_text,
        ...Object.values(entry.translations).map(
          (translation) => translation?.text || ''
        ),
      ])
      .join('\n'),
    /Your location helps us keep the food truly local|From your fridge to your kitchen table|Anything goes – your products should feel like you|Din Ort hilft üs, s Futter würkli lokal z halte|Vom Chüelschrank bis zum Chuchi-Tisch|Ganz frei – dini Produkt söue zu dir passe/
  )
  for (const [key, entry] of Object.entries(interlakenCopyPack.entries)) {
    const variables = Object.fromEntries(
      [...entry.source_text.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(
        (match) => [match[1], 'test']
      )
    )
    assert.equal(typeof interlakenCopy(key, 'en', variables), 'string')
    assert.equal(typeof interlakenCopy(key, 'de', variables), 'string')
    assert.equal(typeof interlakenCopy(key, 'gsw', variables), 'string')
  }
  assert.match(interlakenSiteLanguage, /useCookie<string>/)
  assert.match(interlakenSiteLanguage, /route\.query\.sproochli/)
  assert.match(
    interlakenSiteLanguage,
    /isInterlakenSiteLanguageAvailableOnPath/
  )
  assert.match(interlakenSiteLanguage, /watch\(\s*availableRequestedLanguage/)
  assert.match(interlakenCopyComposable, /de: 'de-CH'/)
  assert.match(interlakenCopyComposable, /en: 'en-GB'/)
  assert.match(interlakenCopyComposable, /gsw: 'gsw-CH'/)
  assert.match(interlakenMarketplaceLayout, /SproochliLanguageTrigger/)
  assert.match(interlakenMarketplaceLayout, /siteSproochli\.languageOptions/)
  assert.match(interlakenMarketplaceLayout, /siteSproochli\.selectedLanguage/)
  assert.match(interlakenMarketplaceLayout, /language_trigger_current/)
  assert.match(interlakenMarketplaceLayout, /language_trigger_visit_sproochli/)
  assert.doesNotMatch(
    interlakenMarketplaceLayout,
    /language_trigger_(heading|description)/
  )
  assert.match(interlakenApp, /useInterlakenCopy/)
  assert.match(interlakenApp, /htmlAttrs/)
  assert.match(interlakenApp, /lang: locale\.value/)
  assert.doesNotMatch(interlakenMarketplaceLayout, /htmlAttrs/)
  assert.match(
    interlakenPersonalMarketplace,
    /usePersonalMarketplace[\s\S]*useInterlakenCopy/
  )
  assert.match(
    interlakenMarketplaceOnboarding,
    /useMarketplaceOnboarding[\s\S]*useInterlakenCopy/
  )
  assert.ok(
    interlakenOwnedCopyConsumers.every((consumer) =>
      consumer.includes('useInterlakenCopy')
    )
  )
  assert.match(interlakenPublicCopy, /language_trigger_visit_sproochli/)
  assert.match(interlakenPublicCopy, /de: 'Sproochli besuchen'/)
  assert.doesNotMatch(
    interlakenPublicCopy,
    /language_trigger_(heading|description)/
  )
  assert.match(interlakenMeta, /defaultCopy\('app_meta_headline'\)/)
  assert.match(interlakenMeta, /defaultCopy\('app_meta_seo_description'\)/)
  assert.match(interlakenMeta, /copy\.status !== 'approved'/)
  assert.doesNotMatch(interlakenMeta, /target_text/)
  assert.doesNotMatch(interlakenMeta, /Local food, offered nearby/)
  assert.match(interlakenFutter, /slug: 'wo-sind-die-chuehlschraenke'/)
  assert.match(interlakenFutter, /slug: 'interlaken-essen-isch-live'/)
  assert.doesNotMatch(interlakenFutter, /feed_launch_title/)
  assert.match(interlakenFeed, /blogPost\.featuredImage/)
  assert.match(interlakenFeed, /blogPost\.available_languages\.includes/)
  assert.match(interlakenFeed, /v-if="resolvedFutterPosts\.length"/)
  assert.match(
    interlakenMarketplacePublicSurfaces,
    /\/api\/public\/marketplace\/stores/
  )
  assert.doesNotMatch(
    interlakenMarketplacePublicSurfaces,
    /marketplace-preview|marketplacePreviewSellers|MarketplaceSellerCard|MarketplaceStorefront/
  )
  assert.match(interlakenStyleFacade, /@import '\.\/market-shell\.css';/)
  assert.match(interlakenStyleFacade, /@import '\.\/market-discovery\.css';/)
  assert.match(
    interlakenStyles,
    /button\.market-language\.sproochli-language-trigger--emoji/
  )
  assert.match(
    interlakenStyles,
    /\.market-home__feed-wrap:not\(:has\(\.market-feed\)\)/
  )
  assert.match(
    interlakenStyles,
    /\.market-browse__columns:not\(:has\(> \.market-feed\)\)/
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
  assert.match(
    languageTriggerFacade,
    /<style scoped src="\.\/language-trigger\.css"><\/style>/
  )
  assert.match(languageTrigger, /pageHasMixedSource/)
  assert.match(languageTrigger, /SproochliDefaultLanguageMark/)
  assert.match(languageTrigger, /SproochliWordmark/)
  assert.match(languageTrigger, /sproochliProviderBaseUrl/)
  assert.match(languageTrigger, /copy\?: Partial<SproochliLanguageTriggerCopy>/)
  assert.match(languageTrigger, /triggerCopy\.cached/)
  assert.match(languageTrigger, /triggerCopy\.onDemand/)
  assert.match(languageTrigger, /triggerCopy\.visitSproochli/)
  assert.match(languageTrigger, /target="_blank"/)
  assert.match(languageTrigger, /rel="noopener noreferrer"/)
  assert.doesNotMatch(languageTrigger, /Choose how to read this content/)
  assert.match(languageTrigger, /sproochli-language-trigger--emoji/)
  assert.match(languageTrigger, /<button\s+type="button"/)
  assert.doesNotMatch(
    languageTrigger,
    /<UButton[\s\S]{0,300}sproochli-language-trigger/
  )
  assert.match(
    languageTrigger,
    /\.sproochli-language-trigger--default,\s*\n\.sproochli-language-trigger--emoji/
  )
  assert.match(languageTrigger, /background: transparent !important/)
  assert.doesNotMatch(languageTrigger, /transform:\s*scale/)
  assert.doesNotMatch(languageTrigger, /i-lucide-languages/)
  assert.match(languageTrigger, /defaultOption\.value\?\.label/)
  assert.match(languageTrigger, /return triggerCopy\.value\.defaultSelection/)
  assert.match(languageTrigger, /showWhenSingleOption/)
  assert.match(languageTrigger, /onlyOriginalOption/)
  assert.match(languageTrigger, /\(option\) => option\.source === 'original'/)
  assert.match(languageTrigger, /option\.source === 'attached'/)
  assert.match(languageTrigger, /option\.source === 'public'/)
  assert.match(languageTrigger, /\(option\) => option\.source === 'cache'/)
  assert.doesNotMatch(languageTrigger, /option\.source !== 'on_demand'/)
  assert.doesNotMatch(languageTrigger, />\s*Cached\s*</)
  assert.doesNotMatch(languageTrigger, />\s*On demand\s*</)
  assert.match(languageTrigger, /key: 'cached'/)
  assert.match(languageTrigger, /key: 'onDemand'/)
  assert.match(languageTrigger, /showGroupLabels/)
  assert.match(
    languageTrigger,
    /showSeparator: original\.length > 0 \|\| available\.length > 0/
  )
  assert.match(languageTrigger, /option\.source === 'on_demand'/)
  assert.doesNotMatch(languageTrigger, /:disabled=/)
  assert.doesNotMatch(languageTrigger, /Not published/)
  assert.match(assetsPage, /fireuxAssets/)
  assert.match(appConfig, /language-default\.webp/)
  assert.doesNotMatch(appConfig, /language-default-english/)
  assert.match(defaultLanguageMark, /default-language-mark\.webp/)
  assert.match(defaultLanguageMark, /sproochli-default-language-mark/)
  assert.equal(defaultAsset.equals(sharedDefaultAsset), true)
  assert.equal(defaultAsset.subarray(0, 4).toString('ascii'), 'RIFF')
  assert.equal(defaultAsset.subarray(8, 12).toString('ascii'), 'WEBP')
  for (const signature of ['#7C3AED', '#FFF4DE', '#F05F52']) {
    assert.ok(sproochliWordmark.includes(signature))
  }
  assert.match(sproochliWordmark, />\s*sproochli\s*</)
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'projects/fireux/sproochli/public/img/app/language-default.svg'
      )
    ),
    false
  )
  assert.equal(
    existsSync(
      path.join(repoRoot, 'projects/fireux/sproochli/public/img/app/logo.svg')
    ),
    false
  )
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
  assert.match(menuBrowse, /show-when-single-option/)
  assert.match(menuBrowse, /resolveSproochliLanguageState/)
  assert.match(menuBrowse, /sproochli\.value\?\.state/)
  assert.doesNotMatch(menuBrowse, /useSproochliMenuTranslation/)
  assert.match(menuBrowse, /:show-group-labels="true"/)
  assert.match(menuBrowse, /ready_languages/)
  assert.match(
    menuBrowse,
    /cachedLanguages: sproochli\.value\?\.readyLanguages \?\? \[\]/
  )
  assert.match(menuBrowse, /MenuSurfaceRail/)
  assert.match(menuBrowse, /browseSurfaceCopy\.allergyTitle/)
  assert.doesNotMatch(menuBrowse, /MenuSurfaceSwitcher/)
  assert.doesNotMatch(menuBrowse, />Allergies or intolerances\?<\/strong>/)
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-kitchens/src/runtime/menu/composables/useSproochliMenuTranslation.ts'
      )
    ),
    false
  )
  assert.match(menuReader, /query\.set\('sproochli'/)
  assert.match(menuEndpoint, /normalizeSproochliLanguage\(query\.sproochli\)/)
  assert.match(menuPayload, /await resolveMenuSproochli\(/)
  assert.match(menuResolver, /const storage = resolveSproochliHostStorage\(\)/)
  assert.match(menuResolver, /await readCanonicalCacheLanguages\(cacheScope\)/)
  assert.match(menuResolver, /\.map\(normalizeSproochliLanguage\)/)
  assert.match(menuResolver, /if \(!requestedLanguage\)/)
  assert.ok(
    menuResolver.indexOf('if (!requestedLanguage)') <
      menuResolver.indexOf('await resolveSproochliMenu({')
  )
  assert.ok(
    menuResolver.indexOf(
      'let translations = await readSproochliMenuTranslationCache'
    ) < menuResolver.indexOf('if (!translations)')
  )
  assert.ok(
    menuResolver.indexOf('if (!translations)') <
      menuResolver.indexOf('await resolveSproochliMenu({')
  )
  assert.equal((menuResolver.match(/resolveSproochliMenu\(/g) || []).length, 1)
  assert.match(menuResolver, /\.\.\.menuFields\(menu\)/)
  assert.match(menuResolver, /MENU_BROWSE_SURFACE_COPY_FIELDS/)
  assert.match(menuResolver, /translations\.size !== fields\.length/)
  assert.match(menuResolver, /state: 'default'/)
  assert.match(menuResolver, /state: 'translated'/)
  assert.match(
    menuResolver,
    /state: requestedLanguage \? 'unavailable' : 'default'/
  )
  assert.match(menuResolver, /if \(missingFields\.length\)/)
  assert.match(menuResolver, /fields: missingFields/)
  assert.match(menuResolver, /host: storage\.target/)
  assert.match(
    menuResolver,
    /resolution\.host\.appId === storage\.target\.appId/
  )
  assert.match(
    menuResolver,
    /resolution\.host\.firebaseProjectId ===\s*storage\.target\.firebaseProjectId/
  )
  assert.match(
    menuResolver,
    /resolution\.host\.databaseId === storage\.target\.databaseId/
  )
  assert.match(
    menuResolver,
    /writeSproochliTranslationMemory\(\s*storage,\s*candidates/s
  )
  assert.match(menuResolver, /await writeSproochliMenuTranslationCache\(\{/)
  assert.match(
    menuResolver,
    /readyLanguages =\s*await readCanonicalCacheLanguages\(cacheScope\)/
  )
  assert.match(
    menuResolver,
    /let readyLanguages: SproochliLanguageCode\[\] \| null = null/
  )
  assert.doesNotMatch(menuResolver, /resolution\.readyLanguages/)
  assert.doesNotMatch(menuResolver, /cachedLanguages|languageOptions/)
  assert.match(
    menuManifestModel,
    /state: 'default' \| 'translated' \| 'unavailable'/
  )
  assert.match(menuManifestModel, /language: SproochliLanguageCode/)
  assert.match(
    menuManifestModel,
    /readyLanguages: SproochliLanguageCode\[\] \| null/
  )
  assert.doesNotMatch(
    menuManifestModel,
    /activeLanguage|languageOptions|enabled: true/
  )
  assert.match(menuProvider, /host: SproochliHostTarget/)
  assert.match(menuProvider, /language: string/)
  assert.match(menuProvider, /translations: Record<string, string>/)
  assert.doesNotMatch(
    menuProvider,
    /GoogleAuth|\bfetch\s*\(|readyLanguages|cachedLanguages|targetLanguages|includeTranslations|menuCache/
  )
  assert.match(menuProviderClient, /new GoogleAuth\(\)\.getIdTokenClient/)
  assert.match(menuProviderClient, /SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE/)
  assert.match(
    menuProviderClient,
    /headers\.authorization = `Bearer \$\{token\}`/
  )
  assert.match(
    menuProviderClient,
    /AbortSignal\.timeout\(PROVIDER_TIMEOUT_MS\)/
  )
  assert.match(menuProviderClient, /const PROVIDER_TIMEOUT_MS = 8_000/)
  assert.match(menuProviderClient, /localDevelopment/)
  assert.match(
    sproochliReadme,
    /one installation, one scoped host identity,\s*host-owned storage, centrally provided translation intelligence/
  )
  assert.match(
    sproochliReadme,
    /Adding `fireux-sproochli` to `app\.modules` enables the package\. It does not\s*complete production registration\./
  )
  assert.match(sproochliReadme, /ecosystem's\s*`ssr\.serviceAccount`/)
  assert.match(sproochliReadme, /SPROOCHLI_MENU_PROVIDER_SOURCE_SCOPES/)
  assert.match(
    sproochliReadme,
    /service-account keys, default compute identities/
  )
  assert.match(sproochliReadme, /future WordPress or non-Google adapter/)
  assert.match(coreEcosystemConfigTypes, /serviceAccount\?: string/)
  assert.match(coreNitroConfig, /serviceAccount\?: string/)
  assert.match(
    coreNitroConfig,
    /\.\.\.\(c\.serviceAccount \? \{ serviceAccount: c\.serviceAccount \} : \{\}\)/
  )
  assert.match(
    coreEcosystemWiring,
    /httpsOptions\.serviceAccount = serviceAccount/
  )
  assert.match(
    miseboxEcosystemConfig,
    /serviceAccount:\s*'misebox-ssr@misebox-78f9c\.iam\.gserviceaccount\.com'/
  )
  assert.ok(
    firebaseOutputPreparation.includes('server/firebase.runtime-env.json')
  )
  assert.ok(
    firebaseOutputPreparation.includes(
      'SECRET|TOKEN|PASSWORD|PRIVATE_KEY|CREDENTIAL|API_KEY'
    )
  )
  assert.ok(
    firebaseOutputPreparation.includes(
      'join(outputServerDir, `.env.${projectId}`)'
    )
  )
  const sproochliRuntime = JSON.parse(sproochliRuntimeEnvironment)
  const miseboxRuntime = JSON.parse(miseboxRuntimeEnvironment)
  assert.equal(sproochliRuntime.projectId, 'fireux-2005')
  assert.equal(miseboxRuntime.projectId, 'misebox-78f9c')
  assert.equal(
    sproochliRuntime.environment.SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE,
    'https://sproochli.web.app/api/tools/menu'
  )
  assert.equal(
    miseboxRuntime.environment.SPROOCHLI_MENU_PROVIDER_ENDPOINT,
    sproochliRuntime.environment.SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE
  )
  assert.equal(
    miseboxRuntime.environment.SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE,
    sproochliRuntime.environment.SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE
  )
  assert.deepEqual(
    JSON.parse(
      sproochliRuntime.environment.SPROOCHLI_MENU_PROVIDER_SOURCE_SCOPES
    ),
    [
      {
        service_account_email:
          'misebox-ssr@misebox-78f9c.iam.gserviceaccount.com',
        firebase_project_id: 'misebox-78f9c',
        database_id: 'sproochli',
        app_ids: ['misebox-app'],
      },
    ]
  )
  assert.match(
    menuResolver,
    /fireux-sproochli\/runtime\/server\/menu\/provider-client/
  )
  assert.doesNotMatch(kitchenMenuModel, /source_language/)
  assert.doesNotMatch(rootMenuModel, /source_language/)
  assert.doesNotMatch(menuRootEntry, /source_language/)
  assert.doesNotMatch(menuPayloadTypes, /sourceLanguage/)
  assert.doesNotMatch(menuEndpoint, /source_language|sourceLanguage/)
  assert.match(kitchenMenuScope, /readKitchenSproochliConfig\(appKitchenData\)/)
  assert.equal(TranslationMemoryStorage.collection, 'translation_memory')
  assert.equal(TranslationMemoryStorage.access, 'server-only')
  assert.match(
    sproochliHostTarget,
    /SPROOCHLI_HOST_DATABASE_ID = 'sproochli' as const/
  )
  assert.match(sproochliHostTarget, /appId: string/)
  assert.match(sproochliHostTarget, /firebaseProjectId: string/)
  assert.match(
    sproochliHostTarget,
    /databaseId: typeof SPROOCHLI_HOST_DATABASE_ID/
  )
  assert.match(sproochliHostStorage, /runtime\.public\?\.fireux\?\.id/)
  assert.match(
    sproochliHostStorage,
    /runtime\.public\?\.firebaseEcosystem\?\.firebase\?\.projectId/
  )
  assert.match(
    sproochliHostStorage,
    /db: getRuntimeFirestore\(SPROOCHLI_HOST_DATABASE_ID\)/
  )
  assert.match(sproochliHostStorage, /host_app_id:/)
  assert.match(sproochliHostStorage, /firebase_project_id:/)
  assert.match(sproochliHostStorage, /database_id:/)
  assert.match(sproochliHostStorage, /matchesSproochliStorageMetadata/)
  assert.match(
    sproochliHostStorage,
    /const hostAppId = text\(data\.host_app_id\)/
  )
  assert.match(sproochliHostStorage, /Boolean\(hostAppId\)/)
  assert.doesNotMatch(
    sproochliHostStorage,
    /text\(data\.host_app_id\) === expected\.host_app_id/
  )
  assert.doesNotMatch(sproochliHostStorage, /fireux-2005|misebox-78f9c/)
  assert.match(menuTranslationEndpoint, /host\?: unknown/)
  assert.match(menuTranslationEndpoint, /function parseHost\(/)
  assert.match(
    menuTranslationEndpoint,
    /databaseId !== SPROOCHLI_HOST_DATABASE_ID/
  )
  assert.match(
    menuTranslationEndpoint,
    /const host = parseHost\(body\?\.host\)/
  )
  assert.match(
    menuTranslationEndpoint,
    /await assertSproochliMenuProviderAccess\(event, host\)/
  )
  assert.ok(
    menuTranslationEndpoint.indexOf(
      'await assertSproochliMenuProviderAccess(event, host)'
    ) <
      menuTranslationEndpoint.indexOf(
        'await translateSproochliTextBatch(account, {'
      ),
    'Sproochli Menu provider authorization must run before the translation call.'
  )
  assert.match(menuTranslationEndpoint, /return \{\s*host,/s)
  assert.match(menuTranslationEndpoint, /const MAX_FIELDS = 200/)
  assert.match(menuTranslationEndpoint, /MAX_TOTAL_SOURCE_TEXT_LENGTH/)
  assert.match(menuTranslationEndpoint, /SUPPORTED_LANGUAGES/)
  assert.match(menuTranslationEndpoint, /translateSproochliTextBatch/)
  assert.match(menuTranslationEndpoint, /google-cloud-translation/)
  assert.doesNotMatch(
    menuTranslationEndpoint,
    /firebase-admin|getRuntimeFirestore|runtime\/server\/menu\/(?:storage|translation-cache|translation-memory|translation-recipe)|readSproochliMenuTranslationCache|readSproochliTranslationMemory|writeSproochliTranslationMemory|writeSproochliMenuTranslationCache|readyLanguages|cachedLanguages|menuCache/
  )
  assert.match(
    menuTranslationEndpoint,
    /setSproochliPrivateToolHeaders\(event\)/
  )
  assert.match(menuProviderAuth, /requireBearerToken/)
  assert.match(menuProviderAuth, /verifyServiceAccountOidc/)
  assert.match(menuProviderAuth, /SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE/)
  assert.match(menuProviderAuth, /SPROOCHLI_MENU_PROVIDER_SOURCE_SCOPES/)
  assert.match(
    menuProviderAuth,
    /scope\.serviceAccountEmail === principal\.service_account_email/
  )
  assert.match(
    menuProviderAuth,
    /scope\.firebaseProjectId === host\.firebaseProjectId/
  )
  assert.match(menuProviderAuth, /scope\.databaseId === host\.databaseId/)
  assert.match(menuProviderAuth, /scope\.appIds\.includes\(host\.appId\)/)
  assert.match(menuProviderAuth, /isLoopbackDevelopmentRequest/)
  assert.match(sproochliTools, /setSproochliPrivateToolHeaders/)
  assert.match(sproochliTools, /'Cache-Control': 'private, no-store'/)
  assert.match(menuTranslationOptions, /setSproochliPrivateToolHeaders/)
  assert.match(menuTranslationOptions, /setResponseStatus\(event, 204\)/)
  for (const removedEndpoint of [
    'projects/fireux/sproochli/server/api/tools/menu/translate.post.ts',
    'projects/fireux/sproochli/server/api/tools/menu/translate.options.ts',
    'projects/fireux/sproochli/server/api/tools/menu/cache.post.ts',
    'projects/fireux/sproochli/server/api/tools/menu/cache.options.ts',
  ]) {
    assert.equal(existsSync(path.join(repoRoot, removedEndpoint)), false)
  }
  assert.match(translationMemory, /SproochliHostStorage/)
  assert.match(translationMemory, /storage\.db\.getAll\(/)
  assert.match(translationMemory, /runGuardedServerTransaction\(/)
  assert.match(
    translationMemory,
    /FIRESTORE_MUTATION_TARGETS\.sproochliTranslationMemory/
  )
  assert.match(
    translationMemory,
    /matchesSproochliStorageMetadata\(value\?\.storage, storage\.target\)/
  )
  assert.match(
    translationMemory,
    /storage: sproochliStorageMetadata\(storage\.target\)/
  )
  assert.match(translationMemory, /review_status:\s*'unreviewed'/)
  assert.match(translationMemory, /mutations\.readMany\(/)
  assert.match(translationMemory, /mutations\.create\(target, id/)
  assert.doesNotMatch(
    translationMemory,
    /getRuntimeFirestore|batch\.set|transaction\.set/
  )
  assert.match(menuCompleteCache, /menu_translation_caches/)
  assert.match(menuCompleteCache, /complete: true/)
  assert.match(menuCompleteCache, /fingerprint/)
  assert.match(menuCompleteCache, /SproochliHostStorage/)
  assert.match(menuCompleteCache, /input\.storage\.db/)
  assert.match(menuCompleteCache, /runGuardedServerTransaction\(/)
  assert.match(
    menuCompleteCache,
    /FIRESTORE_MUTATION_TARGETS\.sproochliMenuTranslationCaches/
  )
  assert.match(
    menuCompleteCache,
    /matchesSproochliStorageMetadata\(data\.storage, input\.storage\.target\)/
  )
  assert.match(
    menuCompleteCache,
    /storage: sproochliStorageMetadata\(input\.cache\.storage\.target\)/
  )
  assert.doesNotMatch(menuCompleteCache, /getRuntimeFirestore/)
  assert.match(menuCompleteCache, /readSproochliMenuTranslationCacheLanguages/)
  assert.match(
    menuCompleteCache,
    /\.where\('fingerprint', '==', scope\.fingerprint\)/
  )
  assert.match(
    menuMemoryRecipe,
    /SPROOCHLI_MENU_MEMORY_CACHE_VERSION\s*=\s*\n?\s*'menu_translation_memory_v1'/
  )
  assert.match(
    menuMemoryRecipe,
    /SPROOCHLI_MENU_MEMORY_DOMAIN = 'restaurant_menu'/
  )
  for (const removedCentralStateFile of [
    'projects/fireux/sproochli/server/utils/sproochliMenuTranslationCache.ts',
    'projects/fireux/sproochli/server/utils/sproochliTranslationMemory.ts',
    'projects/fireux/sproochli/server/utils/sproochliMenuTranslationMemory.ts',
    'projects/fireux/sproochli/server/api/internal/menu/cache/import.post.ts',
    'projects/fireux/sproochli/server/utils/sproochliMenuCacheImport.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, removedCentralStateFile)),
      false
    )
  }
  assert.match(translationModel, /\|\s*'source_document_extraction'/)
  assert.match(translationModel, /\|\s*'sproochli-menu-cache-import'/)
  assert.match(menuCacheContract, /SproochliMenuCacheImportUnit/)
  assert.match(menuCacheContract, /fieldId: string/)
  assert.match(menuCacheContract, /sourceText: string/)
  assert.match(menuCacheContract, /targetLanguage: string/)
  assert.match(menuCacheContract, /translatedText: string/)
  assert.doesNotMatch(
    menuCacheContract,
    /SproochliMenuCacheImportRequest|sourceDocumentId|\bfetch\s*\(|\$fetch|useFetch/
  )
  assert.match(menuAiSchema, /LOCALIZED_TEXT_SCHEMA/)
  assert.match(menuAiSchema, /label_translations:\s*LOCALIZED_TEXT_SCHEMA/)
  assert.match(menuAiSchema, /name_translations:\s*LOCALIZED_TEXT_SCHEMA/)
  assert.match(
    menuAiSchema,
    /description_translations:\s*LOCALIZED_TEXT_SCHEMA/
  )
  assert.match(
    menuAiExtraction,
    /MENU_SOURCE_EXTRACTION_PROMPT_VERSION = 'menu-source-v9'/
  )
  assert.match(menuAiExtraction, /canonical Default text/)
  assert.doesNotMatch(menuAiExtraction, /Drop translated duplicate text/)
  assert.match(
    menuAiNormalization,
    /preserve extracted aligned language copies/
  )
  assert.doesNotMatch(menuAiNormalization, /Drop translated duplicate text/)
  assert.match(menuDraftSections, /normalizeSproochliLanguage/)
  assert.match(menuDraftSections, /cleanTranslations/)
  assert.match(menuDraftWrite, /sproochliCacheUnits/)
  assert.match(menuDraftWrite, /appendKitchenMenuCacheUnits/)
  assert.match(kitchenMenuCacheImport, /resolveSproochliHostStorage\(\)/)
  assert.match(
    kitchenMenuCacheImport,
    /text\(input\.appId\) !== storage\.target\.appId/
  )
  assert.match(kitchenMenuCacheImport, /sourceLanguage: 'auto'/)
  assert.match(kitchenMenuCacheImport, /kind: 'source_document_extraction'/)
  assert.match(
    kitchenMenuCacheImport,
    /generatedBy: 'sproochli-menu-cache-import'/
  )
  assert.match(kitchenMenuCacheImport, /provider: 'source-document-extraction'/)
  assert.match(kitchenMenuCacheImport, /valuesByIdentity\.get\(identity\)/)
  assert.match(
    kitchenMenuCacheImport,
    /writeSproochliTranslationMemory\(storage, values\)/
  )
  assert.doesNotMatch(
    kitchenMenuCacheImport,
    /GoogleAuth|SPROOCHLI_MENU_CACHE_IMPORT_(?:ENDPOINT|OIDC_AUDIENCE)|getIdTokenClient|\bfetch\s*\(|\$fetch|useFetch/
  )
  assert.match(
    sproochliHostRules,
    /match \/menu_translation_caches\/\{document=\*\*\}/
  )
  assert.match(
    sproochliHostRules,
    /match \/translation_memory\/\{document=\*\*\}/
  )
  assert.equal(
    (sproochliHostRules.match(/allow read, write: if false;/g) || []).length,
    3
  )
  assert.doesNotMatch(sproochliHostRules, /if true|request\.auth/)
  assert.match(sproochliHostFirebaseConfig, /"database": "sproochli"/)
  assert.match(sproochliHostFirebaseConfig, /"rules": "server-only\.rules"/)
  assert.match(
    sproochliHostMigration,
    /const SOURCE_PROJECT_ID = 'fireux-2005'/
  )
  assert.match(
    sproochliHostMigration,
    /const TARGET_PROJECT_ID = 'misebox-78f9c'/
  )
  assert.match(sproochliHostMigration, /const DATABASE_ID = 'sproochli'/)
  assert.match(sproochliHostMigration, /const LOCATION = 'eur3'/)
  assert.match(sproochliHostMigration, /const EDITION = 'standard'/)
  assert.match(sproochliHostMigration, /const CLI_READ_TIMEOUT_MS = 30_000/)
  assert.match(sproochliHostMigration, /const CLI_WRITE_TIMEOUT_MS = 120_000/)
  assert.match(sproochliHostMigration, /timeout: CLI_WRITE_TIMEOUT_MS/)
  assert.match(
    sproochliHostMigration,
    /service-account options authorize Admin SDK document access only/
  )
  assert.match(sproochliHostMigration, /const HOST_APP_ID = 'misebox-app'/)
  assert.match(sproochliHostMigration, /writeProtectedJsonArtifact\(\{/)
  assert.match(sproochliHostMigration, /transaction\.create\(/)
  assert.match(sproochliHostMigration, /--delete-protection/)
  assert.match(sproochliHostMigration, /source_delete_authorized: false/)
  assert.doesNotMatch(
    sproochliHostMigration,
    /transaction\.(?:delete|set|update)\(/
  )
  assert.match(menuConfirmEndpoint, /cache_import:/)
  assert.match(menuConfirmEndpoint, /status: 'failed'/)
  assert.ok(
    menuConfirmEndpoint.indexOf('await writeKitchenMenuDraft') <
      menuConfirmEndpoint.indexOf('await importKitchenMenuCacheUnits')
  )

  const memoryKeyInput = {
    cacheVersion: 'menu_translation_memory_v1',
    domain: 'restaurant_menu',
    fieldKind: 'dish_name',
    sourceHash: makeSproochliSourceHash('Margherita'),
    sourceLanguage: 'auto',
    targetLanguage: 'fr',
    glossaryVersion: 'restaurant_menu_v1',
  }
  const memoryKey = makeSproochliMenuMemoryKey(memoryKeyInput)
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
      makeSproochliMenuMemoryKey({ ...memoryKeyInput, ...patch }),
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
  assert.equal(catalogueState.options.length, SPROOCHLI_LANGUAGE_OPTIONS.length)
  assert.equal(
    catalogueState.selectableLanguages.length,
    SPROOCHLI_LANGUAGE_OPTIONS.length
  )
  assert.ok(
    catalogueState.options
      .filter((option) => option.code)
      .every((option) => option.source === 'on_demand')
  )
  const groupedState = resolveSproochliLanguageState({
    enabled: true,
    cachedLanguages: ['ar', 'en'],
  })
  assert.deepEqual(
    groupedState.options
      .filter((option) => option.source === 'cache')
      .map((option) => option.code),
    ['ar', 'en']
  )
  assert.equal(
    groupedState.options.find((option) => option.code === 'es')?.source,
    'on_demand'
  )
  assert.equal(isSproochliRtlLanguage('fa'), true)
  assert.equal(isSproochliRtlLanguage('ur'), true)
  assert.equal(MENU_SURFACE_COPY_VERSION, 'v3')
  assert.equal(MENU_BROWSE_SURFACE_COPY_FIELDS.length, 12)
  assert.equal(
    new Set(MENU_BROWSE_SURFACE_COPY_FIELDS.map((field) => field.id)).size,
    MENU_BROWSE_SURFACE_COPY_FIELDS.length
  )
  assert.ok(
    MENU_BROWSE_SURFACE_COPY_FIELDS.every(
      (field) => field.id.startsWith('menu-surface:v3:') && field.sourceText
    )
  )
  assert.deepEqual(resolveMenuBrowseSurfaceCopy(), {
    allergyAriaLabel: 'Allergy information',
    allergyTitle: 'Allergies or intolerances?',
    allergyBody:
      'Please ask the kitchen about allergies or dietary requirements.',
    menuSectionsAriaLabel: 'Menu sections',
    chooseMenuSectionAriaLabel: 'Choose menu section',
    sectionsLabel: 'Sections',
    availableOptionsLabel: 'Available options',
    optionalExtrasLabel: 'Optional extras',
    emptyCatalogueLabel: 'No menu items are published yet.',
    backToMenusLabel: 'Back to menus',
    closeMenuLabel: 'Close menu',
    pricesLabel: 'Prices',
  })
  assert.deepEqual(
    resolveMenuBrowseSurfaceCopy(
      new Map([
        ['menu-surface:v3:browse:allergy-title', 'Allergies ou intolérances ?'],
      ])
    ),
    {
      allergyAriaLabel: 'Allergy information',
      allergyTitle: 'Allergies ou intolérances ?',
      allergyBody:
        'Please ask the kitchen about allergies or dietary requirements.',
      menuSectionsAriaLabel: 'Menu sections',
      chooseMenuSectionAriaLabel: 'Choose menu section',
      sectionsLabel: 'Sections',
      availableOptionsLabel: 'Available options',
      optionalExtrasLabel: 'Optional extras',
      emptyCatalogueLabel: 'No menu items are published yet.',
      backToMenusLabel: 'Back to menus',
      closeMenuLabel: 'Close menu',
      pricesLabel: 'Prices',
    }
  )
  assert.deepEqual(resolveMenuBrowseSurfaceCopy(null, 'de'), {
    allergyAriaLabel: 'Allergieinformationen',
    allergyTitle: 'Allergien oder Unverträglichkeiten?',
    allergyBody:
      'Bitte informieren Sie unser Team über Allergien oder besondere Ernährungsbedürfnisse.',
    menuSectionsAriaLabel: 'Menübereiche',
    chooseMenuSectionAriaLabel: 'Menübereich auswählen',
    sectionsLabel: 'Bereiche',
    availableOptionsLabel: 'Verfügbare Optionen',
    optionalExtrasLabel: 'Optionale Extras',
    emptyCatalogueLabel: 'Es sind noch keine Menüeinträge veröffentlicht.',
    backToMenusLabel: 'Zurück zu den Menüs',
    closeMenuLabel: 'Menü schliessen',
    pricesLabel: 'Preise',
  })

  const profile = defineSproochliDialectProfile({
    id: 'test-profile',
    language_code: 'gsw',
    locale: 'gsw-CH',
    region: 'Berner Oberland',
    style: 'Readable',
    glossary: {},
  })
  const germanProfile = defineSproochliCopyProfile({
    id: 'test-german-profile',
    language_code: 'de',
    locale: 'de-CH',
    region: 'Switzerland',
    style: 'Professional Swiss Standard German',
    glossary: {},
  })
  const approved = defineSproochliCopyPack({
    id: 'test-pack',
    profiles: {
      de: germanProfile,
      gsw: profile,
    },
    entries: {
      buy: {
        key: 'buy',
        source_language: 'en',
        source_text: 'Buy',
        translations: {
          de: {
            text: 'Kaufen',
            profile_id: germanProfile.id,
            status: 'approved',
            provenance: { kind: 'human', reviewed_by: 'reviewer' },
          },
          gsw: {
            text: 'Choufe',
            profile_id: profile.id,
            status: 'approved',
            provenance: { kind: 'human', reviewed_by: 'reviewer' },
          },
        },
      },
    },
  })
  assert.equal(resolveApprovedSproochliCopy(approved, 'buy'), 'Choufe')
  assert.equal(resolveApprovedSproochliCopy(approved, 'buy', 'de'), 'Kaufen')
  assert.equal(resolveApprovedSproochliCopy(approved, 'buy', 'en'), 'Buy')
  assert.equal(
    formatSproochliCopy('Hello {name}', { name: 'Ada' }),
    'Hello Ada'
  )
  assert.throws(() => formatSproochliCopy('Hello {name}'))
  assert.throws(() =>
    defineSproochliCopyPack({
      id: 'bad-token-pack',
      profiles: { gsw: profile },
      entries: {
        greeting: {
          key: 'greeting',
          source_language: 'en',
          source_text: 'Hello {name}',
          translations: {
            gsw: {
              text: 'Hoi {person}',
              profile_id: profile.id,
              status: 'approved',
              provenance: { kind: 'human', reviewed_by: 'reviewer' },
            },
          },
        },
      },
    })
  )
  assert.throws(() =>
    resolveApprovedSproochliCopy(
      {
        ...approved,
        entries: {
          buy: {
            ...approved.entries.buy,
            translations: {
              ...approved.entries.buy.translations,
              gsw: {
                ...approved.entries.buy.translations.gsw,
                status: 'ai_draft',
              },
            },
          },
        },
      },
      'buy'
    )
  )
  assert.throws(() =>
    resolveApprovedSproochliCopy(
      {
        ...approved,
        entries: {
          buy: {
            ...approved.entries.buy,
            translations: {
              gsw: approved.entries.buy.translations.gsw,
            },
          },
        },
      },
      'buy',
      'de'
    )
  )
}
