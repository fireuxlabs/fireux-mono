<template>
  <div>
    <UCard>
      <template #header>
        <h1>🏷️ App Chefs Collection</h1>
      </template>
      <p>Total App Chefs: {{ localChefs?.length || 0 }}</p>
      <DevJson
        :data="{ total: localChefs?.length || 0, chefs: localChefs }"
        title="App Chefs JSON"
      />
    </UCard>

    <div style="margin-top: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Chef (app mirror)</h2>
        </template>
        <DevJson
          :data="profile.current?.appMirror || null"
          title="Current App Chef"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'

definePageMeta({ layout: 'dev' })

// Use local (app-scoped) collection and current app mirror when in tenant role
const profile = useProfile(chefConfig)
const localChefs = profile.collection?.local ?? ref([])
</script>
