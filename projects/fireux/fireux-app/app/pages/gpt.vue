<template>
  <UPage>
    <UPageHeader
      title="FireUX AI"
      description="The models and controls used by AI inside FireUX Workspaces."
    >
      <template #headline>
        <div class="flex items-center gap-2 text-sm font-medium text-primary">
          <img
            src="/img/core/brand/logo.svg"
            alt="FireUX"
            class="size-6 object-contain"
          />
          FireUX
        </div>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-10">
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-highlighted">Current models</h2>
        <p class="max-w-3xl text-toned">
          Each Workspace shows the model currently available to that App. There
          is one available model today; the control opens this page instead of
          presenting choices that do not exist yet.
        </p>

        <div class="grid gap-4 md:grid-cols-2">
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-code-2" class="size-5 text-primary" />
                <h3 class="font-semibold text-highlighted">Development</h3>
              </div>
            </template>
            <p class="text-sm text-toned">
              Local development may use the Codex development override. It is
              isolated from the model configured for a deployed App.
            </p>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-sparkles" class="size-5 text-primary" />
                <h3 class="font-semibold text-highlighted">Connected Apps</h3>
              </div>
            </template>
            <p class="text-sm text-toned">
              The current connected default is OpenAI GPT-4o mini. The App
              operator configures the provider and model on the server.
            </p>
          </UCard>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-highlighted">How usage works</h2>
        <div class="overflow-hidden rounded-lg border border-default">
          <table class="w-full text-left text-sm">
            <thead class="bg-elevated text-highlighted">
              <tr>
                <th class="px-4 py-3 font-medium">Input</th>
                <th class="px-4 py-3 font-medium">What affects usage</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default text-toned">
              <tr>
                <td class="px-4 py-3 font-medium text-highlighted">Prompt</td>
                <td class="px-4 py-3">
                  Its length and the context supplied by the Workspace.
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium text-highlighted">Response</td>
                <td class="px-4 py-3">
                  The amount of text or structured data returned.
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium text-highlighted">File</td>
                <td class="px-4 py-3">
                  Its size and the processing required by the connected
                  capability.
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium text-highlighted">Voice</td>
                <td class="px-4 py-3">
                  Audio transcription before the resulting text is used.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="max-w-3xl text-sm text-muted">
          FireUX does not currently expose a separate customer AI-credit
          balance. Availability depends on the App configuration and the Tools
          connected to the current Workspace surface.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-highlighted">Controls</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <UCard>
            <UIcon name="i-lucide-mic" class="mb-3 size-5 text-primary" />
            <h3 class="font-semibold text-highlighted">Microphone</h3>
            <p class="mt-2 text-sm text-toned">
              Records speech where voice transcription is connected.
            </p>
          </UCard>
          <UCard>
            <UIcon name="i-lucide-paperclip" class="mb-3 size-5 text-primary" />
            <h3 class="font-semibold text-highlighted">Attachments</h3>
            <p class="mt-2 text-sm text-toned">
              Supplies a file only to capabilities that accept that file type.
            </p>
          </UCard>
          <UCard>
            <UIcon name="i-lucide-bot" class="mb-3 size-5 text-primary" />
            <h3 class="font-semibold text-highlighted">Model</h3>
            <p class="mt-2 text-sm text-toned">
              Identifies the active model and links back to this explanation.
            </p>
          </UCard>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-highlighted">
          Bring your own key
        </h2>
        <p class="max-w-3xl text-toned">
          Provider and model selection are planned. They are not customer
          settings yet. When introduced, a key will remain server-side and the
          Workspace will list only models actually available through that
          provider.
        </p>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ title: 'FireUX AI' })

useSeoMeta({
  title: 'FireUX AI models and usage',
  description:
    'Learn which AI models FireUX uses, what affects usage, and how Workspace voice, files, and model controls work.',
  ogTitle: 'FireUX AI models and usage',
  ogDescription:
    'The current FireUX AI model, development override, Workspace controls, and future bring-your-own-key direction.',
})
</script>
