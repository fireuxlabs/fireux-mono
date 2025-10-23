# App Utils Snapshot

## packages/core/fireux-core/src/runtime/composables/app/utils/useAvatarProxy.ts

```typescript
// FILE: /packages/core/fireux-core/src/runtime/composables/app/utils/useAvatarProxy.ts
import { computed, toValue } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * Utility to proxy Google avatar URLs through our server (avoids CORS issues).
 */
export function useAvatarProxy() {
  function getProxiedAvatarUrl(avatarUrl: string | null | undefined): string {
    if (!avatarUrl) return ''
    if (
      avatarUrl.includes('googleusercontent.com') ||
      avatarUrl.includes('google.com/')
    ) {
      return `/api/proxy/image?url=${encodeURIComponent(avatarUrl)}`
    }
    return avatarUrl
  }

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

## packages/core/fireux-core/src/runtime/composables/app/utils/useBreadcrumbs.ts

```typescript
// FILE: /packages/core/fireux-core/src/runtime/composables/app/utils/useBreadcrumbs.ts
import { computed } from 'vue'
import { useRoute, type RouteLocationMatched } from 'vue-router'

export function useBreadcrumbs() {
  const route = useRoute()

  return computed(() => {
    if (route.path === '/') return []

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

    links.push({
      label: String(currentLabel || ''),
      icon: defaultIcon,
      to: route.path,
    })

    return links
  })
}
```

## packages/core/fireux-core/src/runtime/composables/app/utils/useEditHandler.ts

```typescript
// FILE: /packages/core/fireux-core/src/runtime/composables/app/utils/useEditHandler.ts
import { ref } from 'vue'
import type { Ref } from 'vue'

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

interface ToastInterface {
  add: (toast: { title: string; description: string; color: string }) => void
  success: (message: string, options?: any) => void
  error: (message: string, options?: any) => void
}

function getToast(): ToastInterface {
  const useToastFn = (globalThis as any).useToast
  if (typeof useToastFn === 'function') return useToastFn()
  return {
    add: ({ title, description, color }: any) => {
      console.log(`[${color?.toUpperCase()}] ${title}: ${description}`)
    },
    success: (message: string) => console.log(`✅ ${message}`),
    error: (message: string) => console.error(`❌ ${message}`),
  }
}

export function useEditHandler(
  updateFunction: UpdateFunction,
  options: EditHandlerOptions = {}
): EditHandlerReturn {
  const toast = getToast()
  const saveStatus = ref<SaveStatus>('')

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

  const debouncedSave = simpleDebounce(
    async (label: string, field: string, value: any) => {
      try {
        saveStatus.value = 'saving'
        if (typeof updateFunction !== 'function') {
          throw new Error('updateFunction is not a valid function.')
        }
        await updateFunction({ [field]: value })
        saveStatus.value = 'saved'
        toast.success(`${label} updated successfully`, { timeout: 3000 })
        setTimeout(() => {
          if (saveStatus.value === 'saved') saveStatus.value = ''
        }, options.delay ?? 2000)
      } catch (error) {
        console.error(`Error saving ${label}:`, error)
        saveStatus.value = 'error'
        toast.error(`Failed to update ${label}`, { timeout: 3000 })
      }
    },
    options.debounceTime ?? 800
  )

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

  function autoSave(label: string, field: string, value: any): void {
    debouncedSave(label, field, value)
  }

  return { saveField, autoSave, saveStatus }
}
```

## Tenant Landing Effect Copies (shared implementation)

Each tenant now owns its own landing effect composable. The implementation is currently identical across tenants.

```typescript
// FILE: /packages/tenants/fireux-cleanbox/src/runtime/composables/app/utils/effects/useLandingEffect.ts
// Unified landing effect composable for this tenant
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
    const size = Math.random() * 1.5 + 1
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    const initialOpacity = Math.random() * 0.4 + 0.1
    element.style.opacity = initialOpacity.toString()
    const twinkleDuration = Math.random() * 3 + 3
    const moveDuration = Math.random() * 340 + 340
    const moveDelay = -(moveDuration * (startingPoint / 100))
    const twinkleDelay = Math.random() * 2
    element.style.animationDelay = `${twinkleDelay}s, ${moveDelay}s`
    element.style.animationDuration = `${twinkleDuration}s, ${moveDuration}s`
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeBubbles = (element: HTMLElement, startingPoint: number) => {
    const size = Math.random() * 20 + 10
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    const initialOpacity = Math.random() * 0.3 + 0.1
    element.style.opacity = initialOpacity.toString()
    const floatDuration = Math.random() * 5 + 8
    const popDuration = Math.random() * 2 + 2
    const sway = Math.random() * 3 + 2
    const floatDelay = -(floatDuration * (startingPoint / 100))
    const popDelay = Math.random() * 3
    const swayDelay = Math.random() * 2
    element.style.animationDelay = `${popDelay}s, ${floatDelay}s, ${swayDelay}s`
    element.style.animationDuration = `${popDuration}s, ${floatDuration}s, ${sway}s`
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeSteam = (element: HTMLElement, startingPoint: number) => {
    const size = Math.random() * 40 + 20
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    const initialOpacity = Math.random() * 0.4 + 0.1
    element.style.opacity = initialOpacity.toString()
    const riseDuration = Math.random() * 6 + 10
    const expandDuration = Math.random() * 4 + 6
    const drift = Math.random() * 8 + 4
    const riseDelay = -(riseDuration * (startingPoint / 100))
    const expandDelay = Math.random() * 3
    const driftDelay = Math.random() * 4
    element.style.animationDelay = `${expandDelay}s, ${riseDelay}s, ${driftDelay}s`
    element.style.animationDuration = `${expandDuration}s, ${riseDuration}s, ${drift}s`
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  const initializeCode = (element: HTMLElement, startingPoint: number) => {
    const size = Math.random() * 8 + 12
    element.style.fontSize = `${size}px`
    const initialOpacity = Math.random() * 0.5 + 0.3
    element.style.opacity = initialOpacity.toString()
    const riseDuration = Math.random() * 8 + 15
    const glowDuration = Math.random() * 3 + 2
    const drift = Math.random() * 5 + 4
    const riseDelay = -(riseDuration * (startingPoint / 100))
    const glowDelay = Math.random() * 3
    const driftDelay = Math.random() * 2
    element.style.animationDelay = `${glowDelay}s, ${riseDelay}s, ${driftDelay}s`
    element.style.animationDuration = `${glowDuration}s, ${riseDuration}s, ${drift}s`
    element.addEventListener('animationiteration', () => {
      element.style.top = '100%'
      element.style.transform = `translateY(-100vh)`
    })
  }

  return { initializeEffect }
}
```

> The exact same implementation has been duplicated to:
>
> - `packages/tenants/fireux-fireux/src/runtime/composables/app/utils/effects/useLandingEffect.ts`
> - `packages/tenants/fireux-misebox/src/runtime/composables/app/utils/effects/useLandingEffect.ts`
