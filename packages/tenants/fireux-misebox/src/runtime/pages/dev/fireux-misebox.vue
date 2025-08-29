<template>
  <div>
    <UCard>
      <template #header>
        <h1>🍳 Global Chefs Collection</h1>
      </template>
      <p>Total Global Chefs: {{ globalChefs?.length || 0 }}</p>
      <FireDevJson
        :data="{ total: globalChefs?.length || 0, chefs: globalChefs }"
        title="Global Chefs JSON"
      />
    </UCard>
    <UCard>
      <UCard>
        <template #header>
          <h1>🔄 Add Global Chef to Niederhorn</h1>
        </template>
        <UButton @click="addChefToNiederhorn" color="primary">
          Add Chef SpongeBob (id: 1234) to Local Collection
        </UButton>
        <UButton @click="removeChefFromNiederhorn" color="red" class="ml-2">
          Remove Chef SpongeBob (id: 1234) from Local Collection
        </UButton>
        <p v-if="addStatus">{{ addStatus }}</p>
      </UCard>
      <template #header>
        <h1>🏠 Local (App) Chefs Collection</h1>
      </template>
      <p>Total Local Chefs: {{ appChefs?.length || 0 }}</p>
      <FireDevJson
        :data="{ total: appChefs?.length || 0, chefs: appChefs }"
        title="Local Chefs JSON"
      />
    </UCard>
  </div>
</template>

<script setup>
import { deleteDoc, doc, collection } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { chefConfig } from '../../models/profiles/Chef.model'
definePageMeta({
  layout: 'dev',
})

// Use the useProfile composable to fetch both global and local (app) chefs

import { useAppUpdate } from '#imports'

const { globalCollection: globalChefs, appCollection: appChefs } =
  await useProfile(chefConfig)

import { ref } from 'vue'
const addStatus = ref('')

const { profileToApp } = useAppUpdate()

async function addChefToNiederhorn() {
  addStatus.value = ''
  try {
    await profileToApp('chefs', { id: 1234, name: 'SpongeBob' })
    addStatus.value = 'Chef added to niederhorn collection!'
  } catch (e) {
    addStatus.value = 'Error: ' + (e?.message || e)
  }
}

async function removeChefFromNiederhorn() {
  addStatus.value = ''
  try {
    const db = useFirestore()
    const appId = 'misebox-app' // adjust if dynamic
    const chefRef = doc(collection(db, 'apps', appId, 'chefs'), '1234')
    await deleteDoc(chefRef)
    addStatus.value = 'Chef removed from niederhorn collection!'
  } catch (e) {
    addStatus.value = 'Error: ' + (e?.message || e)
  }
}
</script>
