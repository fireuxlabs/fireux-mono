<template>
  <section id="composition" class="pagebody" aria-labelledby="docs-composition">
    <h2 id="docs-composition" class="fx-type-section-title">
      Public experience, Workspace and domain owners
    </h2>
    <UPageGrid>
      <UPageCard title="Public Kitchen discovery" variant="subtle">
        <p>
          The Main App's <code>/</code> and <code>/kitchens</code> are
          venue-first discovery. <code>/menus</code> is a food/service-first
          directory with its own eligibility and reader.
        </p>
        <p>
          <ULink :to="miseboxDocsSources.home">Public Home</ULink> acquires
          through <code>useKitchens</code> once, coordinates read feedback with
          Core, and supplies results to <code>PublicKitchenCollection</code>.
        </p>
      </UPageCard>
      <UPageCard title="Kitchen Workspace" variant="subtle">
        <p>
          <code>/workspace/kitchen</code> is the operator entrance. Core owns
          its shared frame; Kitchen owns selection, its capability state and
          trusted operations.
        </p>
        <p>
          <ULink :to="miseboxDocsSources.identity">The Identity route</ULink>
          supplies its domain controller to
          <code>WorkspaceKitchenIdentity</code>. Do not mount the whole
          connected editor just to preview a card.
        </p>
      </UPageCard>
      <UPageCard title="Menu presentation" variant="subtle">
        <p>
          <ULink :to="miseboxDocsSources.menu"
            >The public Kitchen Menu route</ULink
          >
          composes the existing detail reader and domain content. Menus keep
          their Kitchen-scoped records; a route or QR link is not a second
          publication copy.
        </p>
        <p>
          Menu publication, serving configuration and order eligibility are
          different facts. A visible Menu or selected service does not authorize
          an order or an operator write.
        </p>
      </UPageCard>
    </UPageGrid>
    <h3 class="fx-type-card-heading">
      Choose the audience, then the component
    </h3>
    <p>
      <code>PublicKitchen*</code> names customer-facing composition.
      <code>WorkspaceKitchen*</code> names operator composition, including
      complete capability screens. Authentication alone does not decide the
      audience. A neutral Kitchen component needs a proved lower responsibility
      and independent consumers.
    </p>
    <p>
      The
      <ULink :to="miseboxDocsSources.registration">current registration</ULink>
      exposes the Public directory and Workspace Identity compositions in this
      reference. Other Kitchen and Menu capabilities still need their own
      review; these examples do not claim that the whole library has migrated.
      Follow the
      <ULink :to="miseboxDocsSources.surfaces"
        >surface and library admission rule</ULink
      >
      when extending it.
    </p>
    <h3 class="fx-type-card-heading">Keep data and access with their owners</h3>
    <ul class="fx-list-stack">
      <li>
        <strong>App:</strong> identity, deployment, brand, routes, module/layer
        choices and bounded App policy.
      </li>
      <li>
        <strong>Misebox:</strong> Ecosystem binding and actual cross-extension
        hospitality composition.
      </li>
      <li>
        <strong>Extensions:</strong> Kitchen and Menu records/commands in
        Kitchens; venue profile/media in Places; translation transport in
        Sproochli; QR tooling in Go QR. Presentation does not transfer those
        responsibilities.
      </li>
      <li>
        <strong>Core:</strong> neutral Nuxt/Firebase mechanics, App membership
        and the shared Workspace frame.
      </li>
    </ul>
    <UAlert
      title="Selection is not permission"
      description="A Workspace declaration, remembered Kitchen, route parameter or supplied component prop grants no access. Readers and trusted commands check current App membership, exact target access and operation policy. Development-open Rules are not a production privacy guarantee."
      color="neutral"
      variant="soft"
    />
  </section>
</template>

<script setup lang="ts">
import { miseboxDocsSources } from '../../content/docs'
</script>
