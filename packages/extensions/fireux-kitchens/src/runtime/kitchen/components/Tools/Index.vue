<template>
  <UContainer>
    <div>
      <header>
        <NuxtLink to="/tools">Tools</NuxtLink>
        <h1>Kitchen tools</h1>
        <p>
          Workspace actions, callable Team tools and Menu workflow descriptions.
        </p>
      </header>
      <section v-for="group in groups" :key="group.title">
        <div>
          <h2>
            {{ group.title }}
          </h2>
          <p>{{ group.description }}</p>
        </div>
        <ul>
          <li v-for="item in group.items" :key="item.id">
            <NuxtLink :to="item.to">
              <span>
                <span>
                  {{ item.label }}
                </span>
                <span>{{ item.description }}</span>
                <code>{{ item.id }}</code>
                <span> Capability family: {{ item.family }} </span>
              </span>
              <span>
                {{ item.actionLabel }}
                <UIcon name="i-lucide-arrow-right" />
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section aria-labelledby="menu-import-inventory">
        <div>
          <h2 id="menu-import-inventory">Menu import capability inventory</h2>
          <p>
            The implementation stages described by
            <code>{{ kitchenMenuImportFromSourceTool.id }}</code
            >.
          </p>
        </div>
        <ol>
          <li
            v-for="step in kitchenMenuImportFromSourceTool.steps"
            :key="step.capability"
          >
            <div>
              <code>
                {{ step.capability }}
              </code>
              <span>{{ step.role }}</span>
              <span> {{ step.classification }} · {{ step.status }} </span>
            </div>
          </li>
        </ol>
        <p>
          No standalone merge primitive is registered. FireUX AI deliberately
          receives the owning domain's merge policy; Kitchen decides how menu
          sections and dishes combine.
        </p>
      </section>

      <section aria-labelledby="menu-ai-context">
        <div>
          <h2 id="menu-ai-context">Menu workflow context</h2>
          <p>
            These describe the AI-assisted Workspace import workflow. They are
            not registered as standalone agent-callable tools.
          </p>
        </div>
        <UCard
          as="article"
          :ui="{ body: 'fx-card-body-stack' }"
          v-for="tool in kitchenMenuTools"
          :key="tool.id"
        >
          <header class="fx-card-body-stack">
            <h3>
              {{ tool.name }}
            </h3>
            <code>{{ tool.id }}</code>
          </header>
          <p>
            {{ tool.ai.baked.purpose }}
          </p>
          <p>
            Required: {{ tool.ai.runtime.required.join(', ') || 'none' }} ·
            optional: {{ tool.ai.runtime.optional.join(', ') || 'none' }}
          </p>
          <ul>
            <li
              v-for="constraint in tool.ai.baked.constraints"
              :key="constraint"
            >
              {{ constraint }}
            </li>
          </ul>
        </UCard>
      </section>

      <section aria-labelledby="team-ai-context">
        <div>
          <h2 id="team-ai-context">Team tool AI context</h2>
          <p>
            These Team definitions have registered server executors. Agent-only
            actions are listed for reference, without a direct action link.
          </p>
        </div>
        <UCard
          as="article"
          :ui="{ body: 'fx-card-body-stack' }"
          v-for="tool in kitchenTeamTools"
          :key="tool.id"
        >
          <header class="fx-card-body-stack">
            <h3>
              {{ teamToolLabel(tool) }}
            </h3>
            <span>{{
              tool.surfaces.human === false
                ? 'Agent only'
                : 'Workspace and agent'
            }}</span>
            <code>{{ tool.id }}</code>
          </header>
          <p>
            {{ tool.ai.baked.purpose }}
          </p>
          <p>
            Required: {{ tool.ai.runtime.required.join(', ') || 'none' }} ·
            optional: {{ tool.ai.runtime.optional.join(', ') || 'none' }}
          </p>
          <ul>
            <li
              v-for="constraint in tool.ai.baked.constraints"
              :key="constraint"
            >
              {{ constraint }}
            </li>
          </ul>
        </UCard>
      </section>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { kitchenTeamTools, kitchenTeamHumanTools } from '../../tools/team'
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
      to: '/workspace/kitchen/food-and-drink/menus?create=1',
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
        to: '/workspace/kitchen/food-and-drink/menus?create=1',
        actionLabel: 'Open menu import',
      })),
    ],
  },
]
</script>
