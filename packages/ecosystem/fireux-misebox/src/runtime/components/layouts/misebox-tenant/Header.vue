<template>
  <div v-if="!chromeHidden">
    <UHeader
      :title="appName"
      to="/"
      :toggle="false"
      :ui="tenantHeaderUi"
      class="misebox-tenant-header"
    >
      <template #title>
        <AppBrandWordmark
          size="hero"
          alt="Tenant wordmark"
        />
      </template>
    </UHeader>
  </div>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useMiseboxTenantChrome } from '../../../composables/fireux/app/useMiseboxTenantChrome'

const { appName } = useFireUXConfig()
const { chromeHidden } = useMiseboxTenantChrome()

const tenantHeaderUi = {
  container: 'misebox-tenant-header__container',
  left: 'misebox-tenant-header__brand',
  center: 'misebox-tenant-header__hidden',
  right: 'misebox-tenant-header__hidden',
  title: 'misebox-tenant-header__title',
} as const
</script>

<style scoped>
:global(.misebox-tenant-header) {
  position: absolute;
  inset-inline: 0;
  top: 0;
  z-index: 10;
  height: auto;
  border-bottom: 0;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--brand-accent) 50%, transparent),
    transparent
  );
  backdrop-filter: none;
}

:global(.misebox-tenant-header__container) {
  height: auto;
  justify-content: center;
  padding-block: 1.5rem;
}

:global(.misebox-tenant-header__brand) {
  flex: 0 0 auto;
}

:global(.misebox-tenant-header__hidden) {
  display: none;
}

:global(.misebox-tenant-header__title) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(.misebox-tenant-header__title .fx-brand-wordmark) {
  height: clamp(5rem, 10vw, 9rem);
  max-width: min(34rem, 86vw);
}
</style>
