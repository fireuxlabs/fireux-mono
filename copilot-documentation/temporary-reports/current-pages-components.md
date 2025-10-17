---
title: Current Pages Component Survey
status: working
created: 2025-10-16
---

# Current Pages Component Survey

Simple snapshot of the reusable pieces powering the "current" index pages, with source excerpts for quick styling references.

---

## Keystone: `OrganismsProfileRoot`

Provides the shared scaffold for every profile-type current page (Group A). It:

- Exposes `current-assets` and `item` slots so pages can render the active profile and list entries.
- Handles CTA messaging and the `Ensure` button when a profile is missing.
- Manages local vs global Firestore collections and fetch helpers.

```vue
<!-- packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue -->
<template>
  <div class="space-y-6">
    <slot name="current-assets" :profile="profileRef.profile.value" />
    <div v-if="showCreate">
      <UPageSection>
        <UPageCTA
          :title="
            ctaMessage || `Complete your ${props.config.profileType} profile`
          "
          variant="soft"
        >
          <template #links>
            <slot name="cta-links">
              <UButton
                size="lg"
                color="primary"
                :label="primaryLabel"
                :loading="ensuring"
                :disabled="ensuring"
                @click="onEnsureClick"
              />
            </slot>
          </template>
        </UPageCTA>
      </UPageSection>
    </div>
    <UPageSection>
      <div class="flex items-center gap-2 mb-3">
        <span class="opacity-70 text-sm">Showing: {{ showing }}</span>
        <UButton
          v-if="hasLocal && !hasGlobalLoaded"
          size="xs"
          variant="ghost"
          @click="fetchGlobal"
        >
          Load global
        </UButton>
      </div>
      <div v-if="list.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <template v-for="p in list" :key="p.id || p.uid">
          <slot name="item" :profile="p" />
        </template>
      </div>
      <p v-else class="opacity-70">No profiles yet.</p>
    </UPageSection>
  </div>
</template>
```

---

## Group A: Profile-Type Current Pages

All four pages follow the same pattern: `UPage` → `UContainer` → `OrganismsProfileRoot` with slots populated by profile cards.

| Page                                                                        | Highlights                                                                                                                                         |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue`         | Slots: `OrganismsProfilesChefCardsPill` for the current profile, `OrganismsProfilesChefCardsCell` for the list. Uses `useChefCreate()` for ensure. |
| `packages/tenants/fireux-misebox/src/runtime/pages/suppliers/index.vue`     | Reuses Supplier pill/cell cards plus `useSupplierCreate()`.                                                                                        |
| `packages/extensions/fireux-jobs/src/runtime/pages/employers/index.vue`     | Employer pill/cell cards with `useEmployerCreate()`.                                                                                               |
| `packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue` | Professional pill/cell cards with `useProfessionalCreate()`.                                                                                       |

### Sample Page Structure (suppliers)

```vue
<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot
        :config="supplierConfig"
        :onEnsure="onEnsureSupplier"
      >
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <OrganismsProfilesSupplierCardsPill
              :supplier="profile"
              class="mb-3"
            />
            <OrganismsProfilesSupplierCardsCell :supplier="profile" />
          </template>
        </template>
        <template #item="{ profile }">
          <OrganismsProfilesSupplierCardsCell :supplier="profile" />
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>
```

### Card Components

Each profile type ships paired components for the current pill and list cell. Example (Supplier):

```vue
<!-- Pill.vue -->
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar :src="supplier.avatar" :alt="supplier.display_name" size="sm" />
      <div class="profile-info">
        <h4 class="profile-name">{{ supplier.display_name }}</h4>
        <p v-if="supplier.title" class="profile-title">{{ supplier.title }}</p>
      </div>
    </div>
  </UCard>
</template>

<!-- Cell.vue -->
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar :src="supplier.avatar" :alt="supplier.display_name" size="md" />
      <div class="profile-info">
        <h4 class="profile-name">{{ supplier.display_name }}</h4>
        <p v-if="supplier.title" class="profile-subtitle">
          {{ supplier.title }}
        </p>
      </div>
    </div>
    <p v-if="supplier.bio_short" class="profile-bio">
      {{ supplier.bio_short }}
    </p>
    <div v-if="supplier.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in supplier.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="supplier.specialties.length > 3" class="tag-more"
        >+{{ supplier.specialties.length - 3 }} more</span
      >
    </div>
  </UCard>
</template>
```

Equivalent pill/cell components exist for Chef, Employer, and Professional profiles with matching APIs.

---

## Group B: System-Level Current Pages

Do not rely on `OrganismsProfileRoot`, but still expose current context.

- `packages/core/fireux-core/src/runtime/pages/users/index.vue` mixes `UPage`, `UCard`, and bespoke user card components (`OrganismsUserCards*`).
- `packages/core/fireux-core/src/runtime/pages/apps/index.vue` uses Nuxt UI primitives (`UPageHeader`, `UPageCard`, `UBadge`, `USkeleton`) and custom display helpers for app metadata.

Refer to `current-pages-code.md` for full source when styling these.

---

### Takeaways

- Start styling work with `OrganismsProfileRoot` and the card components; changes there flow through every profile-type page.
- Creation hooks (`use*Create`) stay out of styling scope—focus on card layout and CTA presentation.
- When ready to unify Group B with Group A, consider extracting a shared `CurrentEntityBlock` that wraps the pill/cell pattern around non-profile entities.
