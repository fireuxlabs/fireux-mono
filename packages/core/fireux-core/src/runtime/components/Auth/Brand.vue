<template>
  <div aria-label="Brand wordmark">
    <AppBrandWordmark
      v-if="config.isTenant"
      size="medium"
      light-src="/img/ecosystem/wordmark-light.svg"
      dark-src="/img/ecosystem/wordmark-dark.svg"
      :alt="`${config.ecosystem} ecosystem`"
    />
    <AppBrandWordmark v-else size="large" :alt="config.appName" />
  </div>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
const config = useFireUXConfig()
</script>
