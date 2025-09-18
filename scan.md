# FireUX Scan — App Components Only (2025-09-17)

This scan lists only App-level components to keep the focus tight for the next review.

### Organisms/App/Cards

#### Pill.vue

- Path: `packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Pill.vue`

```vue
<template>
  <UCard class="pill">
    <div class="pill-content">
      <UAvatar :src="app?.avatarUrl" :alt="app?.app_name" size="sm" />

      <div class="pill-info">
        <div class="pill-title">
          {{ app?.app_name }}
        </div>
        <UBadge
          v-if="app?.parent"
          icon="i-lucide-building"
          size="md"
          color="primary"
          variant="solid"
        >
          {{ app.parent }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { App } from '../../../../models/core/app.model'

interface Props {
  app: App.Card.Pill
}

defineProps<Props>()
</script>
```

#### Cell.vue

- Path: `packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Cell.vue`

```vue
<template>
  <UCard class="cell">
    <div class="cell-header">
      <div
        class="app-icon"
        :style="{ backgroundColor: app?.theme?.primary || '#3b82f6' }"
      >
        <UIcon :name="getAppIcon(app?.id)" />
      </div>

      <div class="cell-content">
        <div class="cell-title-row">
          <h3 class="cell-title">
            {{ appName }}
          </h3>
          <div class="cell-badges">
            <UBadge v-if="isInitialized" color="green" variant="soft">
              Active
            </UBadge>
            <UBadge v-if="hasAdmins" color="blue" variant="soft">
              {{ adminCount }} Admin{{ adminCount !== 1 ? 's' : '' }}
            </UBadge>
          </div>
        </div>

        <p v-if="app?.description" class="cell-subtitle">
          {{ app.description }}
        </p>

        <div class="cell-meta">
          <span>ID: {{ app?.id || 'Unknown' }}</span>
          <span v-if="app?.created_at">
            Created: {{ formatDate(app.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps(['app'])

// Computed properties matching useApp pattern
const appName = computed(
  () => props.app?.app_name || props.app?.id || 'Unknown App'
)
const isInitialized = computed(() => !!props.app?.admin_ids?.length)
const hasAdmins = computed(() => !!props.app?.admin_ids?.length)
const adminCount = computed(() => props.app?.admin_ids?.length || 0)

function getAppIcon(appId) {
  const iconMap = {
    fireux: 'i-heroicons-fire',
    cleanbox: 'i-heroicons-sparkles',
    misebox: 'i-heroicons-beaker',
    default: 'i-heroicons-cube',
  }
  return iconMap[appId] || iconMap.default
}

function formatDate(date) {
  if (!date) return 'Unknown'
  try {
    return new Date(date.seconds * 1000).toLocaleDateString()
  } catch {
    return 'Unknown'
  }
}
</script>
```

#### Profile.vue

- Path: `packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Profile.vue`

```vue
<template>
  <UCard class="profile">
    <div class="profile-header">
      <UAvatar :src="app?.avatarUrl" :alt="app?.app_name" size="xl" />

      <div class="profile-info">
        <div class="profile-name">
          {{ app?.app_name }}
        </div>
        <UBadge
          v-if="app?.parent"
          icon="i-lucide-building"
          size="lg"
          color="primary"
          variant="solid"
        >
          {{ app.parent }}
        </UBadge>
        <div class="profile-id">ID: {{ app?.id }}</div>
      </div>
    </div>

    <!-- System Information Section -->
    <div class="profile-section">
      <h3 class="section-title">System Information</h3>
      <div class="detail-grid">
        <div class="profile-detail"><strong>App ID:</strong> {{ app?.id }}</div>
        <div class="profile-detail">
          <strong>System Type:</strong>
          {{
            app?.parent
              ? `${app.parent} tenant`
              : app?.is_tenant
                ? 'Tenant'
                : 'Platform'
          }}
        </div>
        <div v-if="app?.created_at" class="profile-detail">
          <strong>Created:</strong> {{ app.created_at }}
        </div>
        <div v-if="app?.creator_id" class="profile-detail">
          <strong>Creator:</strong> {{ app.creator_id }}
        </div>
      </div>
    </div>

    <!-- Administration Section -->
    <div class="profile-section">
      <h3 class="section-title">Administration</h3>
      <div class="detail-grid">
        <div class="profile-detail">
          <strong>Administrators:</strong> {{ app?.admin_ids?.length || 0 }}
        </div>
        <div class="profile-detail">
          <strong>Status:</strong>
          <UBadge
            :color="app?.admin_ids?.length ? 'success' : 'warning'"
            variant="soft"
            size="xs"
          >
            {{ app?.admin_ids?.length ? 'Active' : 'Setup Required' }}
          </UBadge>
        </div>
        <div v-if="app?.admin_ids?.length" class="profile-detail full-width">
          <strong>Admin IDs:</strong>
          <div class="admin-list">
            <UBadge
              v-for="adminId in app.admin_ids"
              :key="adminId"
              color="neutral"
              variant="soft"
              size="xs"
            >
              {{ adminId }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Details Section -->
    <div class="profile-section">
      <h3 class="section-title">Technical Details</h3>
      <div class="detail-grid">
        <div class="profile-detail">
          <strong>Tenant App:</strong>
          {{ app?.is_tenant !== false ? 'Yes' : 'No' }}
        </div>
        <div class="profile-detail">
          <strong>Avatar URL:</strong> {{ app?.avatarUrl ? 'Set' : 'Not set' }}
        </div>
        <div v-if="app?.parent" class="profile-detail">
          <strong>Parent System:</strong> {{ app.parent }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { App } from '../../../../models/core/app.model'

interface Props {
  app: App.Card.Profile | null
}

defineProps<Props>()
</script>
```

## App models (core)

### app.model.ts

- Path: `packages/core/fireux-core/src/runtime/models/core/app.model.ts`

```typescript
// Firestore timestamp type
interface FirestoreTimestamp {
  type: string // "firestore/timestamp/1.0"
  seconds: number
  nanoseconds: number
}

export interface App {
  id: string
  app_name: string
  admin_ids: string[]
  creator_id: string // Required field for the creator
  is_tenant: boolean // Required field - defaults to true for tenant apps
  ecosystem?: string // Business ecosystem (e.g., 'misebox', 'cleanbox')
  created_at?: FirestoreTimestamp | string // Can be Firestore timestamp or string
  avatarUrl?: string
}

/**
 * App namespace for nested interfaces
 */
export namespace App {
  /**
   * Card components for different display sizes
   */
  export namespace Card {
    /**
     * Pill - For compact display components (icon, name, type)
     */
    export interface Pill {
      id: string
      app_name: string
      parent?: string
      avatarUrl?: string
    }

    /**
     * Cell - For medium display with badges and metadata
     */
    export interface Cell {
      id: string
      app_name: string
      admin_ids: string[]
      creator_id: string
      is_tenant: boolean
      parent?: string
      created_at?: FirestoreTimestamp | string
      avatarUrl?: string
    }

    /**
     * Profile - For comprehensive display with all details
     */
    export interface Profile {
      id: string
      app_name: string
      admin_ids: string[]
      creator_id: string
      is_tenant: boolean
      parent?: string
      created_at?: FirestoreTimestamp | string
      avatarUrl?: string
    }
  }
}
```

## Notes

- This scan intentionally excludes User/App components and the AppUser model to focus purely on App-level components.
