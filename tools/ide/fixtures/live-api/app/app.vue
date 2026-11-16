<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import KitchenReader from './components/KitchenReader.vue'
import ProjectReader from './components/ProjectReader.vue'
import NamedReader from './components/NamedReader.vue'

const mode = useRuntimeConfig().public.fixtureMode
const auth = useAuth()
const uid = computed(() => auth.currentUser.value?.uid || '')
const mounted = ref(true)
const place = ref('place-000')
const result = ref('')
async function control(operation: string) {
  result.value = JSON.stringify(
    await $fetch('/api/__fixture/control', {
      method: 'POST',
      body: { operation },
    })
  )
}
</script>

<template>
  <main>
    <h1>{{ mode }} live read fixture</h1>
    <p data-testid="uid">{{ uid }}</p>
    <button
      @click="
        auth.signInWithEmailPassword(
          'actor@fixture.test',
          'fixture-password-123'
        )
      "
    >
      Sign in fixture actor
    </button>
    <button @click="auth.signOutUser()">Sign out</button>
    <button @click="mounted = !mounted">Toggle consumers</button>
    <button @click="place = place === 'place-000' ? 'place-001' : 'place-000'">
      Switch Kitchen scope
    </button>
    <button @click="control('disconnect')">Disconnect feeds</button>
    <button @click="control('kitchen-name')">Change Kitchen name</button>
    <button @click="control('kitchen-private')">
      Change private Kitchen field
    </button>
    <button @click="control('kitchen-burst')">Burst Kitchen names</button>
    <button @click="control('identity-name')">Change linked identity</button>
    <button @click="control('decoy-name')">
      Change wrong database identity
    </button>
    <button @click="control('team-name')">Change Project A Team</button>
    <button @click="control('revoke-grant')">Revoke Project grant</button>
    <button @click="control('restore-grant')">Restore Project grant</button>
    <button @click="control('disable-user')">Disable Auth actor</button>
    <button @click="control('enable-user')">Enable Auth actor</button>
    <button @click="result = JSON.stringify(await $fetch('/api/app/status'))">
      Ordinary JSON read
    </button>
    <button
      @click="result = JSON.stringify(await $fetch('/api/__fixture/metrics'))"
    >
      Read metrics
    </button>
    <button @click="control('reset-metrics')">Reset counters</button>
    <output data-testid="result">{{ result }}</output>
    <template v-if="mounted">
      <template v-if="mode === 'kitchen'">
        <KitchenReader label="directory" />
        <KitchenReader label="selected" :place-id="place" />
        <KitchenReader
          v-for="index in 9"
          :key="index"
          :label="`exact-${index}`"
          :place-id="`place-${String(index).padStart(3, '0')}`"
        />
      </template>
      <ProjectReader v-else />
      <NamedReader />
    </template>
  </main>
</template>
