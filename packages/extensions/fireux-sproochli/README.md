# fireux-sproochli
Authority: Tier2 (Overview)
Updated: 2026-06-07

Generic multilingual info-page tooling for FireUX apps.

This package owns reusable language and public-response helpers for QR-friendly pages:

- public language picker component
- public language options
- info page types
- language normalization
- RTL direction helpers
- localized text resolution
- generated translation cache conventions
- crawler, AI, and debug readable public JSON response shapes

## Guardrails

- Not a Sproochli product app shell
- Not a Misebox package
- Not a kitchen, menu, supplier, chef, restaurant, QR generator, AI translation, or editor package
- Does not import Misebox or domain-specific app models

Sproochli can provide language tools. Domain apps keep their domain meaning.

## Quick Start

```ts
import {
  buildPublicInfoResponse,
  normalizeInfoLanguage,
  resolveLocalizedText,
} from 'fireux-sproochli/runtime/info'
```

```ts
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import {
  normalizeSproochliLanguage,
  requestSproochliMenuTranslations,
  resolveSproochliLanguageOptions,
  resolveSproochliTranslatedText,
  sproochliProviderBaseUrl,
} from 'fireux-sproochli/runtime/sproochli'
```

Consuming apps should use `fireux-sproochli/runtime/sproochli` for Sproochli helper imports. Deep paths under `runtime/composables/fireux/sproochli` are package internals.

Enable as a Nuxt module when runtime config exposure is useful:

```ts
export default defineNuxtConfig({
  modules: ['fireux-sproochli'],
})
```

Registry metadata:
- `registry.json`
