````markdown
# Legacy Firestore Core Catalog

## app

### `app/useApp.ts`

```ts
// ~/composables/app/useApp.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { getApps } from 'firebase/app'

import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppComputed } from './useAppComputed'
import { useAppUpdate } from './useAppUpdate'
import { useAppEnsure } from './useAppEnsure'
import type { App } from '../../models/core/app.model'

export function useApp() {
  const { appId } = useFireUXConfig()

  if (!getApps().length) {
    throw new Error('Firebase not initialized before useApp().')
  }

  const db = useFirestore()
  const { firestoreFetchCollection } = useFirestoreManager()

  const appDocRef = computed<DocumentReference<App> | null>(() =>
    appId ? (doc(db, 'apps', appId) as DocumentReference<App>) : null
  )
  const { data: app } = useDocument<App>(appDocRef)
  const apps = firestoreFetchCollection<App>('apps')

  return {
    app,
    apps,
    ...useAppComputed(app),
    ...useAppUpdate(app),
    ensure: useAppEnsure(app),
    // temporary alias to maintain compatibility while callers update
    factory: useAppEnsure(app),
  }
}
```

### `app/useAppComputed.ts`

```ts
// ~/composables/app/useAppComputed.ts
import { computed, shallowRef, watchEffect, type Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import type { App } from '../../models/core/app.model'
import { useFireUXConfig } from '../FireUXConfig'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const { role, ecosystem, appId } = useFireUXConfig()

  const currentUser = import.meta.client
    ? useCurrentUser()
    : (shallowRef<User | null>(null) as ReturnType<typeof useCurrentUser>)

  // Mirror role in older UI fields
  const appTenancy = computed(() => role)
  const tenancyDisplay = computed(() => {
    if (role === 'global') return `Global of ${ecosystem}`
    if (role === 'tenant') return `Tenant of ${ecosystem}`
    return role
  })

  const isLoading = computed(() => app.value === undefined)
  const isInitialized = computed(() => {
    if (!app.value) return false
    return Array.isArray(app.value.admin_ids) && app.value.admin_ids.length > 0
  })

  if (import.meta.dev && import.meta.client) {
    let lastSignature = ''
    watchEffect(() => {
      const payload = {
        source: 'useAppComputed',
        appId,
        role,
        ecosystem,
        hasAppDoc: !!app.value,
        adminIds: app.value?.admin_ids ?? null,
        adminCount: app.value?.admin_ids?.length ?? 0,
        isInitialized: isInitialized.value,
        isLoading: isLoading.value,
        currentUid: currentUser.value?.uid ?? null,
      }
      const signature = JSON.stringify(payload)
      if (signature !== lastSignature) {
        lastSignature = signature
        console.info('[fireux][app-init-debug]', payload)
      }
    })
  }

  function hasAdmins(): boolean {
    return !!app.value?.admin_ids?.length
  }

  function isUserAdmin(userId?: string): boolean {
    const targetUserId = userId ?? currentUser.value?.uid
    if (!targetUserId || !app.value?.admin_ids) return false
    return app.value.admin_ids.includes(targetUserId)
  }

  return {
    appTenancy,
    tenancyDisplay,
    isLoading,
    isInitialized,
    hasAdmins,
    isUserAdmin,
  }
}
```

### `app/useAppEnsure.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/app/useAppEnsure.ts
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreCreate } from '../firestore/useFirestoreCreate'
import type { App, AppRole } from '../../models/core/app.model'
import type { AppUserDoc } from '../../models/core/user.model'
import {
  requireUid,
  ensureAvatarUrl,
} from '../firestore/ensure/useEnsureCommon'

type EnsureAppResult = {
  created: boolean
  id: string
  avatarUrl?: string | null
}

export function useAppEnsure() {
  const db = useFirestore()
  const cfg = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()

  const buildAvatarCandidates = (authPhotoUrl?: string | null) => {
    const candidates: Array<string | null | undefined> = []
    const configuredIcon =
      typeof cfg.appIcon === 'string' ? cfg.appIcon.trim() : ''

    if (configuredIcon.length > 0) {
      const lower = configuredIcon.toLowerCase()
      if (
        lower.startsWith('http://') ||
        lower.startsWith('https://') ||
        configuredIcon.startsWith('/') ||
        configuredIcon.includes('/public/')
      ) {
        candidates.push(configuredIcon)
      }
    }

    const staticWordmarkPath = `projects/${cfg.ecosystem}/${cfg.appId}/public/img/wordmark-light.svg`
    if (!candidates.includes(staticWordmarkPath)) {
      candidates.push(staticWordmarkPath)
    }

    const trimmedPhoto =
      typeof authPhotoUrl === 'string' ? authPhotoUrl.trim() : ''
    if (trimmedPhoto.length > 0) {
      candidates.push(trimmedPhoto)
    }

    return candidates
  }

  async function ensureApp(): Promise<EnsureAppResult> {
    if (!cfg.ecosystem) {
      throw new Error('[ensureApp] Missing ecosystem in config.')
    }

    if (!cfg.appId) {
      throw new Error('[ensureApp] Missing appId in config.')
    }

    const { uid, auth } = await requireUid()

    const ref = doc(db, 'apps', cfg.appId)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      const existing = snap.data() as Partial<App>
      const admins = Array.isArray(existing.admin_ids) ? existing.admin_ids : []
      const resolvedRole: AppRole =
        (existing.role as AppRole) || (cfg.role as AppRole) || 'tenant'

      if (admins.includes(uid)) {
        await syncCoreAdminMembership(uid, resolvedRole)
      } else {
        await updateDoc(ref, { admin_ids: arrayUnion(uid) })
        await syncCoreAdminMembership(uid, resolvedRole)
      }

      return {
        created: false,
        id: cfg.appId,
        avatarUrl: existing.avatar_url ?? null,
      }
    }

    const role: AppRole = (cfg.role as AppRole) || 'tenant'
    const payload: App = {
      id: cfg.appId,
      ecosystem: cfg.ecosystem,
      role,
      app_name: cfg.appName || 'New App',
      ...(cfg.appShortName ? { app_short_name: cfg.appShortName } : {}),
      admin_ids: [uid],
      creator_id: uid,
      avatar_url: null,
    }

    const avatarUrl = await ensureAvatarUrl(
      `apps/${cfg.appId}/avatar.png`,
      buildAvatarCandidates(auth?.photoURL),
      true
    )

    await setDocument('apps', cfg.appId, {
      ...payload,
      avatar_url: avatarUrl,
    })

    await syncCoreAdminMembership(uid, role)

    if (role !== 'global') {
      const appUserPayload: Partial<AppUserDoc> = {
        id: uid,
        role: 'admin',
      }

      await setDocument(
        `apps/${cfg.appId}/users`,
        uid,
        appUserPayload as AppUserDoc
      )
    }

    return { created: true, id: cfg.appId, avatarUrl }
  }

  return { ensureApp }

  async function syncCoreAdminMembership(uid: string, role: AppRole) {
    try {
      const coreRef = doc(db, 'core-users', uid)
      const coreSnap = await getDoc(coreRef)
      if (!coreSnap.exists()) return

      const updates: Record<string, unknown> = {
        adminOf: arrayUnion(cfg.appId),
        updated_at: serverTimestamp(),
      }

      if (role !== 'global') {
        updates.userOf = arrayUnion(cfg.appId)
      }

      await updateDoc(coreRef, updates)
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[ensureApp] failed to sync core membership', error)
      }
    }
  }
}
```

### `app/useAppUpdate.ts`

```ts
// ~/composables/app/useAppUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Ref } from 'vue'

import type { App } from '../../models/core/app.model'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { validateAppField } from './utils/useAppValidation'
import { formatAppField } from './utils/useAppFormatting'
import type { AppSocialLinks } from './utils/useAppValidation'
import { useRequireUser } from '../firebase/useRequireUser'

export function useAppUpdate(app: Ref<App | null | undefined>) {
  const db = useFirestore()
  const { appId: fallbackAppId } = useFireUXConfig()
  const { setDocument, deleteDocument } = useFirestoreManager()

  const resolveId = () => app.value?.id || fallbackAppId
  const requireId = () => {
    const id = resolveId()
    if (!id) throw new Error('No app id available.')
    return id
  }

  async function updateAppField2(field: string, value: any) {
    const id = requireId()
    await updateDoc(doc(db, 'apps', id), { [field]: value })
    return { success: true }
  }

  async function updateAppField(field: string, value: any) {
    const user = await useRequireUser()
    if (!user) throw new Error('User not authenticated')

    const validationError = validateAppField(field, value)
    if (validationError) throw new Error(validationError)

    const formattedValue = formatAppField(field, value)
    const id = requireId()
    await updateDoc(doc(db, 'apps', id), { [field]: formattedValue })
    return { success: true }
  }

  const updateDescription = (description: string) =>
    updateAppField('description', description)
  const updateAdmins = (adminIds: string[]) =>
    updateAppField('admin_ids', adminIds)
  const updateSocialLinks = (socialLinks: AppSocialLinks) =>
    updateAppField('social_links', socialLinks)

  async function profileToAppAction(
    action: 'add' | 'remove',
    subcollection: string,
    id: string | number,
    data?: any
  ) {
    const appId = requireId()
    if (action === 'add') {
      if (!data) throw new Error('Data is required for add action')
      await setDocument(`apps/${appId}/${subcollection}`, String(id), data)
      return { success: true, action: 'add' }
    }

    await deleteDocument(`apps/${appId}/${subcollection}`, String(id))
    return { success: true, action: 'remove' }
  }

  return {
    updateDescription,
    updateAdmins,
    updateSocialLinks,
    updateAppField,
    updateAppField2,
    profileToAppAction,
  }
}
```

### `app/useApps.ts`

```ts
import { ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type { App } from '../../models/core/app.model'
import { useFirestoreManager } from '../firestore/useFirestoreManager'

/**
 * Lightweight wrapper around Firestore apps collection
 * Aligns with older API shape: { apps, loading, fetchApps }
 */
export async function useApps(): Promise<{
  apps: Ref<App[] | undefined>
  loading: Ref<boolean>
  fetchApps: () => Promise<void>
}> {
  const loading = ref(true)
  const { firestoreFetchCollection } = useFirestoreManager()

  const apps: Ref<App[] | undefined> = import.meta.client
    ? await firestoreFetchCollection<App>('apps')
    : (ref([]) as Ref<App[] | undefined>)

  watchEffect(() => {
    if (apps.value !== undefined) loading.value = false
  })

  async function fetchApps() {
    // Reactive source already subscribed; keep as no-op placeholder
    await Promise.resolve()
  }

  return { apps, loading, fetchApps }
}
```

## app/utils

### `app/utils/useAppFormatting.ts`

```ts
// ~/composables/app/utils/useAppFormatting.ts

/**
 * APP FORMATTING UTILITIES
 *
 * Formatting functions for app-level fields before saving to Firestore.
 * These ensure consistent data format across the application.
 */

import type { AppSocialLinks } from './useAppValidation'

/**
 * Formats app description for storage
 */
export function formatAppDescription(value: string): string {
  return value.trim()
}

/**
 * Formats admin IDs array for storage
 */
export function formatAdminIds(adminIds: string[]): string[] {
  return adminIds.map((id) => id.trim()).filter((id) => id.length > 0) // Remove empty strings
}

/**
 * Formats a single URL for storage
 */
export function formatUrl(url: string): string {
  const trimmed = url.trim()

  // Add https:// if no protocol is specified
  if (trimmed && !trimmed.match(/^https?:\/\//)) {
    return `https://${trimmed}`
  }

  return trimmed
}

/**
 * Formats social links object for storage
 */
export function formatSocialLinks(socialLinks: AppSocialLinks): AppSocialLinks {
  const formatted: AppSocialLinks = {}

  // Format each URL and only include non-empty ones
  const platforms = [
    'website',
    'twitter',
    'facebook',
    'instagram',
    'linkedin',
    'youtube',
  ] as const

  for (const platform of platforms) {
    const url = socialLinks[platform]
    if (url && url.trim()) {
      formatted[platform] = formatUrl(url)
    }
  }

  return formatted
}

/**
 * Main formatting function that formats any app field
 */
export function formatAppField(field: string, value: any): any {
  switch (field) {
    case 'description':
      return formatAppDescription(value)
    case 'admin_ids':
      return formatAdminIds(value)
    case 'social_links':
      return formatSocialLinks(value)
    default:
      return value // Return as-is for unknown fields
  }
}
```

### `app/utils/useAppValidation.ts`

```ts
// ~/composables/app/utils/useAppValidation.ts

/**
 * APP VALIDATION UTILITIES
 *
 * Validation functions for app-level fields that can be updated at runtime.
 * These are separated from the update composable for better maintainability.
 */

// Types for app editable fields
export interface AppSocialLinks {
  website?: string
  twitter?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  youtube?: string
}

/**
 * Validates app description field
 */
export function validateAppDescription(value: string): string | null {
  const trimmedValue = value.trim()

  if (trimmedValue.length > 500) {
    return 'Description must be less than 500 characters'
  }

  // Description can be empty (optional field)
  return null
}

/**
 * Validates admin IDs array
 */
export function validateAdminIds(adminIds: string[]): string | null {
  if (!Array.isArray(adminIds)) {
    return 'Admin IDs must be an array'
  }

  if (adminIds.length === 0) {
    return 'At least one admin is required'
  }

  // Validate that all IDs are non-empty strings
  for (const id of adminIds) {
    if (typeof id !== 'string' || !id.trim()) {
      return 'All admin IDs must be non-empty strings'
    }

    // Basic UID validation (Firebase UIDs are typically 28 characters)
    if (id.length !== 28) {
      return 'Invalid admin ID format (must be 28 characters)'
    }
  }

  return null
}

/**
 * Validates a single URL
 */
export function validateUrl(url: string, platform: string): string | null {
  if (!url || !url.trim()) {
    return null // Empty URLs are allowed
  }

  try {
    const urlObj = new URL(url.trim())

    // Ensure it's http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return `${platform} URL must use http or https protocol`
    }

    return null
  } catch {
    return `Invalid ${platform} URL format`
  }
}

/**
 * Validates social links object
 */
export function validateSocialLinks(
  socialLinks: AppSocialLinks
): string | null {
  if (!socialLinks || typeof socialLinks !== 'object') {
    return 'Social links must be an object'
  }

  // Validate each URL if provided
  const platforms = [
    'website',
    'twitter',
    'facebook',
    'instagram',
    'linkedin',
    'youtube',
  ] as const

  for (const platform of platforms) {
    const url = socialLinks[platform]
    if (url) {
      const validationError = validateUrl(url, platform)
      if (validationError) {
        return validationError
      }
    }
  }

  return null
}

/**
 * Main validation function that validates all app fields
 */
export function validateAppField(field: string, value: any): string | null {
  switch (field) {
    case 'description':
      return validateAppDescription(value)
    case 'admin_ids':
      return validateAdminIds(value)
    case 'social_links':
      return validateSocialLinks(value)
    default:
      return `Unknown app field: ${field}`
  }
}
```

### `app/utils/useAvatarProxy.ts`

```ts
import { computed, toValue } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * Utility function to proxy Google avatar URLs through our server
 * This bypasses CORS issues with Google profile images
 */
export function useAvatarProxy() {
  /**
   * Converts a Google profile image URL to use our proxy
   * @param avatarUrl - The original Google profile image URL
   * @returns Proxied URL or original URL if not a Google image
   */
  function getProxiedAvatarUrl(avatarUrl: string | null | undefined): string {
    // Return empty string for null/undefined
    if (!avatarUrl) return ''

    // If it's a Google profile image, proxy it
    if (
      avatarUrl.includes('googleusercontent.com') ||
      avatarUrl.includes('google.com/')
    ) {
      return `/api/proxy/image?url=${encodeURIComponent(avatarUrl)}`
    }

    // Return original URL for non-Google images
    return avatarUrl
  }

  /**
   * Reactive computed property for avatar URLs
   * @param avatarUrl - Reactive reference to avatar URL
   * @returns Reactive proxied avatar URL
   */
  function useProxiedAvatar(
    avatarUrl:
      | Ref<string | null | undefined>
      | ComputedRef<string | null | undefined>
  ) {
    return computed(() => getProxiedAvatarUrl(toValue(avatarUrl)))
  }

  return {
    getProxiedAvatarUrl,
    useProxiedAvatar,
  }
}
```

### `app/utils/useBreadcrumbs.ts`

```ts
import { computed } from 'vue'
import { useRoute, type RouteLocationMatched } from 'vue-router'

export function useBreadcrumbs() {
  const route = useRoute()

  return computed(() => {
    // Hide breadcrumbs on the home page
    if (route.path === '/') {
      return []
    }

    // Default icons - using dummy data for now
    const homeIcon = 'i-lucide-home'
    const defaultIcon = 'i-lucide-link'

    const links = [{ label: 'Home', icon: homeIcon, to: '/' }]

    const lastMatch: RouteLocationMatched | undefined =
      route.matched[route.matched.length - 1]
    const currentLabel =
      (lastMatch?.meta as any)?.breadcrumb ||
      route.name ||
      lastMatch?.name ||
      route.path

    const currentIcon = defaultIcon // Simple default for now

    links.push({
      label: String(currentLabel || ''),
      icon: currentIcon,
      to: route.path,
    })

    return links
  })
}
```

### `app/utils/useEditHandler.ts`

```ts
import { ref } from 'vue'
import type { Ref } from 'vue'

// Type definitions
interface EditHandlerOptions {
  debounceTime?: number
  delay?: number
}

type SaveStatus = '' | 'saving' | 'saved' | 'error'

type UpdateFunction = (data: Record<string, any>) => Promise<void>

interface EditHandlerReturn {
  saveField: (label: string, field: string, newValue: any) => Promise<void>
  autoSave: (label: string, field: string, value: any) => void
  saveStatus: Ref<SaveStatus>
}

// Toast interface for fallback
interface ToastInterface {
  add: (toast: { title: string; description: string; color: string }) => void
  success: (message: string, options?: any) => void
  error: (message: string, options?: any) => void
}

// Helper function to get toast instance with fallback
function getToast(): ToastInterface {
  // Try to get useToast from global scope (auto-imported by Nuxt UI)
  const useToastFn = (globalThis as any).useToast
  if (typeof useToastFn === 'function') return useToastFn()
  // Fallback implementation
  return {
    add: ({ title, description, color }: any) => {
      console.log(`[${color?.toUpperCase()}] ${title}: ${description}`)
    },
    success: (message: string) => {
      console.log(`✅ ${message}`)
    },
    error: (message: string) => {
      console.error(`❌ ${message}`)
    },
  }
}

function useEditHandler(
  updateFunction: UpdateFunction,
  options: EditHandlerOptions = {}
): EditHandlerReturn {
  const toast = getToast()
  const saveStatus = ref<SaveStatus>('')

  // Simple debounce implementation to avoid lodash dependency
  function simpleDebounce<T extends (...args: any[]) => void>(
    fn: T,
    wait: number
  ): T {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return ((...args: any[]) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), wait)
    }) as T
  }

  // Debounced save function for fields that require delayed updates
  const debouncedSave = simpleDebounce(
    async (label: string, field: string, value: any) => {
      try {
        saveStatus.value = 'saving'
        if (typeof updateFunction !== 'function') {
          throw new Error('updateFunction is not a valid function.')
        }
        await updateFunction({ [field]: value })
        saveStatus.value = 'saved'

        // Success toast with label
        toast.success(`${label} updated successfully`, { timeout: 3000 })

        setTimeout(() => {
          if (saveStatus.value === 'saved') {
            saveStatus.value = ''
          }
        }, options.delay ?? 2000)
      } catch (error) {
        console.error(`Error saving ${label}:`, error)
        saveStatus.value = 'error'

        // Error toast
        toast.error(`Failed to update ${label}`, { timeout: 3000 })
      }
    },
    options.debounceTime ?? 800
  )

  // Immediate save function (non-debounced)
  async function saveField(
    label: string,
    field: string,
    newValue: any
  ): Promise<void> {
    try {
      saveStatus.value = 'saving'
      if (typeof updateFunction !== 'function') {
        throw new Error('updateFunction is not a valid function.')
      }
      await updateFunction({ [field]: newValue })
      saveStatus.value = 'saved'

      toast.add({
        title: 'Success',
        description: `${label} updated successfully.`,
        color: 'success',
      })
    } catch (error) {
      toast.add({
        title: 'Error',
        description: `Failed to update ${label}.`,
        color: 'error',
      })
      throw error
    }
  }

  // Wrapper for debounced save
  function autoSave(label: string, field: string, value: any): void {
    debouncedSave(label, field, value)
  }

  return { saveField, autoSave, saveStatus }
}

// Export the function
export { useEditHandler }
```

### `app/utils/effects/useLandingEffect.ts`

```ts
// Unified landing effect composable for all FireUX apps
export function useLandingEffect() {
  const initializeEffect = (
    effectType: 'stars' | 'bubbles' | 'steam' | 'code'
  ) => {
    const elements = document.querySelectorAll('.effect-particle')

    for (const element of elements) {
      const particleElement = element as HTMLElement

      // Common positioning
      particleElement.style.left = `${Math.random() * 100}%`
      const startingPoint = Math.random() * 100
      particleElement.style.top = `${startingPoint}%`
      const initialYPos = 100 - startingPoint
      particleElement.style.transform = `translateY(${initialYPos}vh)`

      // Effect-specific properties
      switch (effectType) {
        case 'stars':
          initializeStars(particleElement, startingPoint)
          break
        case 'bubbles':
          initializeBubbles(particleElement, startingPoint)
          break
        case 'steam':
          initializeSteam(particleElement, startingPoint)
          break
        case 'code':
          initializeCode(particleElement, startingPoint)
          break
      }
    }
  }

  const initializeStars = (element: HTMLElement, startingPoint: number) => {
    // Random size
    const size = Math.random() * 1.5 + 1
    element.style.width = `${size}px`
    element.style.height = `${size}px`

    // Random opacity
    const initialOpacity = Math.random() * 0.4 + 0.1
    element.style.opacity = initialOpacity.toString()

    // Random durations
    const twinkleDuration = Math.random() * 3 + 3
    const moveDuration = Math.random() * 340 + 340

    // Animation setup
    const moveDelay = -(moveDuration * (startingPoint / 100))
    const twinkleDelay = Math.random() * 2

    element.style.animationDelay = `${twinkleDelay}s, ${moveDelay}s`
    element.style.animationDuration = `${twinkleDuration}s, ${moveDuration}s`

    // Reset on animation end
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeBubbles = (element: HTMLElement, startingPoint: number) => {
    // Random size for bubbles
    const size = Math.random() * 20 + 10 // 10-30px
    element.style.width = `${size}px`
    element.style.height = `${size}px`

    // Random opacity
    const initialOpacity = Math.random() * 0.3 + 0.1
    element.style.opacity = initialOpacity.toString()

    // Random durations
    const floatDuration = Math.random() * 5 + 8 // 8-13 seconds
    const popDuration = Math.random() * 2 + 2 // 2-4 seconds
    const sway = Math.random() * 3 + 2 // 2-5 seconds

    // Animation setup
    const floatDelay = -(floatDuration * (startingPoint / 100))
    const popDelay = Math.random() * 3
    const swayDelay = Math.random() * 2

    element.style.animationDelay = `${popDelay}s, ${floatDelay}s, ${swayDelay}s`
    element.style.animationDuration = `${popDuration}s, ${floatDuration}s, ${sway}s`

    // Reset on animation end
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeSteam = (element: HTMLElement, startingPoint: number) => {
    // Random size for steam clouds
    const size = Math.random() * 40 + 20 // 20-60px
    element.style.width = `${size}px`
    element.style.height = `${size}px`

    // Random opacity
    const initialOpacity = Math.random() * 0.4 + 0.1
    element.style.opacity = initialOpacity.toString()

    // Random durations
    const riseDuration = Math.random() * 6 + 10 // 10-16 seconds
    const expandDuration = Math.random() * 4 + 6 // 6-10 seconds
    const drift = Math.random() * 8 + 4 // 4-12 seconds

    // Animation setup
    const riseDelay = -(riseDuration * (startingPoint / 100))
    const expandDelay = Math.random() * 3
    const driftDelay = Math.random() * 4

    element.style.animationDelay = `${expandDelay}s, ${riseDelay}s, ${driftDelay}s`
    element.style.animationDuration = `${expandDuration}s, ${riseDuration}s, ${drift}s`

    // Reset on animation end
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeCode = (element: HTMLElement, startingPoint: number) => {
    // Random size for code symbols
    const size = Math.random() * 8 + 12 // 12-20px font size
    element.style.fontSize = `${size}px`

    // Random opacity
    const initialOpacity = Math.random() * 0.5 + 0.3
    element.style.opacity = initialOpacity.toString()

    // Random durations
    const riseDuration = Math.random() * 8 + 15 // 15-23 seconds
    const glowDuration = Math.random() * 3 + 2 // 2-5 seconds
    const drift = Math.random() * 5 + 4 // 4-9 seconds

    // Animation setup
    const riseDelay = -(riseDuration * (startingPoint / 100))
    const glowDelay = Math.random() * 3
    const driftDelay = Math.random() * 2

    element.style.animationDelay = `${glowDelay}s, ${riseDelay}s, ${driftDelay}s`
    element.style.animationDuration = `${glowDuration}s, ${riseDuration}s, ${drift}s`

    // Reset on animation end
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  return {
    initializeEffect,
  }
}
```

## firestore/profiles

### `firestore/profiles/useProfile.ts`

```ts
import { computed, watchEffect, type ComputedRef } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileDelete } from './useProfileDelete'
import { useProfileEnsure } from './useProfileEnsure'
import { useProfileComputed } from './useProfileComputed'
import { useProfileState } from '../../state/useProfileState'
import type {
  ProfileConfig,
  ProfileBase,
} from '../../../models/profiles/profile.model'

type ProfileUnion<
  TCore extends ProfileBase,
  TApp extends ProfileBase
> = (Partial<TCore> & Partial<TApp>) & {
  id: string
  core: TCore | null
  app?: TApp | null
}

export function useProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const uid = computed(() => currentUser.value?.uid ?? null)

  // Core profile doc (always attempt when signed-in)
  const coreRef = computed<DocumentReference<TCore> | null | undefined>(() =>
    uid.value
      ? (doc(db, config.collectionName, uid.value) as DocumentReference<TCore>)
      : null
  )
  const { data: coreDoc } = useDocument<TCore>(coreRef)

  // App profile doc (only when tenant + appId)
  const appRef = computed<DocumentReference<TApp> | null | undefined>(() =>
    uid.value && isTenant
      ? (doc(
          db,
          `apps/${appId}/${config.collectionName}`,
          uid.value
        ) as DocumentReference<TApp>)
      : null
  )
  const { data: appDoc } = useDocument<TApp>(appRef)

  // Unified profile object (flattened with precedence: app > core > base)
  const profile: ComputedRef<ProfileUnion<TCore, TApp> | null> = computed(
    () => {
      if (!uid.value) return null

      const base = { id: uid.value }
      const core = coreDoc.value ?? null
      const app = isTenant ? appDoc.value ?? null : undefined
      return {
        ...base,
        ...(core ?? {}),
        ...(app ?? {}),
        core,
        app,
      } as ProfileUnion<TCore, TApp>
    }
  )

  // Mirror into Nuxt state (per-profile-type)
  const { profile: profileState } = useProfileState<ProfileUnion<
    TCore,
    TApp
  > | null>(config.id)
  watchEffect(() => {
    profileState.value = profile.value
  })

  // Collections
  const { firestoreFetchCollection } = useFirestoreRead()

  const collectionLocal = isTenant
    ? firestoreFetchCollection(`apps/${appId}/${config.collectionName}`)
    : null

  let collectionGlobal = !isTenant
    ? firestoreFetchCollection(config.collectionName)
    : null

  function fetchGlobal() {
    if (!isTenant) return collectionGlobal
    collectionGlobal ??= firestoreFetchCollection(config.collectionName)
    return collectionGlobal
  }

  return {
    profile,
    collection: {
      local: collectionLocal,
      global: collectionGlobal,
      fetchGlobal,
    },
    ...useProfileComputed(profile, config),
    ...useProfileDelete(profile, config),
    ...useProfileEnsure(profile, config),
  }
}
```

### `firestore/profiles/useProfileComputed.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'

type ProfileLike = { core?: unknown; app?: unknown }

export function useProfileComputed(
  profile: Ref<ProfileLike | null | undefined>,
  config: ProfileConfig
) {
  const { role } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const hasCoreProfile = computed(() => !!profile.value?.core)
  const hasAppProfile = isTenant
    ? computed(() => !!profile.value?.app)
    : undefined

  // Unified: treat profile as present if either core or app exists (tenants prefer app but include core)
  const hasProfile = computed(() => {
    if (isTenant) {
      // When tenant, count either app overlay or core baseline
      return !!(hasAppProfile?.value || hasCoreProfile.value)
    }
    // Non-tenant only has core
    return hasCoreProfile.value
  })

  const ctaMessage = computed(() =>
    hasCoreProfile.value
      ? null
      : config.cta || `Complete your ${config.profileType} profile to continue.`
  )

  return {
    hasCoreProfile,
    ...(isTenant ? { hasAppProfile } : {}),
    hasProfile,
    ctaMessage,
  }
}
```

### `firestore/profiles/useProfileDelete.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileDelete.ts
import { ref, type Ref } from 'vue'
import type { ProfileConfig } from '../../../models/profiles/profile.model'

/**
 * Delete profile docs:
 * - scope: 'core' | 'app' | 'both' | 'auto'
 * - allApps: delete ALL app overlays via collectionGroup
 */
export function useProfileDelete(
  _profile: Ref<any>, // not used now, kept for future hook symmetry
  _config: ProfileConfig
) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)
  async function deleteProfile(opts: { id?: string } = {}) {
    const { id } = opts
    if (!id) throw new Error('Profile id is required')

    deleting.value = true
    deleteError.value = null

    deleting.value = false
    return 'success' as const
  }

  return {
    deleteProfile,
    deleting,
    deleteError,
  }
}
```

### `firestore/profiles/useProfileEnsure.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileEnsure.ts
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useUser } from '../user/useUser'

/**
 * Create the profile if it doesn't exist (core + optional app).
 * - No overwrite. If doc exists, it is left as-is.
 * - Returns flags so UI can react.
 */
export function useProfileEnsure(_profile: any, config: ProfileConfig) {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const { user } = useUser()

  async function ensure(profile: Record<string, any> = {}) {
    if (!user.value?.id) throw new Error('User not loaded')
    const uid = user.value.id

    const base = {
      id: uid,
      // privacy-safe; never derive from email
      display_name: user.value.core?.display_name || uid,
      avatar: user.value.core?.avatar || '',
    }

    let createdCore = false
    let createdApp = false

    // Core (global) doc
    {
      const coreRef = doc(db, config.collectionName, uid)
      const snap = await getDoc(coreRef)
      if (!snap.exists()) {
        await setDoc(coreRef, { ...base, ...profile }, { merge: false })
        createdCore = true
      }
    }

    // App (tenant overlay)
    if (isTenant) {
      const appRef = doc(db, `apps/${appId}/${config.collectionName}`, uid)
      const snap = await getDoc(appRef)
      if (!snap.exists()) {
        await setDoc(appRef, { ...base, ...profile }, { merge: false })
        createdApp = true
      }
    }

    return { createdCore, createdApp } as const
  }

  return { ensure }
}
```

### `firestore/profiles/useProfileUpdate.ts`

```ts
import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'

/**
 * Generic profile update composable foundation
 * Provides standardized update infrastructure that profile-specific composables can extend
 */
export function useProfileUpdate(profileConfig: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { updateDocument } = useFirestoreManager()

  // Use profileConfig directly; appScoped is deprecated
  const config = {
    ...profileConfig,
  }

  // Shared state for update operations
  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  // Generic update foundation with standardized best practices
  async function updateProfile(updateData: any, id?: string): Promise<string> {
    const targetId = id || currentUser.value?.uid

    if (!targetId) {
      throw new Error('No profile ID provided and user is not authenticated')
    }

    updating.value = true
    updateError.value = null

    try {
      // Add updated timestamp and exclude immutable fields
      const profileData = {
        ...updateData,
        updated_at: serverTimestamp(),
      }

      // Remove immutable fields if they exist
      if ('uid' in profileData) delete profileData.uid
      if ('created_at' in profileData) delete profileData.created_at

      await updateDocument(config.collectionName, targetId, profileData)

      return 'success'
    } catch (err: any) {
      updateError.value =
        err instanceof Error
          ? err
          : new Error(
              err?.message || `Failed to update ${config.profileType} profile`
            )
      throw updateError.value
    } finally {
      updating.value = false
    }
  }

  return {
    updateProfile,
    updating,
    updateError,
    // Shared utilities for profile-specific composables
    config,
    currentUser,
    updateDocument,
  }
}
```

## firestore/user

### `firestore/user/useUser.ts`

```ts
import { computed, shallowRef, watchEffect, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreRead } from '../useFirestoreRead'
import { useUserComputed } from './useUserComputed'
import { useUserEnsure } from './useUserEnsure'
import { useUserDelete } from './useUserDelete'
import { useUserState } from '../../state/useUserState'
import {
  toUser,
  type User,
  type CoreUserDoc,
  type AppUserDoc,
} from '../../../models/core/user.model'
import type { User as FirebaseUser } from 'firebase/auth'
import { useUserUpdate } from './useUserUpdate'
import { useUserFormattingAndValidation } from './useUserFormattingAndValidation'

export function useUser() {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  // Auth user (SSR-safe: null ref on server)
  const authUser: Ref<FirebaseUser | null> = import.meta.client
    ? (useCurrentUser() as Ref<FirebaseUser | null>)
    : shallowRef<FirebaseUser | null>(null)

  const uid = computed(() => authUser.value?.uid ?? null)

  // Core user doc
  const coreRef = computed<DocumentReference<CoreUserDoc> | null>(() =>
    uid.value
      ? (doc(db, 'core-users', uid.value) as DocumentReference<CoreUserDoc>)
      : null
  )
  const { data: coreDoc } = useDocument<CoreUserDoc>(coreRef)

  // App user doc (tenant scope)
  const appRef = computed<DocumentReference<AppUserDoc> | null>(() =>
    uid.value && isTenant && appId
      ? (doc(
          db,
          `apps/${appId}/users`,
          uid.value
        ) as DocumentReference<AppUserDoc>)
      : null
  )
  const { data: appDoc } = useDocument<AppUserDoc>(appRef)

  // Flattened current user (app > core > base)
  const user = computed<User | null>(() => {
    if (!uid.value) return null
    const core = coreDoc.value ?? null
    const app = isTenant && appId ? appDoc.value ?? null : null
    return toUser(core, app, uid.value)
  })

  // Mirror into Nuxt state
  const { user: userState } = useUserState()
  watchEffect(() => {
    userState.value = user.value
  })

  // Collections
  const { firestoreFetchCollection } = useFirestoreRead()

  const collectionLocal =
    isTenant && appId ? firestoreFetchCollection(`apps/${appId}/users`) : null

  let collectionGlobal = isTenant
    ? null
    : firestoreFetchCollection('core-users')

  function fetchGlobal() {
    if (!isTenant) return collectionGlobal
    collectionGlobal ??= firestoreFetchCollection('core-users')
    return collectionGlobal
  }

  return {
    user,
    collection: {
      local: collectionLocal,
      global: collectionGlobal,
      fetchGlobal,
    },
    ...useUserComputed(user),
    ...useUserEnsure(user),
    ...useUserDelete(user),
    ...useUserUpdate(user),
    ...useUserFormattingAndValidation(),
  }
}
```

### `firestore/user/useUserComputed.ts`

```ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'

export type HeaderState = 'sign-in' | 'create-core-user' | 'join-app' | 'avatar'
export interface NextCta {
  key: 'sign-in' | 'create-core-user' | 'join-app'
  label: string
  to: string
}

export function useUserComputed(user: Ref<User | null | undefined>) {
  const { role, appId } = useFireUXConfig()
  // Only treat as tenant when both role and appId are present
  const isTenant = role === 'tenant' && !!appId

  // Gates
  const isSignedIn = computed(() => !!user.value?.id)
  const hasCoreProfile = computed(() => !!user.value?.core)
  const hasAppProfile = computed(() => (isTenant ? !!user.value?.app : false))

  // Admin: app role OR global adminOf includes current app (or any app when global)
  const isAdmin = computed(() => {
    const u = user.value
    if (!u) return false
    if (u.app?.role === 'admin') return true
    const adminOf = u.core?.adminOf || []
    return isTenant && appId ? adminOf.includes(appId) : adminOf.length > 0
  })

  // Display fields (prefer app over core)
  const displayName = computed(
    () => user.value?.app?.display_name || user.value?.core?.display_name || ''
  )
  const handle = computed(
    () => user.value?.app?.handle || user.value?.core?.handle || ''
  )
  const avatarSrc = computed(
    () => user.value?.app?.avatar || user.value?.core?.avatar || ''
  )

  const initials = computed(() => {
    const name = displayName.value.trim()
    if (!name) return 'U'
    const parts = name.split(/\s+/)
    const a = parts[0]?.[0]?.toUpperCase() ?? ''
    const b = parts[1]?.[0]?.toUpperCase() ?? ''
    return a + b || a || 'U'
  })

  // Profile completeness (app-pref, fallback to core)
  const completeness = computed(() => {
    const u = user.value
    const defs = [
      { key: 'Name', val: u?.app?.display_name ?? u?.core?.display_name },
      { key: 'Avatar', val: u?.app?.avatar ?? u?.core?.avatar },
      { key: 'Handle', val: u?.app?.handle ?? u?.core?.handle },
      { key: 'Email', val: u?.core?.email }, // email is core-only
    ] as const

    const filled = defs.map((d) => ({
      label: d.key,
      filled: !!String(d.val ?? '').trim(),
    }))
    const filledCount = filled.filter((f) => f.filled).length
    const totalCount = filled.length
    const percent = Math.round((filledCount / Math.max(1, totalCount)) * 100)
    const missing = filled.filter((f) => !f.filled).map((f) => f.label)
    return { percent, filledCount, totalCount, missing }
  })

  // Header funnel logic
  // Global (not tenant): never suggest join-app
  // Tenant (role 'tenant' with appId): suggest join-app when core exists but tenant profile doesn't
  const headerState = computed<HeaderState>(() => {
    if (!isSignedIn.value) return 'sign-in'
    if (!hasCoreProfile.value) return 'create-core-user'
    if (isTenant && !hasAppProfile.value) return 'join-app'
    return 'avatar'
  })

  const nextCta = computed<NextCta | null>(() => {
    switch (headerState.value) {
      case 'sign-in':
        return { key: 'sign-in', label: 'Sign in', to: '/auth' }
      case 'create-core-user':
        return {
          key: 'create-core-user',
          label: 'Create Profile',
          to: '/onboarding',
        }
      case 'join-app':
        return { key: 'join-app', label: 'Join App', to: '/join' }
      default:
        return null
    }
  })

  /** Quick membership test */
  function hasProfile(id: string) {
    const active = user.value?.profiles || user.value?.core?.profiles || []
    return Array.isArray(active) ? active.includes(id) : false
  }

  return {
    // gates
    isSignedIn,
    hasCoreProfile,
    hasAppProfile,
    isAdmin,

    // display
    displayName,
    handle,
    avatarSrc,
    initials,

    // profile quality
    completeness,

    // header UX
    headerState,
    nextCta,

    // profiles
    hasProfile,
  }
}
```

### `firestore/user/useUserDelete.ts`

```ts
import { ref, type Ref } from 'vue'
import type { User } from '../../../models/core/user.model'

/**
 * Placeholder delete composable while destructive flows are unfinished.
 * We only validate the id and expose loading/error state for future wiring.
 */
export function useUserDelete(userRef?: Ref<User | null | undefined>) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  async function deleteUser(id?: string) {
    const resolvedId = id ?? userRef?.value?.id
    if (!resolvedId) throw new Error('User id is required')

    deleting.value = true
    deleteError.value = null

    try {
      // eslint-disable-next-line no-console
      console.warn('[fireux-core] deleteUser stub – no deletion performed', {
        id: resolvedId,
      })
      return 'not-implemented' as const
    } catch (error) {
      deleteError.value =
        error instanceof Error ? error : new Error('Unknown error')
      throw deleteError.value
    } finally {
      deleting.value = false
    }
  }

  return { deleteUser, deleting, deleteError }
}
```

### `firestore/user/useUserEnsure.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts
import type { Ref } from 'vue'
import { useFirestore } from 'vuefire'
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useFireUXConfig } from '../../FireUXConfig'
import type {
  CoreUserDoc,
  AppUserDoc,
  User,
} from '../../../models/core/user.model'
import { useRouter } from 'vue-router'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { requireUid, ensureAvatarUrl } from '../ensure/useEnsureCommon'

/**
 * Dev-simple ensure:
 * - Always ensure core user (creates if missing, uploads auth.photoURL)
 * - If tenant, ensure app user (creates if missing) reusing the core avatar URL
 * - No fallbacks/guards beyond existence checks for the docs
 */
export function useUserEnsure(_user?: Ref<User | null>) {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const router = useRouter()
  const { setDocument } = useFirestoreCreate()

  async function ensureCoreUser(): Promise<{
    created: boolean
    avatarUrl?: string
  }> {
    const { uid, auth } = await requireUid()

    const coreRef = doc(db, 'core-users', uid)
    const snap = await getDoc(coreRef)
    if (snap.exists()) {
      const data = snap.data() as Partial<CoreUserDoc>

      if (isTenant && appId && !data?.userOf?.includes(appId)) {
        await updateDoc(coreRef, {
          userOf: arrayUnion(appId),
          updated_at: serverTimestamp(),
        })
      }

      return { created: false, avatarUrl: data?.avatar }
    }

    const avatarUrl = await ensureAvatarUrl(
      `core-users/${uid}/avatar`,
      [auth?.photoURL],
      true
    )

    const payload: Partial<CoreUserDoc> = {
      id: uid,
      email: auth?.email ?? '',
      display_name: auth?.displayName || 'New User',
      avatar: avatarUrl,
      ...(isTenant && appId ? { userOf: [appId] } : {}),
    }

    await setDocument('core-users', uid, payload as CoreUserDoc)
    return { created: true, avatarUrl }
  }

  // No tenant/appId check here — ensureUser controls when this runs.
  async function ensureAppUser(): Promise<{ created: boolean }> {
    if (!isTenant || !appId) {
      return { created: false }
    }

    const { uid } = await requireUid()
    const appDocRef = doc(db, 'apps', appId)
    const appDoc = await getDoc(appDocRef)
    if (!appDoc.exists()) {
      return { created: false }
    }
    const appRef = doc(db, `apps/${appId}/users`, uid)
    const snap = await getDoc(appRef)
    if (snap.exists()) return { created: false }

    await setDocument(`apps/${appId}/users`, uid, {
      id: uid,
      role: 'user',
    } as Partial<AppUserDoc>)
    return { created: true }
  }

  async function ensureUser() {
    const core = await ensureCoreUser()
    const app = await ensureAppUser()

    if ((core.created || app.created) && import.meta.client) {
      router.push('/dashboard')
    }

    return { createdCore: core.created, createdApp: app.created } as const
  }

  return { ensureUser, ensureCoreUser, ensureAppUser }
}
```

### `firestore/user/useUserFormattingAndValidation.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserFormattingAndValidation.ts

export function useUserFormattingAndValidation() {
  function validateDisplayName(name: string) {
    const value = (name || '').trim()
    if (!value) return { isValid: false, message: 'Name cannot be empty.' }
    if (value.length < 2)
      return { isValid: false, message: 'Name is too short.' }
    if (value.length > 60)
      return { isValid: false, message: 'Name is too long.' }
    return { isValid: true }
  }

  function formatDisplayName(name: string) {
    const value = (name || '').trim()
    return value
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
  }

  function validateHandle(raw: string) {
    const value = String(raw || '').trim()
    if (!value) return { isValid: true } // allow clearing
    const normalized = value.toLowerCase()
    if (normalized.length < 3)
      return { isValid: false, message: 'Handle too short.' }
    if (normalized.length > 30)
      return { isValid: false, message: 'Handle too long.' }
    if (!/^[a-z0-9-]+$/.test(normalized)) {
      return {
        isValid: false,
        message: 'Use lowercase letters, numbers, and dashes only.',
      }
    }
    return { isValid: true }
  }

  function formatHandle(raw: string) {
    let s = String(raw || '')
      .trim()
      .toLowerCase()
    s = s.replace(/^@+/, '') // drop leading @ if user typed it
    s = s.replace(/\s+/g, '-')
    s = s.replace(/[^a-z0-9-]/g, '')
    s = s.replace(/-+/g, '-')
    s = s.replace(/^-|-$|_/g, '')
    return s.slice(0, 30)
  }

  return {
    validateDisplayName,
    formatDisplayName,
    validateHandle,
    formatHandle,
  }
}
```

### `firestore/user/useUserUpdate.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from '../../../models/core/user.model'
import { useFirestoreUpdate } from '../useFirestoreUpdate'
import { useImageStorage } from '../../firebase/useImageStorage'

type TargetScope = 'auto' | 'core' | 'app'

export function useUserUpdate(userRef?: Ref<User | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const getUid = () => userRef?.value?.id ?? authRef.value?.uid

  const targetFromScope = (scope: TargetScope) => {
    const id = getUid()
    if (!id) throw new Error('Not signed in and no userRef.id provided')

    if (scope === 'core') return { collection: 'core-users', id }
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }

    // auto
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }
    return { collection: 'core-users', id }
  }

  /** low-level writer */
  type ScopePartialMap = {
    core: Partial<CoreUserDoc>
    app: Partial<AppUserDoc>
    auto: Partial<CoreUserDoc> | Partial<AppUserDoc>
  }

  const updateFieldsScoped = async <S extends TargetScope>(
    partial: ScopePartialMap[S],
    scope: S = 'auto' as S
  ) => {
    const { collection, id } = targetFromScope(scope)
    const isAppCollection = collection.startsWith('apps/')

    if (isAppCollection) {
      await updateDocument<AppUserDoc>(
        collection,
        id,
        partial as ScopePartialMap['app']
      )
      return
    }

    await updateDocument<CoreUserDoc>(
      collection,
      id,
      partial as ScopePartialMap['core']
    )
  }

  /** Field updaters (scoped) */
  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => updateFieldsScoped({ display_name }, scope)

  const updateHandle = async (handle: string, scope: TargetScope = 'auto') =>
    updateFieldsScoped({ handle }, scope)

  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto'
  ) => {
    const { collection, id } = targetFromScope(scope)
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFieldsScoped({ avatar: url }, scope)
    return url
  }

  return {
    // generic
    updateFields: updateFieldsScoped,

    // scoped helpers
    updateDisplayName,
    updateHandle,
    updateAvatar,
  }
}
```

## Migration Notes

- Many delete flows (`useUserDelete`, `useProfileDelete`) are placeholders; migration can decide whether to remove or wire real Firestore deletes.
- UI-only utilities (`useAvatarProxy`, `useBreadcrumbs`, `useLandingEffect`) have no direct Firestore dependencies and can stay client-side.
- When porting, ensure tenant vs global branching is preserved (`useUser`, `useProfile`, `useAppComputed`).
- Validate new Firestore manager APIs before swapping (`useAppUpdate` mixes direct `updateDoc` and manager helpers).
````
