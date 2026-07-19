<template>
  <section class="space-y-4">
    <header
      class="flex items-center gap-2 text-base font-semibold text-highlighted"
    >
      <UIcon name="i-lucide-award" class="h-5 w-5 text-dimmed" />
      <h2>Certifications</h2>
    </header>

    <div class="space-y-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-default p-4 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="item.logo"
            :src="item.logo"
            :alt="item.name || 'Certification logo'"
            class="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
          />

          <div class="flex-1 space-y-2">
            <div class="space-y-1">
              <h3
                class="text-lg font-semibold text-highlighted"
              >
                {{ item.name }}
              </h3>
              <p
                v-if="item.issuer"
                class="text-sm text-muted"
              >
                {{ item.issuer }}
              </p>
            </div>

            <p
              v-if="item.year"
              class="text-sm text-muted"
            >
              Issued {{ item.year }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CertificationItem {
  id: string
  name: string | null
  issuer: string | null
  year: string | null
  logo: string | null
}

defineProps<{ items: CertificationItem[] }>()
</script>
