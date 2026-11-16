<template>
  <section id="app-setup" class="pagebody" aria-labelledby="docs-app-setup">
    <h2 id="docs-app-setup" class="fx-type-section-title">Compose an App</h2>
    <p>
      Start with a maintained Misebox App, such as the
      <ULink :to="miseboxDocsSources.tenant">tenant recipe</ULink>, and its own
      package manifest. Replace the example App identity below with the approved
      identity for your App. Project and Ecosystem IDs name canonical
      relationships; they are not Kitchen targets.
    </p>
    <pre
      class="misebox-docs-code"
      aria-label="Tenant App configuration example"
    ><code>{{ miseboxAppExample }}</code></pre>
    <p>
      The App selects the Kitchen Workspace and the
      <ULink :to="miseboxDocsSources.workspaceLayer"
        >Misebox Kitchen layer</ULink
      >. Misebox registers Kitchens through module dependencies. Use an App
      module tuple only when configuring package-owned options, such as ordering
      channels; <ULink :to="miseboxDocsSources.main">Misebox Main</ULink> shows
      that explicit choice. Omitted ordering configuration enables no channels.
    </p>
    <p>
      <code>defineFireuxApp</code> supplies the
      <ULink :to="miseboxDocsSources.defaults">standard App bundle</ULink>,
      including Core, Blogs, Products and AI. Main Apps use
      <code>defineFireuxEcosystem</code> for shared Main App surfaces.
      Availability does not enable AI execution, payment, membership or a domain
      operation.
    </p>
    <h3 class="fx-type-card-heading">Keep the root lifecycle shared</h3>
    <pre
      class="misebox-docs-code"
      aria-label="Workspace-capable App root example"
    ><code>{{ miseboxRootExample }}</code></pre>
    <p>
      Use this root when the App declares Workspaces; an App without them uses
      <code>FireuxApp</code>. Core owns the provider, initialization, head
      policy and route framing. Your public routes and branded sections remain
      App-owned. A tenant's customer Home and management entrance are separate
      choices.
    </p>
    <h3 class="fx-type-card-heading">Run and brand the App</h3>
    <ol class="fx-list-stack">
      <li>
        Use the existing workspace install and the App manifest's dev command.
        For Misebox Main, that command is
        <code>pnpm --filter misebox-app dev</code>.
      </li>
      <li>
        Supply <code>APP_DOMAIN</code> and the App's Firebase Web App inputs
        from the
        <ULink :to="miseboxDocsSources.environment">environment template</ULink
        >. App identity stays in authored configuration.
      </li>
      <li>
        Keep App artwork in <code>public/img/app</code>, following the
        <ULink :to="miseboxDocsSources.assets">shared asset contract</ULink>.
        Run the App-scoped asset check after changing it.
      </li>
      <li>
        Use <code>app/app.config.ts</code> for native <code>ui.colors</code>,
        navigation and optional App <code>theme.palette</code>/typography. Use
        the
        <ULink :to="miseboxDocsSources.theme">existing theme contracts</ULink>;
        do not create another preference store or copy theme into assembly
        runtime fields.
      </li>
    </ol>
    <p>
      Kitchen's saved Menu palette belongs to Kitchen, while Place owns venue
      identity and media. An App brand does not overwrite either owner. Tenant
      Apps can link to these Main App docs rather than bundling the FireUX
      developer reference.
    </p>
  </section>
</template>

<script setup lang="ts">
import {
  miseboxAppExample,
  miseboxRootExample,
  miseboxDocsSources,
} from '../../content/docs'
</script>

<style scoped>
.misebox-docs-code {
  max-width: 100%;
  overflow-x: auto;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--ui-bg-muted);
  font-size: var(--text-sm);
}
</style>
