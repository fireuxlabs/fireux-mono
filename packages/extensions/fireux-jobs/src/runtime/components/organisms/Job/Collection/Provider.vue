<template>
  <slot :showAgentCollection="showAgentCollection" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent';

const { coreProfile } = useAgent()
const showAgentCollection = computed(() => Boolean(coreProfile.value))
</script>
