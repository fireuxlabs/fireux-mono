<template>
  <slot :profiles="profiles" :loading="loading" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ProfileLike = { uid: string } & Record<string, unknown>

const props = withDefaults(
  defineProps<{ profiles?: ProfileLike[]; loading?: boolean }>(),
  { profiles: () => [], loading: false }
)

const profiles = computed(() => props.profiles ?? [])
const loading = computed(() => props.loading ?? false)
</script>
