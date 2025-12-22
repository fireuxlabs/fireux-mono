<template>
  <OrganismsProfilePage
    :config="agentConfig"
    edit-path="/dashboard/agent/profile"
    page-title="Agent Profile"
    page-description="View agent profile"
    :fallback-href="'/agents'"
  >
    <template #profile="{ profile }">
      <OrganismsProfilesAgentProfile :agent="profile" />
    </template>
  </OrganismsProfilePage>
</template>

<script setup lang="ts">
import { agentConfig } from '../../models/profiles/Agent/Agent.model'
</script>
