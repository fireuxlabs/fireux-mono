<template>
  <section class="research-card research-card--featured research-grid">
    <header class="research-grid research-grid--compact">
      <div class="research-row research-row--spread">
        <p class="research-meta research-highlight">
          Next delivery journey · {{ workspace }}
        </p>
        <UBadge color="neutral" variant="soft">Live proof pending</UBadge>
      </div>
      <h2 class="research-detail-title">{{ brief.title }}</h2>
      <p class="research-reading research-copy research-muted">
        {{ brief.purpose }}
      </p>
    </header>
    <div class="research-button-row">
      <template v-for="page in brief.pages" :key="page.path"
        ><UButton
          v-if="page.availability === 'enabled'"
          :to="page.path"
          color="neutral"
          variant="outline"
          size="sm"
          >{{ page.label }}</UButton
        ><span v-else class="research-pill"
          >{{ page.label }} ·
          {{
            page.availability === 'planned'
              ? 'Planned page'
              : 'Not enabled in this App'
          }}</span
        ></template
      >
    </div>
    <details v-if="brief.configuration?.length" class="research-details">
      <summary>
        Configuration and its owners
        <span class="research-pill"
          >{{ brief.configuration.length }} areas</span
        >
      </summary>
      <div class="research-detail-body research-reading">
        <p class="research-copy research-muted">
          This journey reuses these capability settings. Saving configuration
          does not prove checkout or order delivery.
        </p>
        <article
          v-for="entry in brief.configuration"
          :key="entry.label"
          class="research-stack"
        >
          <h3 class="research-label--strong">{{ entry.label }}</h3>
          <p class="research-meta research-muted">{{ entry.owner }}</p>
          <ul class="research-copy">
            <li v-for="setting in entry.settings" :key="setting">
              {{ setting }}
            </li>
          </ul>
          <p class="research-copy"><strong>Tool:</strong> {{ entry.tool }}</p>
        </article>
      </div>
    </details>
    <details class="research-details">
      <summary>
        Tools and trusted services
        <span class="research-pill"
          >{{ brief.tools.length }} tools ·
          {{ brief.services.length }} services</span
        >
      </summary>
      <div class="research-detail-body research-columns">
        <section
          v-for="group in [
            { title: 'Tools', entries: brief.tools },
            { title: 'Trusted services', entries: brief.services },
          ]"
          :key="group.title"
          class="research-stack research-stack--loose"
        >
          <h3 class="research-label--strong">{{ group.title }}</h3>
          <article
            v-for="entry in group.entries"
            :key="entry.label"
            class="research-stack research-stack--tight"
          >
            <p class="research-copy">{{ entry.label }}</p>
            <p class="research-meta research-muted">
              {{
                entry.status === 'planned'
                  ? 'To build'
                  : entry.status === 'partial'
                    ? 'Partly built'
                    : 'Connected'
              }}
              · {{ entry.owner }}
            </p>
          </article>
        </section>
      </div>
    </details>
    <details class="research-details">
      <summary>
        What proves this journey
        <span class="research-pill">{{ brief.acceptance.length }} checks</span>
      </summary>
      <div class="research-detail-body research-reading">
        <ol class="research-copy">
          <li v-for="criterion in brief.acceptance" :key="criterion">
            {{ criterion }}
          </li>
        </ol>
      </div>
    </details>
    <details class="research-details">
      <summary>
        Still to prove or build
        <span class="research-pill">{{ brief.gaps.length }} gaps</span>
      </summary>
      <div class="research-detail-body research-reading">
        <ul class="research-copy">
          <li v-for="gap in brief.gaps" :key="gap">{{ gap }}</li>
        </ul>
      </div>
    </details>
    <details class="research-details">
      <summary>Technical sources and available tests</summary>
      <div class="research-detail-body">
        <p class="research-meta research-muted">
          Listed tests are available checks. This list does not record a passed
          run.
        </p>
        <ul class="research-meta research-muted">
          <li
            v-for="path in sourcePaths"
            :key="path"
            class="research-source-path"
          >
            <code>{{ path }}</code>
          </li>
        </ul>
        <p v-if="!brief.checks.length" class="research-copy research-muted">
          Journey checks still need to be established.
        </p>
      </div>
    </details>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ResearchDeliveryBrief } from '../../../../config/app/search-demand'
const props = defineProps<{ brief: ResearchDeliveryBrief; workspace: string }>()
const sourcePaths = computed(() => [
  ...new Set(
    [...props.brief.tools, ...props.brief.services]
      .flatMap((entry) => entry.source_paths)
      .concat(
        (props.brief.configuration ?? []).flatMap(
          (entry) => entry.source_paths
        ),
        props.brief.checks
      )
  ),
])
</script>
<style scoped src="./reading.css"></style>
