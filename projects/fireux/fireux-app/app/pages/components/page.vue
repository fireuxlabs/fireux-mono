<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <nav
            class="page-docs__navigation"
            aria-label="Component documentation"
          >
            <ULink to="/components">Components</ULink>
            <ULink to="/components/page">Page</ULink>
            <ULink to="https://ui.nuxt.com/docs/components" target="_blank"
              >Nuxt UI components</ULink
            >
          </nav>
        </UPageAside>
      </template>

      <UBreadcrumb
        :items="[{ label: 'Components', to: '/components' }, { label: 'Page' }]"
      />
      <UPageHeader
        title="Page"
        description="Compose a FireUX page from native Nuxt UI structure and named domain components."
      >
        <template #links>
          <UButton
            to="https://ui.nuxt.com/docs/components/page"
            target="_blank"
            label="Nuxt UI reference"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </template>
      </UPageHeader>

      <UPageBody>
        <section
          id="usage"
          class="page-docs__section"
          aria-labelledby="usage-heading"
        >
          <h2 id="usage-heading">Usage</h2>
          <p>
            Use Nuxt UI’s UPage directly. Add a page introduction and a
            UPageBody containing named components. FireUX adds composition
            conventions; it does not replace UPage or add a separate Page API.
          </p>
          <pre><code>{{ usageExample }}</code></pre>
          <p>
            Put UContainer in one place. The default layout already supplies it.
            The framework layout currently requires it around the route’s UPage.
          </p>
        </section>

        <section
          id="examples"
          class="page-docs__section"
          aria-labelledby="examples-heading"
        >
          <h2 id="examples-heading">Examples</h2>
          <h3>Within a route</h3>
          <p>
            Keep the visible composition in the route. Use useAppCollectionPage
            to coordinate one reader, state, pagination, diagnostics and SEO.
            Named components receive small, cohesive inputs through their
            existing APIs.
          </p>
          <p>
            Both Apps routes compose the same named responsibilities. Their
            scope, copy, layout and search policy remain explicit.
          </p>
          <pre><code>{{ collectionExample }}</code></pre>
          <p>
            The platform route uses the same visible template inside its
            framework container, with its own options:
          </p>
          <pre><code>{{ platformExample }}</code></pre>
          <p>
            The composable returns a reactive page context. State, Pagination
            and diagnostics use v-bind with their existing prop names; there is
            no new state or pagination prop API. FireUX’s structured search data
            receives the same acquired App records.
          </p>
          <h3>Within a route tree</h3>
          <p>
            Use NuxtPage to render a child route. Use named components, props
            and events for the content inside each page. Shared Workspace
            framing already owns its Navbar, Breadcrumbs and route outlet.
          </p>
          <pre><code>{{ routeExample }}</code></pre>
          <h3>With side columns</h3>
          <p>
            UPage’s native left and right regions remain available for
            navigation and supporting content. This documentation page uses
            them. Use the upstream API rather than introducing a custom
            slot-based page shell.
          </p>
        </section>

        <section
          id="api"
          class="page-docs__section"
          aria-labelledby="api-heading"
        >
          <h2 id="api-heading">API</h2>
          <p>
            UPage, UPageHeader and UPageBody keep their Nuxt UI APIs. Refer to
            the upstream documentation for their props, slots and responsive
            behavior.
          </p>
          <h3>FireUX composition</h3>
          <div class="page-docs__table">
            <table>
              <thead>
                <tr>
                  <th>Component / composable</th>
                  <th>Inputs</th>
                  <th>Responsibility</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>useAppCollectionPage</td>
                  <td>scope; optional title, description, seo</td>
                  <td>
                    Shared coordination only. Returns reactive title,
                    description, apps, ready, state, pagination, diagnostics and
                    loadMore. The route visibly composes the native page and
                    named children.
                  </td>
                </tr>
                <tr>
                  <td>Entity Hero</td>
                  <td>Entity-owned introduction</td>
                  <td>
                    Page title, description and genuine domain introduction.
                  </td>
                </tr>
                <tr>
                  <td>FireState</td>
                  <td>outcome, entity?, error?</td>
                  <td>
                    One acquisition message. Pending, empty, missing or error;
                    nothing for ready or idle. Errors include the shared copy
                    control.
                  </td>
                </tr>
                <tr>
                  <td>Entity Collection</td>
                  <td>Named records prop</td>
                  <td>
                    Search, filtering and record presentation. It does not
                    reacquire the primary collection.
                  </td>
                </tr>
                <tr>
                  <td>FireCollectionPagination</td>
                  <td>hasMore, loading?, error?</td>
                  <td>
                    Load-more feedback and error copying. Emits load-more; does
                    not fetch records.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Compose these where needed. A static page does not need a reader,
            State or Pagination. Use Current and Create components only where
            those capabilities exist.
          </p>
        </section>

        <section
          id="data"
          class="page-docs__section"
          aria-labelledby="data-heading"
        >
          <h2 id="data-heading">Data and authority</h2>
          <p>
            Firebase authentication and records stay behind the owning domain’s
            readers and protected commands. A page displays their results; its
            route or visible controls do not grant write permission.
          </p>
          <p>
            Keep acquisition state in the reader. An initial failure belongs to
            State. A next-page failure belongs to Pagination and keeps the
            existing records visible.
          </p>
        </section>

        <section
          id="theme"
          class="page-docs__section"
          aria-labelledby="theme-heading"
        >
          <h2 id="theme-heading">Theme</h2>
          <p>
            Use native component props and the FireUX design system’s semantic
            classes and tokens. Do not add authored Tailwind utilities or
            per-page utility recipes.
          </p>
          <p>
            Layouts own shared framing. Domain components own their content and
            interaction. Keep pages readable as a composition of those named
            responsibilities.
          </p>
        </section>
      </UPageBody>

      <template #right>
        <nav
          class="page-docs__toc page-docs__navigation"
          aria-label="On this page"
        >
          <p>On this page</p>
          <ULink
            v-for="section in sections"
            :key="section.id"
            :to="'#' + section.id"
            >{{ section.label }}</ULink
          >
        </nav>
      </template>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'framework', requiresAuth: false })
useSeoMeta({
  title: 'Page · FireUX components',
  description:
    'Use native Nuxt UI Page components with FireUX composition, data and design-system conventions.',
})
const sections = [
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API' },
  { id: 'data', label: 'Data and authority' },
  { id: 'theme', label: 'Theme' },
]
const usageExample = `<UPage>
  <UPageHeader :title="pageTitle" :description="pageDescription" />
  <UPageBody>
    <YourNamedContent />
  </UPageBody>
</UPage>`
const collectionExample = `<template>
  <UPage>
    <AppHero :title="page.title" :description="page.description" />
    <UPageBody>
      <FireState v-bind="page.state" />
      <AppCollection
        v-if="page.ready"
        :apps="page.apps"
        :has-more="page.pagination.hasMore"
      />
      <FireCollectionPagination v-bind="page.pagination" @load-more="page.loadMore" />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useAppCollectionPage } from 'fireux-core/runtime/app/composables/useAppCollectionPage'

const page = useAppCollectionPage({ scope: 'ecosystem' })
<\/script>`
const platformExample = `const page = useAppCollectionPage({
  scope: 'platform',
  title: 'Showcase',
  description: 'Explore the public App directory.',
  seo,
})

The route's optional seo.jsonLdBuilder(context, apps) receives
this reader's records. Keep the named page composition visible;
do not start another reader for SEO.`

const routeExample = `<template>
  <YourNamedNavigation />
  <NuxtPage />
</template>`
</script>

<style scoped>
.page-docs__section {
  display: grid;
  gap: calc(var(--spacing) * 4);
  scroll-margin-top: calc(var(--ui-header-height) + var(--spacing) * 6);
}
.page-docs__section h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
}
.page-docs__section h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
}
.page-docs__section pre {
  overflow-x: auto;
  padding: calc(var(--spacing) * 4);
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}
.page-docs__navigation {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 3);
  font-size: var(--text-sm);
}
.page-docs__toc {
  position: sticky;
  top: calc(var(--ui-header-height) + var(--spacing) * 6);
  padding-block: calc(var(--spacing) * 6);
}
.page-docs__toc p {
  font-weight: var(--font-weight-semibold);
}
.page-docs__table {
  overflow-x: auto;
}
.page-docs__table table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.page-docs__table th,
.page-docs__table td {
  padding: calc(var(--spacing) * 3);
  border-bottom: 1px solid var(--ui-border);
  text-align: left;
  vertical-align: top;
}
</style>
