<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
definePageMeta({ layout: 'landing' })
useAppLandingSeo({ title: 'One action, many interfaces · FireUX Patterns', description: 'How a domain-owned action keeps business rules and related writes together in FireUX.', path: '/patterns/one-action-many-interfaces' })
</script>

<template>
  <UContainer class="max-w-3xl py-12">
    <article class="space-y-8 text-base leading-relaxed [overflow-wrap:anywhere]">
      <NuxtLink to="/patterns" class="text-primary hover:underline">← FireUX Patterns</NuxtLink>
      <header class="space-y-4">
        <h1 class="fx-type-page-title text-3xl font-bold text-highlighted sm:text-4xl">One action, many interfaces</h1>
        <p class="text-xl text-muted">Keep business decisions with the action that owns them, wherever the request begins.</p>
      </header>
      <section class="space-y-3">
        <h2 class="text-2xl font-semibold">The problem</h2>
        <p>A button is an entrance to an operation. If every page independently decides who may act, which state changes are valid and which records to write, the same operation gradually acquires different meanings.</p>
        <p>Adding another interface then means reproducing those decisions—and remembering to repair every copy when a rule changes.</p>
      </section>
      <section class="space-y-3">
        <h2 class="text-2xl font-semibold">The FireUX approach</h2>
        <p>Give the operation a named, domain-owned action. The interface collects intent and displays the result. The action checks authority, applies domain rules and coordinates the writes needed to produce that result.</p>
        <p class="rounded-lg bg-elevated p-4 font-mono text-sm">Interface → action → domain rules and persistence → result</p>
        <p>Workspace, website, kiosk and AI are possible callers, not different owners of the business rule. Each caller still needs its own appropriate authentication and input boundary.</p>
      </section>
      <section class="space-y-3">
        <h2 class="text-2xl font-semibold">A real example: completing an Order</h2>
        <p>In Misebox, the Kitchen Order API delegates to <code>executeKitchenOrderAction</code>. That action validates the request and checks Kitchen operator access. Inside a guarded transaction, it reads the Order and asks the Order rules to construct the permitted change.</p>
        <p>When completing an Order, the same transaction creates its Sale and financial fact and updates the Order. A page does not independently declare the Order complete and then hope that a second write records the Sale.</p>
        <p>When the acceptance notification conditions are met, the action attempts a customer notification after the transaction commits. Today, notification failures are logged; there is no durable retry guarantee in that action. Keeping effects in one place makes that limitation visible—it does not automatically solve it.</p>
      </section>
      <section class="space-y-3">
        <h2 class="text-2xl font-semibold">What this does—and does not—prove</h2>
        <p>The Order implementation proves a thin API boundary, domain-owned execution and transactional related writes. It does not prove that every FireUX interface already calls this action. The current action also accepts an HTTP event for authorization; it is not a transport-independent service.</p>
        <p>This pattern does not require a workflow engine, a service class for every entity, or a standard folder scaffold. Simple record operations can stay simple. The useful boundary appears when an operation has authority, rules or coordinated effects that its callers must not duplicate.</p>
        <p>External systems need separate care. A database transaction cannot make a payment-provider request or email atomic. Reliable retries and recovery must be designed and verified for those operations; they are further work, not a benefit we can claim merely from this structure.</p>
      </section>
      <section class="space-y-3">
        <h2 class="text-2xl font-semibold">When to use it</h2>
        <ul class="list-disc space-y-2 pl-5">
          <li>Several interfaces need the same business operation.</li>
          <li>An operation must enforce authority and permitted state changes.</li>
          <li>Related records must change together.</li>
          <li>A page is coordinating persistence and follow-up effects itself.</li>
        </ul>
        <p>Start with one concrete action. Share mechanics only after real domains demonstrate the same need; keep domain decisions with their owner.</p>
      </section>
      <section class="space-y-3">
        <h2 class="text-2xl font-semibold">Origins and further reading</h2>
        <p>This article applies the <a href="https://www.martinfowler.com/eaaCatalog/serviceLayer.html" class="text-primary underline">Service Layer pattern by Randy Stafford</a>, catalogued on Martin Fowler’s website as part of <em>Patterns of Enterprise Application Architecture</em>. Its application boundary and coordination responsibilities inform our approach. The FireUX example, terminology and limitations here are our own interpretation.</p>
      </section>
      <section class="space-y-3 text-sm text-muted">
        <h2 class="text-xl font-semibold text-default">Implementation reference</h2>
        <p>For repository readers: Kitchen owns <code>kitchen/server/operations/orders/actions.ts</code> and its rule helper <code>transition.ts</code> in <code>fireux-kitchens</code>. The API adapter is <code>server/api/workspace/kitchen/orders/transition.post.ts</code>. Completion invariants are covered by <code>src/test/kitchen/order-completion-identity.test.mjs</code>.</p>
        <p>See the repository’s <code>docs/concepts/lasagne.md</code> and <code>docs/ai/gpt-context.md</code> for current ownership guidance. This explanatory article does not replace that guidance or establish a release claim.</p>
      </section>
    </article>
  </UContainer>
</template>
