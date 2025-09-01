<script setup lang="ts">
import { useFirebaseAuth } from 'vuefire'
import { signInAnonymously } from 'firebase/auth'
const auth = useFirebaseAuth()
const signInAnon = async () => { if (auth) await signInAnonymously(auth) }
</script>

<template>
  <button type="button" @click="signInAnon">Continue as guest</button>
</template>
