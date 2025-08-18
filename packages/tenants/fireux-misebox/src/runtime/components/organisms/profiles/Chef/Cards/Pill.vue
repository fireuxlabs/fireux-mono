<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="(chef as any)?.avatarUrl"
        :alt="chef?.chef_name || 'Chef'"
        size="sm"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.specialties?.length" class="profile-title">
          {{ chef.specialties[0] }}
        </p>
      </div>
    </div>

    <!-- JSON Debug Display -->
    <div class="chef-debug">
      <details>
        <summary>Full Chef Object (JSON)</summary>
        <pre
          style="
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
            overflow-x: auto;
          "
          >{{ JSON.stringify(chef, null, 2) }}</pre
        >
      </details>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Chef } from '../../../../../models/profiles/Chef.model'

defineProps<{
  chef?: Partial<Chef>
}>()
</script>
