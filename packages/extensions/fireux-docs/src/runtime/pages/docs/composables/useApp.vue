<template>
  <UPage>
    <UPageHeader
      headline="FireUX Library · Composables"
      title="App"
      description="Read the configured App and derive the values your page needs."
    >
      <template #links>
        <UButton
          to="/docs/composables"
          label="All composables"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <section id="read">
        <h2 class="fx-type-section-title">Read</h2>
        <p>
          FireUX Core exposes this read as <code>useAppRead()</code>. Pass the
          configured App id from <code>useFireUXConfig()</code>. It reads after
          signed-in Auth has settled and checks that the server response belongs
          to that App. Core registers both composables for
          <ULink to="https://nuxt.com/docs/4.x/guide/concepts/auto-imports"
            >Nuxt auto-imports</ULink
          >.
        </p>
        <pre><code>{{ usageExample }}</code></pre>
      </section>

      <section>
        <h2 class="fx-type-section-title">Input</h2>
        <dl>
          <dt><code>id: MaybeRef&lt;string | null | undefined&gt;</code></dt>
          <dd>
            A string, ref, or computed ref containing the configured App id.
            While Auth is signed out or unsettled, the read is idle.
          </dd>
        </dl>
      </section>

      <section>
        <h2 class="fx-type-section-title">Returns</h2>
        <dl>
          <dt><code>app</code></dt>
          <dd>
            The safe App projection, or <code>null</code> when no valid App
            exists. It is <code>undefined</code> until the read settles.
          </dd>
          <dt><code>exists</code></dt>
          <dd>Whether the configured App has been initialized.</dd>
          <dt><code>pending</code></dt>
          <dd>Whether the current App read is in progress.</dd>
          <dt><code>error</code></dt>
          <dd>The request error, when the read fails.</dd>
          <dt><code>outcome</code></dt>
          <dd>
            One of <code>idle</code>, <code>pending</code>, <code>error</code>,
            <code>empty</code>, or <code>ready</code>.
          </dd>
          <dt><code>refresh</code></dt>
          <dd>Refresh the current App snapshot.</dd>
        </dl>
      </section>

      <section>
        <h2 class="fx-type-section-title">Stored and derived values</h2>
        <p>
          <code>status</code> is stored on the App. A page can derive a
          convenient boolean from it. <code>outcome</code> describes the read;
          it is not an App field.
        </p>
        <pre><code>{{ derivedExample }}</code></pre>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const usageExample = `const fireux = useFireUXConfig()
const { app, outcome, refresh } = useAppRead(fireux.appId)`

const derivedExample = `const isActive = computed(() => app.value?.status === 'active')`

definePageMeta({ layout: 'docs', title: 'App' })
useSeoMeta({
  title: 'App · FireUX Docs',
  description: 'Read the configured FireUX App.',
})
</script>
