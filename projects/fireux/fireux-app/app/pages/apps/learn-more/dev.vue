<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Apps: Learn More (Dev)"
      description="Technical reference for FireUX app records, routes, and setup endpoints."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc fx-list-stack text-sm">
          <li>Canonical records live in the owning Project/Ecosystem database.</li>
          <li>FireUX reads canonical <code>App</code> records through its server boundary.</li>
          <li><code>project_id</code> and <code>ecosystem_id</code> express relationships; role does not infer them.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary endpoints</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="fx-inset-panel">
            <p class="font-mono">GET /api/directory</p>
            <p class="text-dimmed">Read the shared FireUX App and Ecosystem directory projections.</p>
          </div>
          <div class="fx-inset-panel">
            <p class="font-mono">GET/POST /api/registry · retired</p>
            <p class="text-dimmed">Direct writes are rejected; publication belongs to the projection pipeline.</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">Parked architecture</p>
            <h2 class="text-lg font-semibold">AI-assisted App ignition</h2>
          </div>
        </template>

        <div class="space-y-4 text-sm">
          <p>
            A future Ignition flow can turn an App name and plain description into an
            operator-approved domain research brief before any capabilities are selected.
          </p>

          <ol class="list-decimal fx-list-stack pl-5 text-dimmed">
            <li>FireUX AI proposes the domain, operators, boundaries, formats and neutral search seeds.</li>
            <li>The operator reviews the research brief before external tools run.</li>
            <li>Research tools return sourced observations; AI proposals never count as demand evidence.</li>
            <li>FireUX AI groups the evidence into operator jobs and candidate capabilities for human review.</li>
            <li>Approved research and response literature live in Git as Markdown and structured content rendered through Nuxt Content.</li>
          </ol>

          <p class="text-dimmed">
            Firestore coordinates the Ignition request, status, approvals and publication reference.
            A server-side FireUX GitHub integration may later create a review branch or pull request;
            customers do not need GitHub accounts or repository credentials.
          </p>

          <UAlert
            color="neutral"
            variant="soft"
            title="Not a current Ignition capability"
            description="The current flow records an App request for review and scope. Research orchestration, Git publication and Nuxt Content delivery remain future implementation work."
          />
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/apps" color="primary" icon="i-lucide-app-window">Open apps</UButton>
        <UButton to="/apps/learn-more" color="neutral" variant="soft" icon="i-lucide-book-open">Public guide</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'AppsLearnMoreDevPage',
})

useSeoMeta({
  title: 'Apps: Learn More (Dev) · FireUX',
  description: 'Technical reference for FireUX app records, routes, and integration endpoints.',
})
</script>
