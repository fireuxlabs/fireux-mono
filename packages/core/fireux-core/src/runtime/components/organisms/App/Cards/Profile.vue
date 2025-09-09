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
            :color="app?.admin_ids?.length ? 'green' : 'orange'"
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
              color="gray"
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
