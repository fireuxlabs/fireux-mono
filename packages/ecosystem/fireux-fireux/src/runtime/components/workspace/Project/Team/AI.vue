<template>
  <WorkspaceAI aria-label="Project Team AI" compact>
    <UChatPrompt
      placeholder="Project Team AI is not connected yet."
      variant="soft"
      aria-label="Ask Project Team AI"
      disabled
    >
      <template #footer>
        <div class="flex w-full justify-end">
          <UChatPromptSubmit status="ready" disabled />
        </div>
      </template>
    </UChatPrompt>

    <div
      class="flex flex-wrap justify-center gap-2"
      aria-label="Suggested Project actions"
    >
      <UButton
        v-for="suggestion in suggestions"
        :key="suggestion"
        :label="suggestion"
        color="neutral"
        variant="soft"
        size="sm"
        disabled
      />
    </div>
  </WorkspaceAI>
</template>

<script setup lang="ts">
const suggestions = [
  'Who is on my Project Team?',
  'Add a Team member',
  'How do Team invitations work?',
] as const
</script>
