<template>
  <section class="workspace-surface">
    <MiseboxHomeHero />

    <main class="mx-auto w-full max-w-3xl min-w-0" aria-label="KitchenAI">
      <WorkspaceKitchenAI
        title="What would you like to work on?"
        agent-label=""
        :starters="[]"
        class="kitchen-ai-welcome--landing"
      />
    </main>

    <WorkspaceKitchen />

    <MiseboxHomeOperations />
    <MiseboxHomeFreeTools />
    <MiseboxHomeDiscovery />
  </section>
</template>

<script setup lang="ts"></script>
