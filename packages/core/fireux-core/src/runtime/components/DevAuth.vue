<script setup lang="ts">
import { ref } from 'vue'
import { useFirebaseAuth } from 'vuefire'
import { signInAnonymously } from 'firebase/auth'

const auth = useFirebaseAuth()
const busy = ref(false)
const signInAnon = async () => {
  if (!auth || busy.value) return
  busy.value = true
  try {
    await signInAnonymously(auth)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <button type="button" :disabled="busy" @click="signInAnon">
    {{ busy ? 'Signing in…' : 'Continue as guest' }}
  </button>
</template>
