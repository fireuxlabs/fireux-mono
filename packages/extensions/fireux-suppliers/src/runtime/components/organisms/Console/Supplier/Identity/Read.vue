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
          Root-facing supplier information for the selected supplier.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Hello:
            <span class="console-summary-value">{{ hello || 'Unset' }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Supplier identity"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupplierConsoleIdentity } from '../../../../../composables/fireux/app/supplier-console/useSupplierConsoleIdentity'

const { hello, debug } = useSupplierConsoleIdentity()
const isDev = import.meta.dev
</script>
