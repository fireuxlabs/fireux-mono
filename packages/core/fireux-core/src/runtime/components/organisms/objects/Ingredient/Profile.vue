<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useFirestore, useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'

const route = useRoute()
const id = route.params.id as string
const db = useFirestore()
const docRef = doc(db, 'ingredients', id)
const { data: ingredient } = useDocument(docRef)
</script>

<template>
  <div class="objects object ingredient-profile" v-if="ingredient">
    <div class="header">
      <h1 class="section-title">{{ (ingredient as any).name }}</h1>
    </div>
    <div class="content">
      <p class="description">Basic ingredient entry.</p>
    </div>
  </div>
  <div v-else class="objects object ingredient-profile loading">
    <div class="header">
      <h1 class="section-title">Loading...</h1>
    </div>
  </div>
</template>
