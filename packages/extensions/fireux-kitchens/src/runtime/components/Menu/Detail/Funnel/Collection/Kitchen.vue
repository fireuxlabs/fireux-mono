<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Kitchen
    </h2>

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-chef-hat"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Contacting kitchen</strong>
        <span>Sending the basket for collection timing.</span>
      </div>
    </section>

    <div class="menu-order-dispatch__divider" />

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-clock"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Collection slot</strong>
        <span>The kitchen will set the ready time before payment.</span>
      </div>
    </section>
  </div>
</template>
