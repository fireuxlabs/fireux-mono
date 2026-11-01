<template>
  <div
    v-if="kind === 'menu'"
    class="kitchen-offer-service-preview kitchen-offer-service-preview--menu"
    aria-label="Illustration of menu preparation"
  >
    <div class="kitchen-offer-source">
      <UIcon name="i-lucide-file-text" /><span>Your PDF or photos</span>
    </div>
    <UIcon class="kitchen-offer-preview-arrow" name="i-lucide-arrow-down" />
    <div class="kitchen-offer-menu-sheet">
      <span class="kitchen-offer-preview-caption">YOUR DIGITAL MENU</span>
      <h3>Something delicious.</h3>
      <p>Made for hungry guests.</p>
      <div class="kitchen-offer-menu-row">
        <span>Seasonal favourites</span><UIcon name="i-lucide-leaf" />
      </div>
      <div class="kitchen-offer-menu-row">
        <span>From the Kitchen</span><UIcon name="i-lucide-utensils" />
      </div>
      <div class="kitchen-offer-menu-row">
        <span>Something to drink</span><UIcon name="i-lucide-glass-water" />
      </div>
      <div class="kitchen-offer-preview-foot">
        <UIcon name="i-lucide-smartphone" /><span>Open. Browse. Enjoy.</span
        ><UIcon name="i-lucide-qr-code" />
      </div>
    </div>
  </div>
  <div
    v-else
    class="kitchen-offer-service-preview kitchen-offer-service-preview--orders"
    aria-label="Illustration of a Collection order progressing through the Kitchen"
  >
    <div class="kitchen-offer-order-heading">
      <UIcon name="i-lucide-shopping-bag" /><span
        >One order. Everyone in sync.</span
      >
    </div>
    <div class="kitchen-offer-order-ticket">
      <div class="kitchen-offer-ticket-title">
        <strong>Collection order</strong
        ><UBadge color="primary" variant="subtle">Accepted</UBadge>
      </div>
      <p>Your guest’s choices, ready for your team.</p>
      <div class="kitchen-offer-ticket-line" />
      <div class="kitchen-offer-ticket-line kitchen-offer-ticket-line--short" />
      <div class="kitchen-offer-order-progress">
        <span><UIcon name="i-lucide-check" />Received</span
        ><span><UIcon name="i-lucide-chef-hat" />Preparing</span
        ><span><UIcon name="i-lucide-shopping-bag" />Ready</span>
      </div>
    </div>
    <p class="kitchen-offer-preview-note">Customer page ↔ Kitchen Workspace</p>
  </div>
</template>
<script setup lang="ts">
defineProps<{ kind: 'menu' | 'collection' }>()
</script>
<style scoped>
.kitchen-offer-service-preview--menu {
  background:
    radial-gradient(
      ellipse at top right,
      color-mix(in srgb, var(--ui-primary) 16%, transparent),
      transparent 70%
    ),
    var(--ui-bg-elevated);
}
.kitchen-offer-source {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  color: var(--ui-text-muted);
}
.kitchen-offer-preview-arrow {
  display: block;
  margin: 1rem auto;
  color: var(--ui-primary);
}
.kitchen-offer-menu-sheet,
.kitchen-offer-order-ticket {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 1rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  box-shadow: 0 1.5rem 3rem color-mix(in srgb, var(--ui-text) 8%, transparent);
}
.kitchen-offer-menu-sheet {
  transform: rotate(-2deg);
}
.kitchen-offer-preview-caption {
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  font-weight: 700;
  color: var(--ui-primary);
}
.kitchen-offer-menu-sheet h3 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 650;
  letter-spacing: -0.04em;
  margin: 0.7rem 0 0.3rem;
  color: var(--ui-text-highlighted);
}
.kitchen-offer-menu-sheet p,
.kitchen-offer-order-ticket p {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin-bottom: 1.5rem;
}
.kitchen-offer-menu-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-top: 1px solid var(--ui-border);
  font-size: 0.9rem;
}
.kitchen-offer-preview-foot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ui-primary);
  font-size: 0.75rem;
  margin-top: 1rem;
}
.kitchen-offer-preview-foot > :last-child {
  margin-left: auto;
  font-size: 1.5rem;
}
.kitchen-offer-service-preview--orders {
  background:
    radial-gradient(
      ellipse at bottom left,
      color-mix(in srgb, var(--ui-primary) 13%, transparent),
      transparent 75%
    ),
    var(--ui-bg-elevated);
}
.kitchen-offer-order-heading {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}
.kitchen-offer-ticket-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.kitchen-offer-ticket-line {
  height: 0.5rem;
  width: 85%;
  background: var(--ui-bg-accented);
  border-radius: 1rem;
  margin: 0.75rem 0;
}
.kitchen-offer-ticket-line--short {
  width: 60%;
}
.kitchen-offer-order-progress {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  border-top: 1px solid var(--ui-border);
  margin-top: 2rem;
  padding-top: 1rem;
}
.kitchen-offer-order-progress span {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: var(--ui-primary);
}
.kitchen-offer-order-progress .iconify {
  font-size: 1.25rem;
}
.kitchen-offer-preview-note {
  text-align: center;
  color: var(--ui-text-muted);
  font-size: 0.75rem;
  margin-top: 1.5rem;
}
</style>
