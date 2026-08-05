// @fireux-script
// last_used: 2026-08-04
// usage_note: run through pnpm guard; rejects undeclared tracking and browser-storage behavior.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const TRACKER_PATTERNS = [
  /@nuxtjs\/google-analytics/i,
  /firebase\/analytics/i,
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /\bgtag\s*\(/i,
  /\bfbq\s*\(/i,
  /connect\.facebook\.net/i,
  /@segment\/analytics/i,
  /mixpanel-browser/i,
  /posthog-js/i,
  /@amplitude\/analytics/i,
  /hotjar/i,
  /fullstory/i,
  /fingerprintjs/i,
  /clarity\.ms/i,
]

const BROWSER_STORAGE_PATTERN =
  /(?:window\.)?(?:localStorage|sessionStorage)\s*\.\s*(?:getItem|setItem|removeItem|clear|key)\s*\(|\buseCookie(?:<[^>]+>)?\s*\(|\bindexedDB\.open\s*\(|document\.cookie\s*=|\bcaches\.(?:open|match|delete)\s*\(|serviceWorker\.register\s*\(/
const ALLOWED_STORAGE_FILES = new Set([
  'packages/core/fireux-core/src/runtime/composables/fireux/app/console/useConsole.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/app/console/useConsoleSelection.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/app/useColorMode.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/firebase/account-consent.ts',
  'packages/core/fireux-core/src/runtime/composables/shared/useStoredChoice.ts',
  'packages/core/fireux-core/src/runtime/pages/chat.vue',
  'packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/public/usePublicBlogLanguage.ts',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/kitchen/order/funnel/shared/useOrderDraft.ts',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/kitchen/order/funnel/shared/useOrderIdempotency.ts',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/kitchen/order/funnel/shared/useOrderSession.ts',
  'packages/extensions/fireux-kitchens/src/runtime/utils/menu-order-tracking-storage.ts',
  'projects/misebox/interlaken-essen/app/composables/useInterlakenSproochli.ts',
])

const FORBIDDEN_DEPENDENCIES =
  /^(?:@nuxtjs\/google-analytics|@segment\/analytics|mixpanel-browser|posthog-js|@amplitude\/analytics-browser|hotjar|@fullstory\/browser|@fingerprintjs\/fingerprintjs)$/i

const ANALYTICS_STORAGE_PATTERNS = [
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bdocument\.cookie\b/,
  /\bnavigator\.userAgent\b/,
  /\bdevicePixelRatio\b/,
  /\bcanvas\b/i,
]

const AUTHORED_TEXT_FILE = /\.(?:[cm]?[jt]s|vue|json|ya?ml|md|html|css|scss)$/

async function authoredFiles(repoRoot) {
  const manifest = readFileSync(join(repoRoot, 'pnpm-workspace.yaml'), 'utf8')
  if (!manifest.includes('packages/core/*')) {
    throw new Error(
      'privacy measurement guard requires the canonical workspace.'
    )
  }

  const { execFileSync } = await import('node:child_process')
  return execFileSync(
    'rg',
    [
      '--files',
      'packages',
      'projects',
      '-g',
      '!**/dist/**',
      '-g',
      '!**/.output/**',
      '-g',
      '!**/.nuxt/**',
      '-g',
      '!**/node_modules/**',
    ],
    { cwd: repoRoot, encoding: 'utf8' }
  )
    .split('\n')
    .filter((file) => file && AUTHORED_TEXT_FILE.test(file))
}

export async function run({ repoRoot }) {
  const files = await authoredFiles(repoRoot)
  const violations = []

  for (const file of files) {
    const source = readFileSync(join(repoRoot, file), 'utf8')
    for (const pattern of TRACKER_PATTERNS) {
      if (pattern.test(source))
        violations.push(`${file}: forbidden tracker ${pattern}`)
    }

    if (
      BROWSER_STORAGE_PATTERN.test(source) &&
      !ALLOWED_STORAGE_FILES.has(file)
    ) {
      violations.push(
        `${file}: browser storage integration is not declared in the Core policy`
      )
    }

    if (/package\.json$/.test(file)) {
      const manifest = JSON.parse(source)
      const dependencies = {
        ...(manifest.dependencies || {}),
        ...(manifest.optionalDependencies || {}),
      }
      for (const dependency of Object.keys(dependencies)) {
        if (FORBIDDEN_DEPENDENCIES.test(dependency)) {
          violations.push(
            `${file}: forbidden tracking dependency ${dependency}`
          )
        }
      }
    }

    if (/analytics|telemetry|measurement/i.test(file)) {
      for (const pattern of ANALYTICS_STORAGE_PATTERNS) {
        if (pattern.test(source)) {
          violations.push(`${file}: analytics may not use ${pattern}`)
        }
      }
    }
  }

  const coreConfig = readFileSync(
    join(repoRoot, 'packages/core/fireux-core/src/config/app/fireux.config.ts'),
    'utf8'
  )
  if (/MEASUREMENT_ID|measurementId/.test(coreConfig)) {
    violations.push(
      'FireUX Core must not expose a Firebase analytics measurement id.'
    )
  }

  const nuxtfireModule = readFileSync(
    join(repoRoot, 'packages/core/fireux-nuxtfire/src/module.ts'),
    'utf8'
  )
  if (/MEASUREMENT_ID|measurementId|firebase\/analytics/.test(nuxtfireModule)) {
    violations.push(
      'FireUX Firebase integration must not expose analytics configuration.'
    )
  }

  const pwaConfig = readFileSync(
    join(repoRoot, 'packages/core/fireux-core/src/config/app/pwa.ts'),
    'utf8'
  )
  if (!/injectRegister:\s*false/.test(pwaConfig)) {
    violations.push(
      'Public visits must not automatically register a service worker.'
    )
  }

  const authPersistence = readFileSync(
    join(
      repoRoot,
      'packages/core/fireux-nuxtfire/src/runtime/plugins/firebase-auth-persistence.client.ts'
    ),
    'utf8'
  )
  if (
    !/setPersistence\(getAuth\(\), browserLocalPersistence\)/.test(
      authPersistence
    )
  ) {
    violations.push(
      'Firebase Auth must use the declared durable local persistence.'
    )
  }

  const directConversationClientRoot = join(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/conversation'
  )
  if (
    existsSync(directConversationClientRoot) &&
    readdirSync(directConversationClientRoot, { recursive: true }).some(
      (entry) => String(entry).endsWith('.ts')
    )
  ) {
    violations.push(
      'The retired direct-Firestore Conversation client must not return; use the trusted /api/chat boundary.'
    )
  }
  if (!/if \(!getApps\(\)\.length\) return/.test(authPersistence)) {
    violations.push(
      'Firebase Auth persistence must tolerate Nuxt client HMR before App initialization.'
    )
  }
  if (
    !/firebase-auth-persistence\.client\.ts'[\s\S]{0,240}\{ append: true \}/.test(
      nuxtfireModule
    )
  ) {
    violations.push(
      'Firebase Auth persistence must run after NuxtFire initializes the client App.'
    )
  }

  const colorMode = readFileSync(
    join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/composables/fireux/app/useColorMode.ts'
    ),
    'utf8'
  )
  if (
    !/immediate:\s*false/.test(colorMode) ||
    !/localStorage\.removeItem\(COLOR_MODE_STORAGE_KEY\)/.test(colorMode)
  ) {
    violations.push(
      'Colour preference storage must begin after selection and support deletion.'
    )
  }

  for (const relative of [
    'projects/misebox/la-tap-berne/app/components/LaTapBerne/Map.vue',
    'projects/misebox/baeren-ringgenberg/app/pages/location.vue',
  ]) {
    const mapSource = readFileSync(join(repoRoot, relative), 'utf8')
    if (
      !/v-if="mapRequested"/.test(mapSource) ||
      !/@click="mapRequested = true"/.test(mapSource)
    ) {
      violations.push(
        `${relative}: Google Maps must load only after an explicit request`
      )
    }
  }

  for (const relative of [
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/kitchen/order/funnel/shared/useOrderDraft.ts',
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/kitchen/order/funnel/shared/useOrderIdempotency.ts',
    'packages/extensions/fireux-kitchens/src/runtime/utils/menu-order-tracking-storage.ts',
  ]) {
    const orderStorage = readFileSync(join(repoRoot, relative), 'utf8')
    if (!/24 \* 60 \* 60 \* 1000/.test(orderStorage)) {
      violations.push(
        `${relative}: anonymous-order browser storage needs a 24-hour limit`
      )
    }
  }

  const storagePolicy = JSON.parse(
    readFileSync(
      join(
        repoRoot,
        'packages/core/fireux-core/src/config/privacy/browser-storage.json'
      ),
      'utf8'
    )
  )
  if (
    storagePolicy.policy !== 'essential-after-feature-use' ||
    storagePolicy.optionalTracking !== false ||
    !Array.isArray(storagePolicy.mechanisms) ||
    !storagePolicy.mechanisms.length
  ) {
    violations.push('Core browser-storage policy is missing or incomplete.')
  }

  const chatPage = readFileSync(
    join(repoRoot, 'packages/core/fireux-core/src/runtime/pages/chat.vue'),
    'utf8'
  )
  if (
    !['/api/chat/start', '/api/chat/session', '/api/chat/message'].every(
      (endpoint) => chatPage.includes(endpoint)
    ) ||
    /firestore\/core\/conversation/.test(chatPage)
  ) {
    violations.push(
      'Chat PII must cross the trusted /api/chat boundary; the landing page may not read or write Conversation Firestore records directly.'
    )
  }

  const chatSession = readFileSync(
    join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/server/utils/chat/session.ts'
    ),
    'utf8'
  )
  for (const required of [
    'randomBytes(32)',
    "createHash('sha256')",
    'timingSafeEqual',
    'token_hash',
    'runTransaction',
    'SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000',
    'MAX_CHAT_STARTS_PER_WINDOW',
    'getRequestIP',
    'rateLimitSalt',
  ]) {
    if (!chatSession.includes(required)) {
      violations.push(
        `Chat recovery boundary is missing ${required}; keep secrets unguessable, hashed at rest, constant-time checked, atomic, and time-bounded.`
      )
    }
  }

  if (!storagePolicy.mechanisms.some((entry) =>
    entry.key === 'fireux:*:admin-chat' && entry.lifetime === 'At most 30 days'
  )) {
    violations.push(
      'Core browser-storage policy must declare the exact fireux:*:admin-chat recovery key and its 30-day maximum lifetime.'
    )
  }

  if (violations.length) {
    throw new Error(
      `Privacy-first measurement drift:\n- ${violations.join('\n- ')}`
    )
  }

  console.log('[guard] ✅ privacy-first measurement boundary valid')
}
