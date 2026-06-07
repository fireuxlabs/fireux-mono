<template>
  <footer v-if="!chromeHidden" class="misebox-tenant-footer">
    <UPopover
      v-model:open="open"
      :popper="{ placement: 'top' }"
    >
      <button
        type="button"
        class="misebox-tenant-footer__powered"
        aria-label="Open Misebox links"
      >
        <span>Powered by</span>
        <img
          src="/img/ecosystem/wordmark-light.svg"
          alt="Misebox"
          class="misebox-tenant-footer__wordmark"
        >
      </button>

      <template #content>
        <UCard class="misebox-tenant-footer__callout">
          <div class="misebox-tenant-footer__callout-copy">
            <p class="misebox-tenant-footer__callout-eyebrow">
              Misebox
            </p>
            <h2>Venue tools and operator access.</h2>
            <p>
              Guests can visit Misebox. Head chefs and team members can sign in
              to the operator console.
            </p>
          </div>

          <div class="misebox-tenant-footer__actions">
            <UButton
              :to="miseboxHomeUrl"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-ph-globe"
            >
              Visit Misebox
            </UButton>
            <UButton
              :to="tenantConsoleTo"
              size="sm"
              icon="i-ph-chef-hat"
            >
              Operator console
            </UButton>
          </div>
        </UCard>
      </template>
    </UPopover>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMiseboxTenantChrome } from '../../../composables/fireux/app/useMiseboxTenantChrome'

const miseboxHomeUrl = 'https://misebox.app'
const tenantConsoleTo = `/auth?redirect=${encodeURIComponent('/console/kitchen')}`
const open = ref(false)
const { chromeHidden } = useMiseboxTenantChrome()
</script>

<style scoped>
.misebox-tenant-footer {
  position: absolute;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1rem, 3vw, 2rem);
  left: clamp(1rem, 3vw, 2rem);
  z-index: 2;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.misebox-tenant-footer__powered {
  border: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;
  padding: 0.4rem 0.15rem;
  background: transparent;
  color: var(--brand-canvas, white);
  cursor: pointer;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  line-height: 1;
  text-decoration: none;
  text-transform: uppercase;
  text-shadow: 0 0.2rem 1.4rem rgb(42 14 7 / 70%);
  opacity: 0.9;
  pointer-events: auto;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.misebox-tenant-footer__powered:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.misebox-tenant-footer__wordmark {
  display: block;
  width: auto;
  height: 1.05rem;
  filter: drop-shadow(0 0.2rem 1.4rem rgb(42 14 7 / 60%));
}

.misebox-tenant-footer__callout {
  width: min(21rem, calc(100vw - 2rem));
}

.misebox-tenant-footer__callout-copy {
  display: grid;
  gap: 0.35rem;
}

.misebox-tenant-footer__callout-copy h2,
.misebox-tenant-footer__callout-copy p {
  margin: 0;
}

.misebox-tenant-footer__callout-copy h2 {
  color: var(--ui-text-highlighted);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.misebox-tenant-footer__callout-copy p {
  color: var(--ui-text-muted);
  font-size: 0.85rem;
  line-height: 1.55;
}

.misebox-tenant-footer__callout-eyebrow {
  color: var(--ui-primary) !important;
  font-size: 0.68rem !important;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.misebox-tenant-footer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 1rem;
}
</style>
