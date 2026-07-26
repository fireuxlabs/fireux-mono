<template>
  <div>
    <BookWithNatsPageIntro
      eyebrow="A direct line to your host"
      title="Talk to Nats."
      description="Questions before booking, something special for the trip, or simply not sure where to start? Send Nats a note."
    />

    <section class="contact">
      <div>
        <p class="contact__eyebrow">Personal, not a call centre</p>
        <h2>Your stay starts with a conversation.</h2>
      </div>
      <div class="contact__options">
        <NuxtLink to="/book">
          <UIcon name="i-lucide-calendar-days" />
          <span>
            <strong>Ask about dates</strong>
            Prepare a stay enquiry in a minute.
          </span>
          <UIcon name="i-lucide-arrow-up-right" />
        </NuxtLink>
        <button type="button" @click="copyContactNote">
          <UIcon name="i-lucide-message-circle" />
          <span>
            <strong>{{ copied ? 'Message copied' : 'Start a message' }}</strong>
            Copy a friendly opener for your preferred contact app.
          </span>
          <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" />
        </button>
        <p>
          Nats’ direct email or WhatsApp can be connected here as soon as the
          preferred contact detail is supplied.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'nats-default' })

const copied = ref(false)

async function copyContactNote() {
  await navigator.clipboard.writeText(
    'Hi Nats, I found your apartment on Book with Nats and would love to ask a question about staying.'
  )
  copied.value = true
}

useSeoMeta({
  title: 'Contact Nats | Book with Nats',
  description: 'Contact Nats directly about the apartment and your stay.',
})
</script>

<style scoped>
.contact {
  display: grid;
  grid-template-columns: minmax(18rem, 0.9fr) minmax(20rem, 1.1fr);
  gap: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 32));
  padding: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 36))
    clamp(calc(var(--spacing) * 5), 7vw, calc(var(--spacing) * 28));
}

.contact__eyebrow {
  color: var(--nats-rust);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.contact h2 {
  max-width: 12ch;
  margin: calc(var(--spacing) * 4) 0 0;
  font-family: var(--font-serif);
  font-size: clamp(2.8rem, 6vw, 5.5rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.contact__options {
  display: grid;
  align-content: start;
}

.contact__options a,
.contact__options button {
  display: grid;
  grid-template-columns: calc(var(--spacing) * 8) 1fr calc(var(--spacing) * 6);
  gap: calc(var(--spacing) * 4);
  align-items: center;
  padding: calc(var(--spacing) * 6) 0;
  border: 0;
  border-bottom: 1px solid var(--nats-line);
  background: transparent;
  color: var(--nats-ink);
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.contact__options span {
  display: grid;
  gap: 0.35rem;
  color: var(--nats-muted);
  font-size: 0.88rem;
}

.contact__options strong {
  color: var(--nats-ink);
  font-family: var(--font-serif);
  font-size: 1.45rem;
  font-weight: var(--font-weight-normal);
}

.contact__options > p {
  margin-top: calc(var(--spacing) * 6);
  color: var(--nats-muted);
  font-size: 0.82rem;
  line-height: 1.6;
}

@media (max-width: 44rem) {
  .contact {
    grid-template-columns: 1fr;
  }
}
</style>
