<template>
  <div class="pagebody">
    <AppEditSectionsAbout :app="app" />
    <AppEditSectionsSocial :app="app" />
    <FireContextRecord
      :key="app.id"
      title="App AI context"
      endpoint="/api/internal/app/context"
      :scope="{ appId: app.id }"
    />
    <AppUserAdministration :app-id="app.id" />
  </div>
</template>
<script setup lang="ts">
import type { App } from '../../models/app.model'
defineProps<{ app: App }>()
</script>
