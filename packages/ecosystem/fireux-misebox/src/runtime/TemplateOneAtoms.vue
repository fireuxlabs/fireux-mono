<template>
  <div class="template-one-props">
    <section v-if="basicPresentation" class="basic-presentation">
      <header>
        <div>
          <small>Root · Basic</small>
          <h2>{{ basicPresentation.name }}</h2>
        </div>
        <code>{{ basicPresentation.slug }}</code>
      </header>
      <figure
        class="basic-identity"
        :style="{ backgroundColor: basicPresentation.placePrimaryColor }"
      >
        <img
          v-if="basicPresentation.placeImageSrc"
          class="basic-identity__place"
          :src="basicPresentation.placeImageSrc"
          :alt="`${basicPresentation.name} Place`"
        >
        <img
          v-else-if="basicPresentation.identityImageSrc"
          class="basic-identity__mark"
          :src="basicPresentation.identityImageSrc"
          :alt="basicPresentation.name"
        >
        <figcaption>
          <strong>{{ basicPresentation.name }}</strong>
          <span>Basic Kitchen identity</span>
        </figcaption>
      </figure>
      <dl class="basic-ledger">
        <div>
          <dt>Place image</dt>
          <dd>{{ presence(basicPresentation.placeImageSrc) }}</dd>
        </div>
        <div>
          <dt>Logo</dt>
          <dd>{{ presence(basicPresentation.logoImageSrc) }}</dd>
        </div>
        <div>
          <dt>Wordmark</dt>
          <dd>{{ presence(basicPresentation.wordmarkImageSrc) }}</dd>
        </div>
        <div>
          <dt>Place primary</dt>
          <dd>
            {{ basicPresentation.placePrimaryColor }} ·
            {{ sourceLabel(basicPresentation.placePrimaryColorSource) }}
          </dd>
        </div>
      </dl>
    </section>

    <section v-else class="place-presentation">
      <header>
        <div>
          <small>{{ rootLevelLabel }}</small>
          <h2>{{ injection.name }}</h2>
        </div>
        <code>{{ injection.rootProps.placePrimaryColor }}</code>
      </header>
      <figure
        class="media-backdrop"
        :style="{ backgroundColor: injection.rootProps.placePrimaryColor }"
      >
        <figcaption>Place primary colour</figcaption>
      </figure>
    </section>

    <section class="sample-menu">
      <header>
        <div>
          <p>{{ rootPresentationLabel }}</p>
          <small>Out-of-box Menu</small>
        </div>
        <small>Shared sample content</small>
      </header>
      <div class="fireux-menu-detail template-one-menu-preview">
        <MenuBrowseCatalogue
          currency-code="CHF"
          currency-format="dash"
          :copy="menuCopy"
          :sections="menu.sections"
          :show-currency="true"
        />
      </div>
    </section>

    <section v-if="injection.consoleProps" class="console-theme">
      <header>
        <div>
          <small>{{ consoleLevelLabel }}</small>
          <p>Theme applied</p>
          <small>{{ injection.consoleProps.source }}</small>
        </div>
        <small>Same shared sample content</small>
      </header>
      <ul>
        <li v-for="value in injection.consoleProps.values" :key="value">
          {{ value }}
        </li>
      </ul>
      <div
        class="fireux-menu-detail template-one-menu-preview"
        :class="consoleThemeClassName"
        :style="consoleThemeStyleVars"
      >
        <MenuBrowseCatalogue
          currency-code="CHF"
          currency-format="dash"
          :copy="menuCopy"
          :sections="menu.sections"
          :show-currency="true"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MenuBrowseCatalogue from 'fireux-kitchens/runtime/components/Menu/Browse/Catalogue.vue'
import { resolveMenuBrowseSurfaceCopy } from 'fireux-kitchens/runtime/content/menu-surface-copy'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import type {
  TemplateOneKitchenSpecimen,
  TemplateOneMenuSample,
} from './template-one'
import type { MiseboxKitchenBasicPresentation } from './kitchen-basic-presentation'
const props = defineProps<{
  injection: TemplateOneKitchenSpecimen
  menu: TemplateOneMenuSample
  basicPresentation?: MiseboxKitchenBasicPresentation | null
}>()
const presence = (value?: string) => value ? 'Present' : 'Missing'
const sourceLabel = (
  value: MiseboxKitchenBasicPresentation['placePrimaryColorSource']
) => value === 'projected' ? 'Authored' : 'Misebox default'
const menuCopy = resolveMenuBrowseSurfaceCopy()
const rootLevelLabel = computed(() =>
  props.injection.tier === 'root' ? 'Root' : 'Inherited · Root'
)
const rootPresentationLabel = computed(() =>
  props.injection.tier === 'root'
    ? 'Root presentation'
    : 'Inherited Root presentation'
)
const consoleLevelLabel = computed(() =>
  props.injection.tier === 'app' ? 'Inherited · Console' : 'Console'
)
const consolePageStyle = computed(() => props.injection.consoleProps?.pageStyle)
const {
  className: consoleThemeClassName,
  styleVars: consoleThemeStyleVars,
} = useMenuThemeSurface({
  pageStyle: consolePageStyle,
  colorMode: 'light',
})
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
header p {
  margin: 0;
  font-weight: var(--font-weight-extrabold);
}
small {
  color: var(--ui-text-muted);
  line-height: var(--leading-relaxed);
}
figure {
  display: grid;
  gap: calc(var(--spacing) * 3);
  margin: 0;
}
.place-presentation > header,
.basic-presentation > header,
.sample-menu > header,
.console-theme > header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}
.place-presentation h2,
.basic-presentation h2,
.console-theme h2 {
  margin: calc(var(--spacing) * 1) 0 0;
  font-size: var(--text-2xl);
}
.place-presentation code {
  color: var(--ui-text-muted);
}
figcaption {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.media-backdrop {
  min-height: calc(var(--spacing) * 36);
  padding: calc(var(--spacing) * 4);
  border: 1px solid color-mix(in srgb, white 22%, transparent);
}
.media-backdrop figcaption {
  width: fit-content;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  color: white;
  background: rgb(0 0 0 / 62%);
}
.basic-identity {
  position: relative;
  min-height: clamp(18rem, 48vw, 30rem);
  background: var(--ui-bg-muted);
  overflow: hidden;
}
.basic-identity__place {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.basic-identity__mark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(46%, 18rem);
  max-height: 52%;
  object-fit: contain;
  transform: translate(-50%, -58%);
}
.basic-identity::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 35%, rgb(0 0 0 / 72%));
  content: '';
}
.basic-identity figcaption {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: end;
  min-height: inherit;
  padding: clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 10));
  color: white;
}
.basic-identity figcaption strong {
  font-size: clamp(var(--text-3xl), 7vw, var(--text-6xl));
  line-height: 1;
}
.basic-identity figcaption span {
  margin-top: calc(var(--spacing) * 2);
  color: color-mix(in srgb, white 72%, transparent);
}
.basic-ledger {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1px;
  margin: 0;
  background: var(--ui-border);
  border: 1px solid var(--ui-border);
}
.basic-ledger > div {
  display: grid;
  gap: calc(var(--spacing) * 1.5);
  padding: calc(var(--spacing) * 4);
  background: var(--ui-bg);
}
.basic-ledger dt {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}
.basic-ledger dd {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-weight: var(--font-weight-semibold);
}
.console-theme ul {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.console-theme li {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  color: var(--ui-text-muted);
  background: var(--ui-bg-muted);
  border-radius: var(--ui-radius);
  font-size: var(--text-xs);
}
.template-one-menu-preview {
  width: 100%;
  min-height: auto;
  padding: clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 8));
}
@media (max-width: 40rem) {
  .place-presentation > header,
  .basic-presentation > header,
  .sample-menu > header,
  .console-theme > header {
    align-items: start;
    flex-direction: column;
  }
}
</style>
