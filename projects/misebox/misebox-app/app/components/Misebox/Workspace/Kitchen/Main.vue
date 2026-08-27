<template>
  <section class="workspace-surface">
    <WorkspaceKitchenHero>
      <template #links>
        <UButton
          to="/tools"
          label="Browse restaurant tools"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        />
      </template>
    </WorkspaceKitchenHero>

    <main class="mx-auto w-full max-w-3xl min-w-0" aria-label="KitchenAI">
      <WorkspaceKitchenAI
        title="What would you like to work on?"
        agent-label=""
        :starters="[]"
        class="kitchen-ai-welcome--landing"
      />
    </main>

    <WorkspaceKitchen />

    <MiseboxWorkspaceKitchenOperations />
    <MiseboxWorkspaceKitchenFreeTools />
    <MiseboxWorkspaceKitchenDiscovery />
  </section>
</template>
