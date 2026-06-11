<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Identity</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="console-card-header__description">
          Root-facing project information for the selected project.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Name:
            <span class="console-summary-value">{{ name || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Description:
            <span class="console-summary-value">{{ description || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Image:
            <span class="console-summary-value">{{ imageUrl || 'Unset' }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <DevFireuxDebugPanel
      title="Project identity"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useProjectConsoleIdentity } from '../../../../composables/fireux/console/project/useProjectConsoleIdentity'

const { name, description, imageUrl, debug } = useProjectConsoleIdentity()
</script>
