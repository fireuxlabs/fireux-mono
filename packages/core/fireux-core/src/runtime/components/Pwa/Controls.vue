<template>
  <div class="pagebody">
    <UCard>
      <template #header>
        <h2>Install app</h2>
      </template>
      <p v-if="installed">This window is running as an installed app.</p>
      <UButton
        v-else-if="canInstall"
        label="Install app"
        :disabled="busy"
        @click="install"
      />
      <p v-else>{{ installHint }}</p>
    </UCard>

    <UCard>
      <template #header>
        <h2>Offline support</h2>
      </template>
      <div class="fx-card-body-stack">
        <p>
          Shows a reconnect page when a page cannot load. Live data and actions
          need a connection.
        </p>
        <p v-if="!supported">Offline support is unavailable in this browser.</p>
        <p v-else-if="offlineEnabled" role="status">
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
        <p v-if="!online">
          You are offline. Reconnect to enable support or check for updates.
        </p>
      </div>
    </UCard>

    <UCard v-if="offlineEnabled">
      <template #header>
        <h2>Updates</h2>
      </template>
      <div class="fx-card-body-stack">
        <p v-if="updateAvailable" role="status">
          An update is ready. Reload to apply it.
        </p>
        <div class="fx-card__actions">
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

    <div v-if="error" class="pagebody" role="alert">
      <p>{{ error }}</p>
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
