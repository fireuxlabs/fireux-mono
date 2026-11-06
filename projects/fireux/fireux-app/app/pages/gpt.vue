<template>
  <UPage>
    <UPageHeader
      title="FireUX AI"
      description="The models and controls used by AI inside FireUX Workspaces."
    >
      <template #headline>
        <div class="flex items-center gap-2">
          <img
            src="/img/core/brand/logo.svg"
            alt="FireUX"
            class="size-6 object-contain"
          />
          FireUX
        </div>
      </template>
    </UPageHeader>

    <UPageBody>
      <section class="pagebody">
        <h2 class="fx-type-section-title">Current models</h2>
        <p class="max-w-3xl fx-type-body">
          Each Workspace shows the model currently available to that App. There
          is one available model today; the control opens this page instead of
          presenting choices that do not exist yet.
        </p>

        <UPageGrid>
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-code-2" />
                <h3 class="fx-type-card-heading">Development</h3>
              </div>
            </template>
            <p class="fx-type-caption">
              Local development may use the Codex development override. It is
              isolated from the model configured for a deployed App.
            </p>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-sparkles" />
                <h3 class="fx-type-card-heading">Connected Apps</h3>
              </div>
            </template>
            <p class="fx-type-caption">
              The current connected default is OpenAI GPT-4o mini. The App
              operator configures the provider and model on the server.
            </p>
          </UCard>
        </UPageGrid>
      </section>

      <section class="pagebody">
        <h2 class="fx-type-section-title">How usage works</h2>
        <div class="overflow-hidden rounded-lg border border-default">
          <table class="w-full">
            <thead class="bg-elevated">
              <tr>
                <th class="px-4 py-3">Input</th>
                <th class="px-4 py-3">What affects usage</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr>
                <td class="px-4 py-3">Prompt</td>
                <td class="px-4 py-3">
                  Its length and the context supplied by the Workspace.
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">Response</td>
                <td class="px-4 py-3">
                  The amount of text or structured data returned.
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">File</td>
                <td class="px-4 py-3">
                  Its size and the processing required by the connected
                  capability.
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">Voice</td>
                <td class="px-4 py-3">
                  Audio transcription before the resulting text is used.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="max-w-3xl fx-type-caption">
          FireUX does not currently expose a separate customer AI-credit
          balance. Availability depends on the App configuration and the Tools
          connected to the current Workspace surface.
        </p>
      </section>

      <section class="pagebody">
        <h2 class="fx-type-section-title">Controls</h2>
        <UPageGrid>
          <UCard>
            <UIcon name="i-lucide-mic" />
            <h3 class="fx-type-card-heading">Microphone</h3>
            <p class="mt-2 fx-type-caption">
              Records speech where voice transcription is connected.
            </p>
          </UCard>
          <UCard>
            <UIcon name="i-lucide-paperclip" />
            <h3 class="fx-type-card-heading">Attachments</h3>
            <p class="mt-2 fx-type-caption">
              Supplies a file only to capabilities that accept that file type.
            </p>
          </UCard>
          <UCard>
            <UIcon name="i-lucide-bot" />
            <h3 class="fx-type-card-heading">Model</h3>
            <p class="mt-2 fx-type-caption">
              Identifies the active model and links back to this explanation.
            </p>
          </UCard>
        </UPageGrid>
      </section>

      <section class="pagebody">
        <h2 class="fx-type-section-title">Bring your own key</h2>
        <p class="max-w-3xl fx-type-body">
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
