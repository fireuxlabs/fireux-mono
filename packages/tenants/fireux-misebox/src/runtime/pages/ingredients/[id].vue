<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useFirestore, useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'

const route = useRoute()
const db = useFirestore()
const docRef = computed(() => doc(db, 'ingredients', String(route.params.id)))
const { data: ingredient } = useDocument(docRef)
</script>
<template>
  <div class="page ingredient-detail">
    <h1>{{ ingredient?.name || 'Ingredient' }}</h1>
    <pre>{{ ingredient }}</pre>
  </div>
</template>
