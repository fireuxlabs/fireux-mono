# Unified User CTA — Assessment and Proposal

Effective: 2025-09-18
Scope: fireux-core (runtime components + composables)

## Current state (Core vs App)

We currently ship two separate CTA components under `runtime/components/organisms/User/`:

- Core CTAs
  - `Core/CTA.vue`: prompts global (king) users to complete their core profile
  - Usage contexts: core-users pages and profile creation flows
  - Inputs: derived from `useCoreUser()` and `useCoreUserComputed()`

- App CTAs
  - `App/CTA.vue`: prompts tenant users to complete their app profile (app-local overlays)
  - Usage contexts: app-users pages and onboarding flows
  - Inputs: derived from `useAppUser()` and `useAppUserComputed()`

Operationally, pages and organisms decide which CTA to render by branching on the current environment (role `global | tenant`), duplicating the same UX intent ("please complete your profile") in two place-specific components.

### Issues with the split

- Duplication: two components with near-identical copy and layout
- Divergence risk: small changes get applied to one CTA and forgotten in the other
- Wiring overhead: calling code needs to import and conditionally render the right CTA
- Harder privacy guarantees: both pathways must be audited to avoid email leaks

## Target: Unified CTA

Introduce a single, environment-aware CTA:

- Location: `runtime/components/organisms/User/Unified/CTA.vue` (added)
- Inputs: minimal unified user shape (id, display_name, avatar) from `useUser()`
- Environment: read via `useFireUXConfig().role` (or via the higher-level `useApp()` if preferred)
- Behavior:
  - If role = `global` and no core profile: prompt to complete core profile
  - If role = `tenant` and no app overlay/profile: prompt to complete app profile
  - If both satisfied: render nothing or a subtle "profile complete" acknowledgement
- Privacy: never show or derive from email; rely on `display_name`, `handle`, and safe initials

This single CTA eliminates branching in consumers; pages can always render the unified CTA.

## How to detect completion (signals)

- Minimal rule of thumb (low-risk, consistent):
  - Consider the profile incomplete when `display_name` is missing or looks like an email
  - Consider avatar optional; we can encourage but not require it
- Tenant-specific extras (optional): app profile list length > 0 (or a specific profile key)

These checks can be abstracted so the CTA logic stays declarative.

## API additions (useUserComputed)

Augment `useUserComputed` to export CTA-related derived flags so the CTA can be fully dumb (pure presentational):

- `hasDisplayName: Ref<boolean>` — true when `user.value?.display_name` is non-empty and not email-like
- `isTenant: Ref<boolean>` — from `useFireUXConfig().role === 'tenant'`
- `needsProfile: Ref<boolean>` — true if the relevant (core/app) profile is incomplete for the current environment

Sketch:

```ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../FireUXConfig'

function looksLikeEmail(v?: string) {
  return !!v && v.includes('@')
}

export function useUserComputed(
  user: Ref<
    | {
        display_name?: string
        app_profiles?: string[]
        global_profiles?: string[]
      }
    | null
    | undefined
  >
) {
  const { role } = useFireUXConfig()
  const isTenant = computed(() => (role || '').toLowerCase() === 'tenant')

  const hasDisplayName = computed(() => {
    const v = user.value?.display_name?.trim()
    return !!v && !looksLikeEmail(v)
  })

  const needsProfile = computed(() => {
    if (!hasDisplayName.value) return true
    if (isTenant.value) {
      // Optionally enforce at least one app profile entry
      return !(user.value?.app_profiles?.length > 0)
    } else {
      // Optionally enforce at least one global profile entry
      return !(user.value?.global_profiles?.length > 0)
    }
  })

  const initials = computed(() => initialsFrom(user.value?.display_name))

  return { initials, hasDisplayName, needsProfile, isTenant }
}
```

This keeps CTA logic trivial:

```vue
<template>
  <UCard v-if="needsProfile">
    <div class="cta">
      <div>
        <h3>Complete your profile</h3>
        <p v-if="isTenant">Add your app display name and details.</p>
        <p v-else>Set your global display name and details.</p>
      </div>
      <div>
        <UButton to="/dashboard/profile" variant="solid">Open profile</UButton>
      </div>
    </div>
  </UCard>
</template>
```

## Migration plan

1. Keep legacy CTAs (`Core/CTA.vue`, `App/CTA.vue`) in place for now.
2. Add `Unified/CTA.vue` (done) and wire a representative page to use it.
3. Expand `useUserComputed` with `hasDisplayName`, `needsProfile`, `isTenant` as above.
4. Gradually replace Core/App CTA usages with Unified CTA across pages.
5. Remove legacy CTAs once all usages are migrated.

## Acceptance

- Single CTA works in both global and tenant contexts without consumer branching
- No email exposure in copy or computed values
- Additive change; no breaking changes until legacy CTAs are removed
- Minimal checks (display_name) are centralized and testable via `useUserComputed`
