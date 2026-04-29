<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Identity</div>
      </div>
    </template>

    <p class="console-card-header__description">
      {{ hello || 'No value set' }}
    </p>
  </UCard>

  <DevFireuxDebugPanel
    v-if="isDev"
    title="Supplier identity"
    scope="console"
    :data="debug"
  />
</template>

<script setup lang="ts">
import { useSupplierConsoleIdentity } from '../../../../../composables/fireux/app/supplier-console/useSupplierConsoleIdentity'

const { hello, debug } = useSupplierConsoleIdentity()
const isDev = import.meta.dev
</script>
