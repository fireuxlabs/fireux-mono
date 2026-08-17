<template>
  <ConsoleKitchenAI
    title="Team commands"
    description="Describe one Team action. TeamAI will prepare the matching tool for your approval."
    placeholder="Add a member or create an invitation…"
    operation="team"
    mode="command"
    :allow-file="false"
    :starters="starters"
  />
</template>

<script setup lang="ts">
const starters = [
  {
    label: 'Add someone',
    prompt: 'Add a member named ',
    icon: 'i-lucide-user-plus',
  },
  {
    label: 'Create invitation',
    prompt: 'Create an invitation for ',
    icon: 'i-lucide-link',
  },
]
</script>
