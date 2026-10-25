<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Install app</h2>
      </template>
      <p v-if="installed" class="text-sm text-muted">
        This window is running as an installed app.
      </p>
      <UButton
        v-else-if="canInstall"
        label="Install app"
        :disabled="busy"
        @click="install"
      />
      <p v-else class="text-sm text-muted">{{ installHint }}</p>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Offline support</h2>
      </template>
      <div class="space-y-4">
        <p class="text-sm text-muted">
          Shows a reconnect page when a page cannot load. Live data and actions
          need a connection.
        </p>
        <p v-if="!supported" class="text-sm text-muted">
          Offline support is unavailable in this browser.
        </p>
        <p v-else-if="offlineEnabled" class="text-sm" role="status">
          {{
            offlineReady ? 'Reconnect page ready.' : 'Preparing reconnect page…'
          }}
        </p>
        <UButton
          v-if="offlineEnabled"
          label="Disable offline support"
          color="neutral"
          variant="outline"
          :loading="busy"
          :disabled="busy"
          @click="disableOffline"
        />
        <UButton
          v-else-if="supported"
          label="Enable offline support"
          :loading="busy"
          :disabled="busy || !online"
          @click="enableOffline"
        />
        <p v-if="!online" class="text-sm text-muted">
          You are offline. Reconnect to enable support or check for updates.
        </p>
      </div>
    </UCard>

    <UCard v-if="offlineEnabled">
      <template #header>
        <h2 class="text-lg font-semibold">Updates</h2>
      </template>
      <div class="space-y-4">
        <p v-if="updateAvailable" class="text-sm" role="status">
          An update is ready. Reload to apply it.
        </p>
        <div class="flex flex-wrap gap-3">
          <UButton
            v-if="updateAvailable"
            label="Update and reload"
            :disabled="busy"
            @click="applyUpdate"
          />
          <UButton
            v-if="updateAvailable"
            label="Later"
            color="neutral"
            variant="ghost"
            :disabled="busy"
            @click="dismissUpdate"
          />
          <UButton
            label="Check for updates"
            color="neutral"
            variant="outline"
            :loading="busy"
            :disabled="busy || !online"
            @click="checkForUpdate"
          />
        </div>
      </div>
    </UCard>

    <div v-if="error" class="space-y-2" role="alert">
      <p class="break-words text-sm text-error">{{ error }}</p>
      <FireCopyError :message="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePwa } from '../../composables/pwa/usePwa'

const {
  supported,
  online,
  installed,
  canInstall,
  offlineEnabled,
  offlineReady,
  busy,
  updateAvailable,
  error,
  installHint,
  enableOffline,
  disableOffline,
  install,
  checkForUpdate,
  applyUpdate,
  dismissUpdate,
} = usePwa()
</script>
