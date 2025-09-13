# Core User and App User — Current State (Pre‑Improvement)

Effective: 2025-09-13
Owner: FireUX Core

Purpose: Give an accurate snapshot of how CoreUser and AppUser creation, avatar handling, and profile editing work today across the mono‑repo. This is documentation of the current baseline before proposing improvements.

## TL;DR

- CoreUser is created at auth and now always has a non‑empty `avatar` string (photoURL → upload default to Storage → static fallback path).
- AppUser creation is tenant‑scoped and avoids writing `avatar: undefined`.
- Profile editing spaces exist in tenants (notably MiseBox) and in a core dashboard page, but coverage is uneven and models vary by tenant/extension.
- Media pipeline is unified behind `useMediaStorage` with safe defaults and CORS‑aware behavior.

---

## Data models and locations

- CoreUser (global): `firestore: core-users/{uid}`
  - Key fields: `email`, `display_name`, `avatar`, `created_at`, `updated_at`.
  - Avatar path strategy: `core-users/{uid}/avatar.jpg` (in Firebase Storage) or static fallback `/img/default-avatar.png`.

- AppUser (tenant): `firestore: apps/{appId}/users/{uid}`
  - Key fields vary by tenant/extension; common fields: `email`, `display_name`, optionally `profiles`, `slug`, `subscription` (when extensions use it).
  - Avatar: included only when defined; may point to core avatar URL or app‑scoped copy at `apps/{appId}/users/{uid}/avatar.jpg`.

Models are defined in core and extended in tenants/extensions. Type coverage varies; several composables refer to fields like `subscription`, `profiles`, or `slug` that are present only for some apps/extensions.

---

## Creation and ensure flows

- CoreUser ensure (`useCoreUserEnsure.ts`):
  - If an existing `avatar` exists, it is kept.
  - Else, tries `auth.photoURL`.
  - Else, uploads the default asset to Storage via `uploadCoreAvatar('/img/default-avatar.png', uid)` (path: `core-users/{uid}/avatar.jpg`) and uses the returned public URL.
  - If upload fails, uses static `/img/default-avatar.png`.
  - Guarantees CoreUser `avatar` is non‑empty.

- AppUser ensure (`useAppUserEnsure.ts`):
  - Creates or updates user under `apps/{appId}/users/{uid}`.
  - Spreads `avatar` only when a URL is present to avoid Firestore invalid‑argument errors.
  - May copy or reference the CoreUser avatar.

---

## Media and avatar pipeline

- Unified composable: `useMediaStorage.ts`
  - `uploadImage(source, collection, id, type, opts)` — generic uploader with smart sizing defaults.
  - `uploadUserAvatar(source, uid, opts)` — legacy alias for app‑scoped avatar.
  - `uploadAppUserAvatar(source, uid, opts)` — explicit app‑scoped avatar uploader.
  - `uploadCoreAvatar(source, uid, opts)` — uploads to `core-users/{uid}/avatar.jpg` (no tenant prefix).
  - `getPublicUrl(path)` — resolves a Firebase Storage public URL.
  - Defaults: `DEFAULT_AVATAR_URL = '/img/default-avatar.png'` and `getDefaultAvatarUrl()`.
  - CORS‑aware: if `source` is already a Firebase Storage URL and remote fetch isn’t explicitly allowed, returns the URL as‑is instead of trying to re‑upload client‑side.

- Consumers:
  - CoreUser ensure now uses `uploadCoreAvatar` when needed.
  - AppUser or profile feature areas call the app‑scoped avatar helpers.

---

## Profile editing spaces (current)

- Core dashboard page: `packages/core/fireux-core/src/runtime/pages/dashboard/profile.vue`
  - Contains scaffolding for a profile edit form; styled by `organisms/profiles.scss` stubs.

- MiseBox tenant:
  - Chef profile:
    - View page: `packages/tenants/fireux-misebox/src/runtime/pages/chefs/[id].vue` (with an edit button when viewing own profile).
    - Dashboard editor: `packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue`.
    - Components: `components/organisms/profiles/Chef/*` include Edit, CTA, Cards, etc.
  - Supplier profile:
    - View page: `packages/tenants/fireux-misebox/src/runtime/pages/suppliers/[id].vue` (with edit button logic similar to chefs).
    - Components: `components/organisms/profiles/Supplier/*` include Edit and Profile UIs.

- Extensions (Jobs):
  - Employer/professional profile pages and a dashboard editor, under `packages/extensions/fireux-jobs/src/runtime/pages/*` with model configs in `models/profiles/*`.

Observations:

- Apps have “edit profile” routes/pages for their specific profile types (e.g., Chef, Supplier, Employer, Professional).
- A generic, shared edit UI exists in core but is currently a scaffold; tenants primarily own the rich edit experiences.

---

## Components inventory: User (core)

Path: `packages/core/fireux-core/src/runtime/components/organisms/User`

- Core/
  - `CTA.vue` — call-to-action for core user context.
  - Cards/
    - `Cell.vue` — compact core user cell card.
    - `Pill.vue` — pill display for core user.
    - `Profile.vue` — profile card for core user.
  - Create/
    - `System.vue` — system flow for creating a core user (ensure/cta wiring).
  - `Edit.vue` — core user edit surface (scaffold-level UI).
  - `Profile.vue` — core user profile view.

- App/
  - `Cell.vue` — compact app user cell.
  - `List.vue` — listing of app users.
  - `Edit.vue` — app user edit surface (scaffold-level UI).
  - Cards/
    - `Cell.vue` — compact app user card cell.
    - `Pill.vue` — pill display for app user.
    - `Profile.vue` — app user profile card.
  - Extras/
    - `AccountEmail.vue` — change email flow.
    - `AccountPassword.vue` — update password flow.
    - `Follows.vue` — follow/following list.
    - `Notifications.vue` — user notifications settings.
    - `Summary.vue` — account summary panel.

Notes:

- These components provide the building blocks for both the core dashboard and tenant pages. Core `Edit.vue` is intentionally minimal; tenants commonly compose richer editors around the profile models.

---

## Gaps and inconsistencies (not fixing yet)

- Type definitions vs usage:
  - Several composables reference fields like `subscription`, `profiles`, and `slug` on `AppUser` that aren’t always in the shared type, causing typecheck failures when checked across all packages.
  - Resolution paths vary by tenant/extension; some imports reference built dist or deep relative paths.

- Default avatar usage in UIs:
  - Some components use `/default-avatar.png` instead of `/img/default-avatar.png`.
  - Not all code paths use `getDefaultAvatarUrl()` yet.

- Core profile editor:
  - Exists but minimal. Apps rely on their own pages.

---

## What this means right now

- We have safe creation paths for CoreUser and AppUser avatars and a single uploader API.
- Tenants already include profile editing spaces; the core dashboard also has a stubbed edit page.
- Before improvements, we should unify the AppUser type surface used by shared composables, or narrow their usage to the tenants/extensions that own those fields, to clear typecheck errors.

## Light proposals (deferred changes)

- Introduce a `PartialAppUserExtras` type (subscription, profiles, slug) and gate composables by tenant feature flags, or refine imports so extension‑specific logic stays within the extension package.
- Replace hardcoded default avatar strings with `getDefaultAvatarUrl()` in UI components.
- Promote the core dashboard profile edit experience to a minimal, reusable editor that tenants can extend.

## Appendix: Full source of User components

This appendix embeds the current contents of core User components for accurate reference.

### App/Cell.vue

```vue
<template>
  <div class="user-cell">
    <div class="user-avatar">
      <img v-if="user.avatar" :src="user.avatar" :alt="user.display_name" />
      <div v-else class="avatar-placeholder">
        {{ user.display_name?.charAt(0) || user.email?.charAt(0) }}
      </div>
    </div>
    <div class="user-info">
      <h3 class="user-name">{{ user.display_name || user.email }}</h3>
      <p class="user-email">{{ user.email }}</p>
      <span v-if="user.role" class="user-role">{{ user.role }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  background: var(--ui-bg);
}

.user-avatar img,
.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ui-primary);
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.user-email {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}

.user-role {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: var(--ui-primary);
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  text-transform: capitalize;
}
</style>
```

### App/Edit.vue

```vue
<template>
  <client-only>
    <div v-if="app" class="app-edit-component">
      <!-- App Information Section -->
      <UCard>
        <div class="card-content">
          <div class="app-info-header">
            <h3 class="app-name">{{ app.app_name }}</h3>
            <p class="app-id">App ID: {{ app.id }}</p>
          </div>

          <FireMoleculesFormsFirestoreField
            label="Description"
            :firebase-value="app.description || ''"
            placeholder="Describe your application..."
            :update-function="updateDescription"
            type="textarea"
            :rows="3"
            :maxlength="500"
          />
        </div>
      </UCard>

      <!-- Social Links Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreSocialLinks
            :firebase-value="app.social_links || {}"
            :update-function="updateSocialLinks"
          />
        </div>
      </UCard>

      <!-- Admin Management Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreArrayOfStrings
            label="Admin Users"
            :firebase-value="app.admin_ids || []"
            placeholder="Enter user ID or email"
            :update-function="updateAdmins"
          />
        </div>
      </UCard>

      <!-- App Metadata Section -->
      <UCard>
        <div class="card-content">
          <div class="app-metadata">
            <div class="metadata-item">
              <span class="metadata-label">Created:</span>
              <span class="metadata-value">{{
                formatDate(app.created_at)
              }}</span>
            </div>
            <div class="metadata-item" v-if="app.project">
              <span class="metadata-label">Project:</span>
              <span class="metadata-value">{{ app.project }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Admins:</span>
              <span class="metadata-value"
                >{{ app.admin_ids?.length || 0 }} user(s)</span
              >
            </div>
          </div>
        </div>
      </UCard>
    </div>
    <div v-else>
      <UCard>
        <div class="app-loading-content">
          <UIcon name="i-heroicons-cog-6-tooth" class="app-loading-icon" />
          <p>Loading app settings...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup>
const { app, updateDescription, updateSocialLinks, updateAdmins } = useApp()

// Helper function to format dates
const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown'

  try {
    let date
    if (typeof dateValue === 'string') {
      date = new Date(dateValue)
    } else if (dateValue && typeof dateValue === 'object') {
      // Handle Firebase Timestamp objects
      if ('seconds' in dateValue && 'nanoseconds' in dateValue) {
        // Convert Firebase Timestamp to JavaScript Date
        date = new Date(
          dateValue.seconds * 1000 + dateValue.nanoseconds / 1000000
        )
      } else if (dateValue.toDate) {
        // Handle Firestore Timestamp with toDate method
        date = dateValue.toDate()
      } else {
        date = dateValue
      }
    } else {
      date = dateValue
    }

    // Check if date is valid
    if (!date || isNaN(date.getTime())) return 'Invalid date'

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}
</script>

<style scoped>
/* App Edit Component - Using FireUX Design System */
.app-edit-component {
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .app-edit-component {
    gap: var(--space-6);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .card-content {
    gap: var(--space-6);
  }
}

.app-info-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: var(--space-4);
}

.app-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.app-id {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
  margin: 0;
}

.app-metadata {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .app-metadata {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

@media (min-width: 640px) {
  .metadata-item {
    flex-direction: row;
    align-items: center;
    gap: var(--space-2);
  }
}

.metadata-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .metadata-label {
    min-width: 80px;
  }
}

.metadata-value {
  font-size: 0.875rem;
  color: #6b7280;
}

.app-loading-content {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}

@media (min-width: 640px) {
  .app-loading-content {
    padding: var(--space-12) var(--space-4);
  }
}

.app-loading-icon {
  width: var(--space-10);
  height: var(--space-10);
  color: #d1d5db;
  margin: 0 auto var(--space-4) auto;
  display: block;
}

@media (min-width: 640px) {
  .app-loading-icon {
    width: var(--space-12);
    height: var(--space-12);
  }
}
</style>
```

### App/List.vue

```vue
<template>
  <div v-if="loading" class="text-center py-8">
    <p>Loading users...</p>
  </div>

  <div
    v-else-if="users?.length"
    class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <FireOrganismsUserCell v-for="user in users" :key="user.uid" :user="user" />
  </div>

  <div v-else class="text-center py-8">
    <p class="text-gray-600">No users found.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
```

### App/Cards/Cell.vue

```vue
<template>
  <div class="cell">
    <UAvatar :src="avatarUrl" size="lg" />
    <div class="info">
      <strong class="name">{{ displayName }}</strong>
      <span class="handle">@{{ props.user.handle }}</span>
      <UBadge
        v-if="props.user?.isAdmin || props.user?.role === 'admin'"
        variant="subtle"
        class="badge"
        >Admin</UBadge
      >
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
})

// Computed property for display name with full_name priority logic
const displayName = computed(() => {
  if (!props.user) return 'Unknown User'

  // Priority: full_name -> display_name -> displayName -> email (without @domain)
  if (props.user.full_name) {
    return props.user.full_name
  }
  if (
    props.user.display_name &&
    props.user.display_name !== props.user?.email
  ) {
    return props.user.display_name
  }
  if (props.user.displayName && props.user.displayName !== props.user?.email) {
    return props.user.displayName
  }
  if (props.user.email) {
    return props.user.email.split('@')[0] // Just username part
  }
  return 'Unknown User'
})

// Use avatar URL directly (simplified for now)
const avatarUrl = computed(() => props.user?.avatar || '')
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 1rem;
}

.handle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
```

### App/Cards/Pill.vue

```vue
<template>
  <UCard>
    <div>
      <UAvatar
        :src="appUser?.avatar"
        :alt="appUser?.display_name || 'App User'"
        size="sm"
      />
      <div>
        <h5>{{ appUser?.display_name || appUser?.email || 'App User' }}</h5>
        <p v-if="appUser?.role">{{ appUser.role }}</p>
      </div>
    </div>

    <div v-if="appUser?.isAdmin">
      <UBadge color="red">Admin</UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppUser } from '../../../../../models/app/appUser.model'

defineProps<{
  appUser?: Partial<AppUser>
}>()
</script>
```

### App/Cards/Profile.vue

```vue
<template>
  <UCard>
    <div class="flex items-center gap-4 mb-6">
      <UAvatar
        :src="user?.avatar"
        :alt="userName"
        size="xl"
        :text="getInitials(userName)"
      />
      <div>
        <h2 class="text-xl font-semibold">
          {{ userName }}
        </h2>
        <p v-if="user?.email" class="text-gray-600 text-sm">
          {{ user.email }}
        </p>
      </div>
    </div>

    <div
      v-if="user?.display_name && user?.display_name !== userName"
      class="mb-4"
    >
      <h3 class="font-medium mb-2">Display Name</h3>
      <p class="text-gray-700">{{ user.display_name }}</p>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

// Computed property for user display name with priority logic
const userName = computed(() => {
  if (!props.user) return 'User'
  return (
    props.user.full_name ||
    props.user.display_name ||
    props.user.email ||
    'User'
  )
})

// Computed property for formatted join date
const formattedJoinDate = computed(() => {
  if (!props.user?.created_at) return null

  let date
  try {
    date =
      typeof props.user.created_at === 'string'
        ? new Date(props.user.created_at)
        : props.user.created_at

    // Check if date is valid
    if (!date || isNaN(date.getTime())) return null

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  } catch (error) {
    console.warn(
      'Invalid date format for user created_at:',
      props.user.created_at
    )
    return null
  }
})

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 1rem;
}

.handle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
```

### App/Extras/AccountEmail.vue

```vue
<template>
  <client-only>
    <UContainer v-if="appUser" class="profile-edit-component">
      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="profile-section-title">Account Email</h3>
        <UButton
          :icon="
            isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          variant="ghost"
          size="sm"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Hide' : 'Edit' }}
        </UButton>
      </div>

      <!-- Account Email Section -->
      <div v-show="isExpanded" class="profile-info-section">
        <div class="profile-fields-container">
          <div class="mb-4">
            <p class="profile-section-description">
              Your account email is used for authentication and important
              notifications.
            </p>
          </div>

          <!-- Current Email Display -->
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Current Email</label
            >
            <p class="text-gray-900">{{ appUser.email }}</p>
          </div>

          <!-- Email Change Form -->
          <FireMoleculesFormsFirestoreSingleField
            label="New Email Address"
            :firebase-value="''"
            placeholder="Enter new email address"
            :update-function="
              (newValue) => saveField('Email', 'email', newValue)
            "
            input-type="email"
          />

          <div
            class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="text-yellow-600 mt-0.5 mr-2"
              />
              <div class="text-sm text-yellow-800">
                <p class="font-medium">Important:</p>
                <p>
                  Changing your email will require email verification and may
                  affect your ability to sign in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
    <div v-else>
      <FireMoleculesLoading message="Loading account information..." />
    </div>
  </client-only>
</template>

<script setup>
import { useEditHandler } from '../../../../composables/utils/useEditHandler'

const { appUser, updateAppProfile } = useAppUser()
const { saveField } = useEditHandler(updateAppProfile)

// Toggle state for edit mode
const isExpanded = ref(false)
</script>

<style scoped>
/* Uses shared profile styles from main.css */
</style>
```

### App/Extras/AccountPassword.vue

```vue
<template>
  <client-only>
    <UContainer v-if="appUser" class="profile-edit-component">
      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="profile-section-title">Account Password</h3>
        <UButton
          :icon="
            isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          variant="ghost"
          size="sm"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Hide' : 'Edit' }}
        </UButton>
      </div>

      <!-- Account Password Section -->
      <div v-show="isExpanded" class="profile-info-section">
        <div class="profile-fields-container">
          <div class="mb-4">
            <p class="profile-section-description">
              Update your account password to keep your account secure.
            </p>
          </div>

          <!-- Password Change Form -->
          <UFormGroup label="Current Password" class="form-group">
            <UInput
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="Enter your current password"
              :disabled="updating"
            />
          </UFormGroup>

          <UFormGroup label="New Password" class="form-group">
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password"
              :disabled="updating"
            />
          </UFormGroup>

          <UFormGroup label="Confirm New Password" class="form-group">
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
              :disabled="updating"
            />
          </UFormGroup>

          <!-- Action Button -->
          <div class="flex justify-start mt-6">
            <UButton
              :loading="updating"
              :disabled="!isPasswordFormValid"
              @click="updatePassword"
              color="primary"
            >
              Update Password
            </UButton>
          </div>

          <!-- Security Notice -->
          <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-shield-check"
                class="text-blue-600 mt-0.5 mr-2"
              />
              <div class="text-sm text-blue-800">
                <p class="font-medium">Password Requirements:</p>
                <ul class="mt-1 list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
    <div v-else>
      <FireMoleculesLoading message="Loading account information..." />
    </div>
  </client-only>
</template>

<script setup>
const { appUser } = await useAppUser()

// Toggle state for edit mode
const isExpanded = ref(false)
const updating = ref(false)

// Password form state
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Form validation
const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.currentPassword.length >= 1 &&
    passwordForm.value.newPassword.length >= 8 &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  )
})

// Update password function
async function updatePassword() {
  if (!isPasswordFormValid.value) return

  updating.value = true
  try {
    // TODO: Implement password update logic with Firebase Auth
    console.log('Password update requested')

    // Reset form on success
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    // Close the form
    isExpanded.value = false
  } catch (error) {
    console.error('Failed to update password:', error)
  } finally {
    updating.value = false
  }
}
</script>

<style scoped>
/* Uses shared profile styles from main.css */
.form-group {
  margin-bottom: 1rem;
}
</style>
```

### App/Extras/Follows.vue

```vue
<template>
  <div class="follows-component">
    <div class="follows-header">
      <h3 class="profile-section-title">Connections</h3>
      <p class="profile-section-description">
        Your professional network and connections
      </p>
    </div>

    <div class="follows-content">
      <!-- Followers Section -->
      <div class="follow-section">
        <div class="follow-section-header">
          <h4 class="follow-section-title">
            <UIcon name="i-heroicons-users" class="inline mr-2" />
            Followers
          </h4>
          <span class="follow-count">{{ followerCount }}</span>
        </div>
        <div v-if="followers?.length" class="follow-list">
          <div
            v-for="follower in followers.slice(0, 5)"
            :key="follower.id"
            class="follow-item"
          >
            <UAvatar
              :src="follower.avatar"
              :alt="follower.full_name || follower.display_name"
              size="sm"
            />
            <span class="follow-name">{{
              follower.full_name || follower.display_name
            }}</span>
          </div>
          <div v-if="followers.length > 5" class="follow-more">
            +{{ followers.length - 5 }} more
          </div>
        </div>
        <div v-else class="follow-empty">
          <p>No followers yet</p>
        </div>
      </div>

      <!-- Following Section -->
      <div class="follow-section">
        <div class="follow-section-header">
          <h4 class="follow-section-title">
            <UIcon name="i-heroicons-user-plus" class="inline mr-2" />
            Following
          </h4>
          <span class="follow-count">{{ followingCount }}</span>
        </div>
        <div v-if="following?.length" class="follow-list">
          <div
            v-for="followedUser in following.slice(0, 5)"
            :key="followedUser.id"
            class="follow-item"
          >
            <UAvatar
              :src="followedUser.avatar"
              :alt="followedUser.full_name || followedUser.display_name"
              size="sm"
            />
            <span class="follow-name">{{
              followedUser.full_name || followedUser.display_name
            }}</span>
          </div>
          <div v-if="following.length > 5" class="follow-more">
            +{{ following.length - 5 }} more
          </div>
        </div>
        <div v-else class="follow-empty">
          <p>Not following anyone yet</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="follow-actions">
        <UButton variant="outline" size="sm"> View All Connections </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

// Mock data - replace with actual follows data
const followers = computed(() => props.user.followers || [])
const following = computed(() => props.user.following || [])

const followerCount = computed(() => followers.value.length)
const followingCount = computed(() => following.value.length)
</script>

<style scoped>
.follows-component {
  padding: var(--space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg);
}

.follows-header {
  margin-bottom: var(--space-4);
}

.follows-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.follow-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.follow-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.follow-section-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.follow-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-500);
  background-color: var(--primary-50);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.follow-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.follow-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.follow-item:hover {
  background-color: var(--ui-bg-elevated);
}

.follow-name {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.follow-more {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  padding: var(--space-1) var(--space-2);
}

.follow-empty {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: center;
  padding: var(--space-3);
}

.follow-actions {
  margin-top: var(--space-2);
  display: flex;
  justify-content: center;
}
</style>
```

### App/Extras/Notifications.vue

```vue
<template>
  <div class="notifications-component">
    <div class="notifications-header">
      <h3 class="profile-section-title">Notifications</h3>
      <p class="profile-section-description">Recent activity and updates</p>
    </div>

    <div class="notifications-content">
      <!-- Notification List -->
      <div v-if="notifications?.length" class="notification-list">
        <div
          v-for="notification in displayedNotifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
        >
          <div class="notification-icon">
            <UIcon
              :name="getNotificationIcon(notification.type)"
              :class="getNotificationIconClass(notification.type)"
            />
          </div>
          <div class="notification-content">
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-meta">
              <span class="notification-time">{{
                formatTime(notification.createdAt)
              }}</span>
              <span v-if="!notification.read" class="notification-badge"
                >New</span
              >
            </div>
          </div>
          <div class="notification-actions">
            <UButton
              v-if="!notification.read"
              variant="ghost"
              size="xs"
              @click="markAsRead(notification.id)"
            >
              Mark Read
            </UButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="notifications-empty">
        <UIcon name="i-heroicons-bell-slash" class="empty-icon" />
        <p class="empty-message">No notifications yet</p>
        <p class="empty-description">
          You'll see updates about your profile, connections, and activities
          here.
        </p>
      </div>

      <!-- Show More Button -->
      <div
        v-if="notifications?.length > displayLimit"
        class="notifications-actions"
      >
        <UButton variant="outline" size="sm" @click="showMore">
          Show {{ notifications.length - displayLimit }} More
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
})

const displayLimit = ref(5)

const displayedNotifications = computed(() => {
  return props.notifications.slice(0, displayLimit.value)
})

function getNotificationIcon(type) {
  const icons = {
    follow: 'i-heroicons-user-plus',
    like: 'i-heroicons-heart',
    comment: 'i-heroicons-chat-bubble-left',
    system: 'i-heroicons-cog-6-tooth',
    job: 'i-heroicons-briefcase',
    default: 'i-heroicons-bell',
  }
  return icons[type] || icons.default
}

function getNotificationIconClass(type) {
  const classes = {
    follow: 'text-blue-500',
    like: 'text-red-500',
    comment: 'text-green-500',
    system: 'text-gray-500',
    job: 'text-purple-500',
    default: 'text-gray-400',
  }
  return classes[type] || classes.default
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function markAsRead(notificationId) {
  // TODO: Implement mark as read functionality
  console.log('Mark notification as read:', notificationId)
}

function showMore() {
  displayLimit.value = props.notifications.length
}
</script>

<style scoped>
.notifications-component {
  padding: var(--space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg);
}

.notifications-header {
  margin-bottom: var(--space-4);
}

.notifications-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--ui-bg-elevated);
}

.notification-item.unread {
  background-color: var(--primary-50);
  border-left: 3px solid var(--primary-500);
}

.notification-icon {
  flex-shrink: 0;
  padding: var(--space-1);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.notification-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.notification-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--primary-600);
  background-color: var(--primary-100);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

.notification-actions {
  flex-shrink: 0;
}

.notifications-empty {
  text-align: center;
  padding: var(--space-8);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.empty-message {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
}

.empty-description {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.notifications-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--space-2);
}
</style>
```

### App/Extras/Summary.vue

```vue
<template>
  <div class="summary-component">
    <div class="summary-header">
      <h3 class="profile-section-title">Profile Summary</h3>
    </div>

    <div class="summary-content">
      <!-- User Stats -->
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-value">{{ joinedDate }}</div>
          <div class="stat-label">Member Since</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ profileCompletion }}%</div>
          <div class="stat-label">Profile Complete</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ connectionCount }}</div>
          <div class="stat-label">Connections</div>
        </div>
      </div>

      <!-- Profile Completion Progress -->
      <div class="completion-section">
        <div class="completion-header">
          <h4 class="completion-title">Profile Completion</h4>
          <span class="completion-percentage">{{ profileCompletion }}%</span>
        </div>
        <div class="completion-bar">
          <div
            class="completion-progress"
            :style="{ width: `${profileCompletion}%` }"
          ></div>
        </div>
        <div class="completion-items">
          <div
            v-for="item in completionItems"
            :key="item.key"
            class="completion-item"
            :class="{ completed: item.completed }"
          >
            <UIcon
              :name="
                item.completed
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-circle'
              "
              :class="item.completed ? 'text-green-500' : 'text-gray-300'"
            />
            <span class="completion-text">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Profile Info -->
      <div class="profile-info">
        <div v-if="displayName" class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">{{ displayName }}</span>
        </div>
        <div v-if="user.email" class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ user.email }}</span>
        </div>
        <div v-if="user.handle" class="info-item">
          <span class="info-label">Handle:</span>
          <span class="info-value">@{{ user.handle }}</span>
        </div>
        <div v-if="user.address?.city" class="info-item">
          <span class="info-label">Location:</span>
          <span class="info-value"
            >{{ user.address.city }}, {{ user.address.state }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

// Computed display name with priority logic
const displayName = computed(() => {
  return props.user.full_name || props.user.display_name || 'User'
})

// Member since date
const joinedDate = computed(() => {
  if (!props.user.created_at && !props.user.createdAt) return 'Unknown'
  const date = new Date(props.user.created_at || props.user.createdAt)
  return date.getFullYear()
})

// Connection count (followers + following)
const connectionCount = computed(() => {
  const followers = props.user.followers?.length || 0
  const following = props.user.following?.length || 0
  return followers + following
})

// Profile completion items
const completionItems = computed(() => [
  {
    key: 'avatar',
    label: 'Profile Picture',
    completed: !!props.user.avatar,
  },
  {
    key: 'full_name',
    label: 'Full Name',
    completed: !!props.user.full_name,
  },
  {
    key: 'display_name',
    label: 'Display Name',
    completed: !!props.user.display_name,
  },
  {
    key: 'handle',
    label: 'Handle',
    completed: !!props.user.handle,
  },
  {
    key: 'address',
    label: 'Location',
    completed: !!(props.user.address?.city && props.user.address?.state),
  },
])

// Profile completion percentage
const profileCompletion = computed(() => {
  const completedItems = completionItems.value.filter(
    (item) => item.completed
  ).length
  const totalItems = completionItems.value.length
  return Math.round((completedItems / totalItems) * 100)
})
</script>

<style scoped>
.summary-component {
  padding: var(--space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg);
}

.summary-header {
  margin-bottom: var(--space-4);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: var(--ui-bg-elevated);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.completion-section {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: var(--ui-bg-elevated);
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.completion-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.completion-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-600);
}

.completion-bar {
  width: 100%;
  height: 8px;
  background-color: var(--ui-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.completion-progress {
  height: 100%;
  background-color: var(--primary-500);
  transition: width 0.3s ease;
}

.completion-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.completion-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.completion-item.completed .completion-text {
  color: var(--text-primary);
}

.completion-item:not(.completed) .completion-text {
  color: var(--text-secondary);
}

.completion-text {
  font-size: 0.8rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.info-item {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
}

.info-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.8rem;
  min-width: 60px;
}

.info-value {
  color: var(--text-primary);
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }

  .completion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .info-item {
    flex-direction: column;
    gap: var(--space-1);
    align-items: flex-start;
  }

  .info-label {
    min-width: auto;
  }
}
</style>
```
