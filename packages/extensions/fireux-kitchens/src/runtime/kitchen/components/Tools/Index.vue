<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mx-auto grid max-w-5xl gap-8">
      <header class="grid gap-3">
        <NuxtLink
          to="/tools"
          class="w-fit text-sm font-semibold text-primary hover:underline"
          >Tools</NuxtLink
        >
        <h1 class="m-0 text-3xl font-semibold text-highlighted">
          Kitchen tools
        </h1>
        <p class="m-0 max-w-3xl text-muted">
          Workspace actions, callable Team tools and Menu workflow descriptions.
        </p>
      </header>
      <section v-for="group in groups" :key="group.title" class="grid gap-3">
        <div class="grid gap-1">
          <h2 class="m-0 text-xl font-semibold text-highlighted">
            {{ group.title }}
          </h2>
          <p class="m-0 text-sm text-muted">{{ group.description }}</p>
        </div>
        <ul class="m-0 grid gap-4 p-0">
          <li v-for="item in group.items" :key="item.id" class="list-none">
            <NuxtLink
              :to="item.to"
              class="group flex items-center justify-between gap-4 rounded-lg px-3 py-3 hover:bg-elevated"
            >
              <span class="grid gap-1">
                <span class="font-semibold text-highlighted">
                  {{ item.label }}
                </span>
                <span class="text-sm text-muted">{{ item.description }}</span>
                <code class="text-xs text-dimmed">{{ item.id }}</code>
                <span class="text-xs text-dimmed">
                  Capability family: {{ item.family }}
                </span>
              </span>
              <span
                class="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
              >
                {{ item.actionLabel }}
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="grid gap-3" aria-labelledby="menu-import-inventory">
        <div class="grid gap-1">
          <h2
            id="menu-import-inventory"
            class="m-0 text-xl font-semibold text-highlighted"
          >
            Menu import capability inventory
          </h2>
          <p class="m-0 text-sm text-muted">
            The implementation stages described by
            <code>{{ kitchenMenuImportFromSourceTool.id }}</code
            >.
          </p>
        </div>
        <ol class="m-0 grid gap-3 pl-5">
          <li
            v-for="step in kitchenMenuImportFromSourceTool.steps"
            :key="step.capability"
            class="pl-1"
          >
            <div class="grid gap-1">
              <code class="text-sm text-highlighted">
                {{ step.capability }}
              </code>
              <span class="text-sm text-muted">{{ step.role }}</span>
              <span class="text-xs text-dimmed">
                {{ step.classification }} · {{ step.status }}
              </span>
            </div>
          </li>
        </ol>
        <p class="m-0 text-xs leading-5 text-dimmed">
          No standalone merge primitive is registered. FireUX AI deliberately
          receives the owning domain's merge policy; Kitchen decides how menu
          sections and dishes combine.
        </p>
      </section>

      <section class="grid gap-3" aria-labelledby="menu-ai-context">
        <div class="grid gap-1">
          <h2
            id="menu-ai-context"
            class="m-0 text-xl font-semibold text-highlighted"
          >
            Menu workflow context
          </h2>
          <p class="m-0 text-sm text-muted">
            These describe the AI-assisted Workspace import workflow. They are
            not registered as standalone agent-callable tools.
          </p>
        </div>
        <article
          v-for="tool in kitchenMenuTools"
          :key="tool.id"
          class="grid gap-2 rounded-lg border border-default p-4"
        >
          <header class="grid gap-1">
            <h3 class="m-0 font-semibold text-highlighted">
              {{ tool.name }}
            </h3>
            <code class="text-xs text-dimmed">{{ tool.id }}</code>
          </header>
          <p class="m-0 text-sm leading-6 text-toned">
            {{ tool.ai.baked.purpose }}
          </p>
          <p class="m-0 text-xs leading-5 text-dimmed">
            Required: {{ tool.ai.runtime.required.join(', ') || 'none' }} ·
            optional: {{ tool.ai.runtime.optional.join(', ') || 'none' }}
          </p>
          <ul class="m-0 grid gap-1 pl-5 text-sm text-toned">
            <li
              v-for="constraint in tool.ai.baked.constraints"
              :key="constraint"
            >
              {{ constraint }}
            </li>
          </ul>
        </article>
      </section>

      <section class="grid gap-3" aria-labelledby="team-ai-context">
        <div class="grid gap-1">
          <h2
            id="team-ai-context"
            class="m-0 text-xl font-semibold text-highlighted"
          >
            Team tool AI context
          </h2>
          <p class="m-0 text-sm text-muted">
            These Team definitions have registered server executors. Agent-only
            actions are listed for reference, without a direct action link.
          </p>
        </div>
        <article
          v-for="tool in kitchenTeamTools"
          :key="tool.id"
          class="grid gap-2 rounded-lg border border-default p-4"
        >
          <header class="grid gap-1">
            <h3 class="m-0 font-semibold text-highlighted">
              {{ teamToolLabel(tool) }}
            </h3>
            <span class="text-xs text-muted">{{
              tool.surfaces.human === false
                ? 'Agent only'
                : 'Workspace and agent'
            }}</span>
            <code class="text-xs text-dimmed">{{ tool.id }}</code>
          </header>
          <p class="m-0 text-sm leading-6 text-toned">
            {{ tool.ai.baked.purpose }}
          </p>
          <p class="m-0 text-xs leading-5 text-dimmed">
            Required: {{ tool.ai.runtime.required.join(', ') || 'none' }} ·
            optional: {{ tool.ai.runtime.optional.join(', ') || 'none' }}
          </p>
          <ul class="m-0 grid gap-1 pl-5 text-sm text-toned">
            <li
              v-for="constraint in tool.ai.baked.constraints"
              :key="constraint"
            >
              {{ constraint }}
            </li>
          </ul>
        </article>
      </section>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import {
  kitchenTeamTools,
  kitchenTeamHumanTools,
} from '../../tools/team'
import {
  kitchenMenuCompoundTools,
  kitchenMenuDomainTools,
  kitchenMenuTools,
} from '../../../menu/tools/catalogue'

const [kitchenMenuImportFromSourceTool] = kitchenMenuCompoundTools

const operationalTools = kitchenTeamHumanTools.map((tool) => ({
  id: tool.id,
  label: tool.surfaces.human.label,
  description: tool.surfaces.human.description,
  family:
    'primitive' in tool && tool.primitive ? tool.primitive : 'workspace.team',
  to: '/workspace/kitchen/team',
  actionLabel: 'Open Team',
}))

const teamToolLabel = (tool: (typeof kitchenTeamTools)[number]) =>
  tool.surfaces.human === false
    ? tool.context.instruction
    : tool.surfaces.human.label

const groups = [
  {
    title: 'Operational tools',
    description: 'Open the Team workspace to review and perform these actions.',
    items: operationalTools,
  },
  {
    title: 'Menu tools',
    description:
      'Workflow stages available through the Menu import screen; these links do not execute them.',
    items: kitchenMenuDomainTools.map((tool) => ({
      id: tool.id,
      label: tool.name,
      description: tool.description,
      family: tool.family,
      to: '/workspace/kitchen/menus/create#import-menu',
      actionLabel: 'Open menu import',
    })),
  },
  {
    title: 'Compound workflows',
    description:
      'AI-assisted Workspace workflows with explicit human review and confirmation.',
    items: [
      ...kitchenMenuCompoundTools.map((tool) => ({
        id: tool.id,
        label: tool.name,
        description: tool.description,
        family: tool.family,
        to: '/workspace/kitchen/menus/create#import-menu',
        actionLabel: 'Open menu import',
      })),
    ],
  },
]


</script>
