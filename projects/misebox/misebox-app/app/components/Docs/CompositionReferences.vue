<template>
  <section class="pagebody" aria-labelledby="docs-composition-references">
    <h2 id="docs-composition-references" class="fx-type-section-title">
      Complete composition references
    </h2>
    <p>
      These are real consumers, not sandbox previews. Inspect their reader,
      target and lifecycle before composing them into another App.
    </p>
    <UPageGrid>
      <UPageCard
        title="PublicKitchenIntro + PublicKitchenCollection"
        variant="subtle"
        :to="miseboxDocsSources.home"
      >
        <p>
          Public Home supplies one directory read and Core feedback. Intro
          depends on route context for its public links; Collection consumes
          enriched Kitchen directory entries and owns local search/category
          presentation.
        </p>
        <p>
          <strong>Prerequisites:</strong> the Misebox/Kitchen composition and
          the owning directory contract. Supplying a stored Kitchen document is
          not a substitute for that projection.
        </p>
      </UPageCard>
      <UPageCard
        title="WorkspaceKitchenIdentity"
        variant="subtle"
        :to="miseboxDocsSources.identity"
      >
        <p>
          The operator route owns <code>useKitchenWorkspaceIdentity</code> and
          passes its controller to the composition. Profile and listing editors
          keep their existing domain commands.
        </p>
        <p>
          <strong>Prerequisites:</strong> settled App membership, an authorized
          exact Kitchen and the connected identity controller. This reference is
          not mounted here and grants no edit access.
        </p>
      </UPageCard>
    </UPageGrid>
  </section>
</template>

<script setup lang="ts">
import { miseboxDocsSources } from '../../content/docs'
</script>
