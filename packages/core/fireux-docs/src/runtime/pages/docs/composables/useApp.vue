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
        <h2>Read</h2>
        <p>
          FireUX Core exposes this read as <code>useAppRead()</code>. Pass the
          configured App id from <code>useFireUXConfig()</code>. It reads after
          signed-in Auth has settled and checks that the server response
          belongs to that App. Core registers both composables for Nuxt
          auto-import.
        </p>
        <pre><code>{{ usageExample }}</code></pre>
      </section>

      <section>
        <h2>Input</h2>
        <dl>
          <dt><code>id: MaybeRef&lt;string | null | undefined&gt;</code></dt>
          <dd>
            A string, ref, or computed ref containing the configured App id.
            While Auth is signed out or unsettled, the read is idle.
          </dd>
        </dl>
      </section>

      <section>
        <h2>Returns</h2>
        <dl>
          <dt><code>app</code></dt>
          <dd>
            The safe App projection, or <code>null</code> when no valid App
            exists. It is <code>undefined</code> until the read settles.
          </dd>
          <dt><code>exists</code></dt>
          <dd>Whether the configured App record exists.</dd>
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
        <h2>Stored and derived values</h2>
        <p>
          <code>status</code> is stored on the App. A page can derive a convenient
          boolean from it. <code>outcome</code> describes the read; it is not an
          App field.
        </p>
        <pre><code>{{ derivedExample }}</code></pre>
      </section>

      <section>
        <h2>App fields</h2>
        <p>
          The returned App has <code>id</code>, <code>ecosystem_id</code>,
          <code>role</code>, <code>status</code>, <code>name</code>,
          <code>created</code>, and <code>updated</code>. Its optional fields are
          <code>short_name</code>, <code>tagline</code>,
          <code>description</code>, <code>social_links</code>, and
          <code>media</code>. Role is <code>global</code>, <code>tenant</code>,
          or <code>standalone</code>; status is <code>active</code> or
          <code>inactive</code>. The read projection omits private
          <code>context</code> and unrelated stored metadata.
        </p>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const usageExample = `import { computed } from 'vue'

const fireux = useFireUXConfig()
const { app, outcome, refresh } = useAppRead(fireux.appId)`

const derivedExample = `const isActive = computed(() => app.value?.status === 'active')`

definePageMeta({ layout: 'docs', title: 'App' })
useSeoMeta({
  title: 'App · FireUX Docs',
  description: 'Read the configured FireUX App.',
})
</script>
