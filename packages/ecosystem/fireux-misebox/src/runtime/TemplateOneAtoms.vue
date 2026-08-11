<template>
  <div
    class="template-one-props"
    :style="themeStyle"
    :data-kitchen-tier="injection.tier"
  >
    <section>
      <header>
        <p>Root props</p>
        <span>{{ injection.tier }}</span>
      </header>
      <dl>
        <div>
          <dt>primary_color</dt>
          <dd>{{ injection.rootProps.palette.primary_color }}</dd>
        </div>
        <div>
          <dt>secondary_color</dt>
          <dd>{{ injection.rootProps.palette.secondary_color }}</dd>
        </div>
      </dl>
      <small>{{ injection.rootProps.source }}</small>
    </section>

    <section>
      <header><p>Console props</p></header>
      <template v-if="injection.consoleProps">
        <ul>
          <li v-for="value in injection.consoleProps.values" :key="value">
            {{ value }}
          </li>
        </ul>
        <small>{{ injection.consoleProps.source }}</small>
      </template>
      <p v-else class="empty">
        This Kitchen is Root-managed, so there are no Console props to display.
      </p>
    </section>

    <section>
      <header><p>App props</p></header>
      <template v-if="injection.appProps">
        <dl>
          <div>
            <dt>template</dt>
            <dd>{{ injection.appProps.template }}</dd>
          </div>
        </dl>
        <p>{{ injection.appProps.note }}</p>
        <small>{{ injection.appProps.source }}</small>
      </template>
      <p v-else class="empty">
        This Kitchen is only
        {{ injection.tier === 'root' ? 'Root' : 'Console' }}, so there are no
        App props to display.
      </p>
    </section>

    <section>
      <header><p>Root atom</p></header>
      <figure>
        <hr />
        <figcaption>{{ injection.atoms.rule.label }}</figcaption>
      </figure>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TemplateOneBrandInjection } from './template-one'
const props = defineProps<{ injection: TemplateOneBrandInjection }>()
const themeStyle = computed(() => ({
  '--template-primary': props.injection.rootProps.palette.primary_color,
  '--template-secondary': props.injection.rootProps.palette.secondary_color,
}))
</script>

<style scoped>
.template-one-props {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
section {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5);
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}
header {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  align-items: center;
}
header p {
  margin: 0;
  font-weight: var(--font-weight-extrabold);
}
header span {
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2);
  color: var(--template-secondary);
  font-size: var(--text-xs);
  background: var(--template-primary);
  border-radius: 9999px;
  text-transform: uppercase;
}
dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 2);
  margin: 0;
}
dl > div {
  padding: calc(var(--spacing) * 3);
  background: var(--ui-bg-muted);
}
dt {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}
dd {
  margin: calc(var(--spacing) * 1) 0 0;
  font-family: var(--font-mono);
  font-weight: var(--font-weight-bold);
}
ul {
  display: grid;
  gap: calc(var(--spacing) * 2);
  margin: 0;
  padding-left: calc(var(--spacing) * 5);
}
small,
.empty {
  color: var(--ui-text-muted);
  line-height: var(--leading-relaxed);
}
.empty {
  margin: 0;
}
figure {
  display: grid;
  gap: calc(var(--spacing) * 3);
  margin: 0;
}
hr {
  width: 100%;
  margin: calc(var(--spacing) * 6) 0;
  border: 0;
  border-top: 2px solid var(--template-primary);
}
figcaption {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
@media (max-width: 40rem) {
  dl {
    grid-template-columns: 1fr;
  }
}
</style>
