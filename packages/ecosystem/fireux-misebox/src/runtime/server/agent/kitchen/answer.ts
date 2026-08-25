import { createError, type H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import {
  extractFireuxAgentTip,
  fireuxAgentTipInstruction,
} from 'fireux-ai/runtime/agents/agent-tip'
import { writeKitchenAgentUsage } from 'fireux-kitchens/runtime/kitchen/server/ai/usage'
import { kitchenFoodSafetySearchDemand } from 'fireux-kitchens/runtime/kitchen/models/food-safety-search-demand'
import { kitchenIngredientsSearchDemand } from 'fireux-kitchens/runtime/kitchen/models/ingredients-search-demand'
import { kitchenInventorySearchDemand } from 'fireux-kitchens/runtime/kitchen/models/inventory-search-demand'
import { kitchenPurchasingSearchDemand } from 'fireux-kitchens/runtime/kitchen/models/purchasing-search-demand'
import { kitchenReceivingSearchDemand } from 'fireux-kitchens/runtime/kitchen/models/receiving-search-demand'
import { readKitchenAgentContext } from './context'
import type { KitchenAgentAccess, KitchenAgentRequest } from './types'
import {
  findMiseboxOperationAgent,
  findMiseboxWorkspaceAgent,
} from '../../../ai/workspace-agents'
import { buildKitchenCoordinatorContext } from './operations/coordinator'
import { buildDrinksAgentContext } from './operations/drinks'

const text = (value: unknown) => String(value ?? '').trim()

export async function answerKitchenAgent(
  event: H3Event,
  request: KitchenAgentRequest,
  access: KitchenAgentAccess
) {
  const ai = useFireuxAi(event)
  const context = await readKitchenAgentContext(access, request)
  const operation = request.operation || 'coordinator'
  const requestedAgent = request.operation
    ? findMiseboxOperationAgent('kitchen', operation)
    : undefined
  const agentName = requestedAgent?.name || 'KitchenAI'
  const toolCatalogue = (requestedAgent?.toolCatalogue || []).map((tool) => ({
    id: tool.id,
    label: tool.label,
    description: tool.description,
    status: tool.status,
    authority: tool.authority,
    approval: tool.approval,
  }))
  let operationContext: Record<string, unknown>
  if (!requestedAgent) {
    operationContext = buildKitchenCoordinatorContext(
      findMiseboxWorkspaceAgent('kitchen')?.operationAgents || []
    )
  } else if (operation === 'dishes') {
    operationContext = {
      operation: 'Dishes',
      authority: 'advisory',
      dishes: context.dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        image: dish.image,
        is_deal: dish.is_deal,
        is_flagship: dish.is_flagship,
      })),
      tool_catalogue: toolCatalogue,
      instruction:
        'Inspect only the supplied canonical Dish records. An empty image is direct evidence that an image is missing. Do not infer Recipe, Ingredient, cost, price, sales, allergen, stock or profitability facts that are not supplied. Use the Tool catalogue as capability language, preserve every status, and never present a requested Tool as executable.',
    }
  } else if (operation === 'drinks') {
    operationContext = buildDrinksAgentContext(context.dishes, toolCatalogue)
  } else if (operation === 'recipes') {
    operationContext = {
      operation: 'Recipes',
      authority: 'advisory',
      recipes: context.recipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
      })),
      tool_catalogue: toolCatalogue,
      instruction:
        'Inspect only the supplied canonical Recipe identity records. An empty description is direct evidence that the current Recipe description is missing. Do not infer Ingredients, quantities, method, yield, portions, cost, scaling, allergens or production readiness because those records are not supplied. Use the Tool catalogue as capability language, preserve every status, and never present a requested Tool as executable.',
    }
  } else if (operation === 'mise') {
    operationContext = {
      operation: 'Mise',
      authority: 'advisory',
      prep_tasks: context.miseTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        station: task.station,
        workflow_stage: task.workflow_stage,
        service_date: task.service_date,
        estimated_minutes: task.estimated_minutes,
        assignee_ids: task.assignee_ids,
        ingredient_ids: task.ingredient_ids,
        prep_item_ids: task.prep_item_ids,
        menu_id: task.menu_id,
        recipe_id: task.recipe_id,
        checklist: task.checklist,
        due_at: task.due_at,
        completed_at: task.completed_at,
        notes: task.notes,
      })),
      tool_catalogue: toolCatalogue,
      instruction:
        'Inspect only the supplied canonical Prep Task records. Status, priority, Station text, workflow stage, service date, estimates, assignments, references, checklist and timestamps are direct stored evidence. Do not invent quantities, Station or Team identity, demand, Recipe requirements, deadlines, completion, shortages or Waste. Use the Tool catalogue as capability language, preserve every status, and never present a requested Tool as executable.',
    }
  } else if (operation === 'food-safety') {
    operationContext = {
      operation: 'Food Safety',
      authority: 'research-only',
      operational_evidence: 'not-connected',
      research: {
        question: kitchenFoodSafetySearchDemand.question,
        method: kitchenFoodSafetySearchDemand.method,
        operator_jobs: kitchenFoodSafetySearchDemand.clusters.map(
          (cluster) => ({
            id: cluster.id,
            title: cluster.title,
            job: cluster.operatorJob,
            interpretation: cluster.interpretation,
          })
        ),
        conclusion: kitchenFoodSafetySearchDemand.conclusion,
      },
      tool_catalogue: toolCatalogue,
      instruction:
        'This is source research and proposed capability language, not live operational evidence, an approved Food Safety plan, jurisdiction-specific legal advice, or proof of compliance. No canonical plan, check, deviation, temperature, allergen, cleaning, or corrective-action records are supplied. Explain supported operator jobs and planned Tools, preserve every Tool status, and never claim a requested Tool can run. Do not invent readings, limits, schedules, hazards, missed checks, corrective actions, product disposition, or compliance conclusions.',
    }
  } else if (operation === 'stations') {
    operationContext = {
      operation: 'Stations',
      authority: 'advisory',
      stations: context.stations.map((station) => ({
        id: station.id,
        name: station.name,
        description: station.description,
        active: station.active,
        sort_order: station.sort_order,
      })),
      tool_catalogue: toolCatalogue,
      instruction:
        'Inspect only the supplied canonical Kitchen Station records. Name, description, active state and display order are direct stored evidence. An empty collection proves only that no Station record was supplied. Do not infer Dish routing, devices, readiness, completed checks, Team assignment or competency, Prep workload, Orders, performance, capacity or service state. Use the Tool catalogue as capability language, preserve every status, and never present a requested Tool as executable.',
    }
  } else if (operation === 'orders') {
    operationContext = {
      operation: 'Orders & Service',
      authority: 'advisory-read-only',
      privacy:
        'Customer identity, contact details, notes, pricing and payment are not supplied.',
      evidence_window: {
        order_limit: 40,
        item_limit_per_order: 40,
        exhaustive: false,
      },
      orders: context.orders,
      tool_catalogue: toolCatalogue,
      instruction:
        'Inspect only the supplied privacy-bounded canonical Kitchen Order fields. Order identity, stored lifecycle status, type, channel, requested and estimated timing, service references, non-customer fulfilment labels, item labels, quantities, checked state, and audit timestamps are direct evidence. The bounded record window is not proof of the complete historical collection, so do not make exhaustive totals. Do not infer payment, customer identity, allergens, preparation completion beyond stored status, delivery or handoff, Dish or Station routing, Recipe work, stock, cost, profitability, urgency, delay, performance, or causation. Preserve every Tool status, never present a requested Tool as executable, and never claim to have changed an Order.',
    }
  } else if (operation === 'inventory') {
    operationContext = {
      operation: 'Inventory',
      authority: 'research-only',
      operational_evidence: 'not-connected',
      research: {
        question: kitchenInventorySearchDemand.question,
        method: kitchenInventorySearchDemand.method,
        operator_jobs: kitchenInventorySearchDemand.clusters.map((cluster) => ({
          id: cluster.id,
          title: cluster.title,
          job: cluster.operatorJob,
          interpretation: cluster.interpretation,
        })),
        conclusion: kitchenInventorySearchDemand.conclusion,
      },
      tool_catalogue: toolCatalogue,
      instruction:
        'This is source research and proposed capability language, not live Inventory evidence. No canonical count session, physical observation, movement, level, par, reorder, expiry, variance or stock-value records are supplied. Explain the supported operator jobs and planned Tools, preserve every Tool status, and never claim a requested Tool can run. Do not invent quantities, units, locations, thresholds, prices, usage, shortages, variance, value, replenishment need or completed actions.',
    }
  } else if (operation === 'ingredients') {
    operationContext = {
      operation: 'Ingredients',
      authority: 'advisory-read-only',
      evidence_window: {
        ingredient_limit: 100,
        exhaustive: false,
      },
      ingredients: context.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        aliases: ingredient.aliases,
        category: ingredient.category,
        kind: ingredient.kind,
        status: ingredient.status,
        image_url: ingredient.image_url,
      })),
      unresolved_ingredient_ids: context.missingIngredientIds,
      research: {
        question: kitchenIngredientsSearchDemand.question,
        operator_jobs: kitchenIngredientsSearchDemand.clusters.map(
          (cluster) => ({
            id: cluster.id,
            title: cluster.title,
            job: cluster.operatorJob,
            interpretation: cluster.interpretation,
          })
        ),
        conclusion: kitchenIngredientsSearchDemand.conclusion,
      },
      tool_catalogue: toolCatalogue,
      instruction:
        'Inspect only the supplied canonical Ingredient identity records and unresolved Kitchen Ingredient links. Names, aliases, category, kind, status and image URL are direct stored evidence. The bounded record window is not proof of the complete collection. An unresolved id proves only that the selected Kitchen link did not resolve to a valid canonical Ingredient. No units, conversions, food facts, allergens, nutrition, Supplier offers, prices, receipt evidence, stock quantities, reorder policy, Recipe usage or Waste events are supplied. Use research only to explain operator jobs, preserve every Tool status, never present a requested Tool as executable, and never claim to have changed an Ingredient.',
    }
  } else if (operation === 'purchasing') {
    operationContext = {
      operation: 'Purchasing',
      authority: 'research-only',
      operational_evidence: 'not-connected',
      research: {
        question: kitchenPurchasingSearchDemand.question,
        method: kitchenPurchasingSearchDemand.method,
        operator_jobs: kitchenPurchasingSearchDemand.clusters.map(
          (cluster) => ({
            id: cluster.id,
            title: cluster.title,
            job: cluster.operatorJob,
            interpretation: cluster.interpretation,
          })
        ),
        conclusion: kitchenPurchasingSearchDemand.conclusion,
      },
      tool_catalogue: toolCatalogue,
      instruction:
        'This is source research and proposed capability language, not live Purchasing evidence. No canonical requirement, requisition, purchase order, approval, transmission or receipt records are supplied. Explain the supported operator jobs and planned Tools, preserve every Tool status, and never claim a requested Tool can run. Do not invent requirements, quantities, offers, prices, currencies, suppliers, approvals, orders, transmissions, deliveries or completed actions. Preserve explicit human approval before any external commitment.',
    }
  } else if (operation === 'receiving') {
    operationContext = {
      operation: 'Receiving',
      authority: 'research-only',
      operational_evidence: 'not-connected',
      research: {
        question: kitchenReceivingSearchDemand.question,
        method: kitchenReceivingSearchDemand.method,
        operator_jobs: kitchenReceivingSearchDemand.clusters.map((cluster) => ({
          id: cluster.id,
          title: cluster.title,
          job: cluster.operatorJob,
          interpretation: cluster.interpretation,
        })),
        conclusion: kitchenReceivingSearchDemand.conclusion,
      },
      tool_catalogue: toolCatalogue,
      instruction:
        'This is source research and proposed capability language, not live Receiving evidence. No canonical receipt, delivery line, inspection observation, discrepancy, disposition or Inventory-movement records are supplied. Explain the supported operator jobs and planned Tools, preserve every Tool status, and never claim a requested Tool can run. Keep ordered, delivered, inspected and accepted quantities distinct. Do not invent suppliers, orders, products, quantities, units, temperatures, condition, traceability, policies, limits, discrepancies, acceptance, rejection, holds, Inventory movements or completed actions. Preserve explicit operator approval before any disposition or downstream Inventory projection.',
    }
  } else if (operation === 'menus') {
    operationContext = {
      operation: 'Menus',
      authority: 'advisory',
      menu_manifest: context.menuManifest,
      context: context.menuContext || undefined,
      tool_catalogue: toolCatalogue,
      instruction:
        'Assess the current Menu shape from exact manifest counts and confirmed Menu context. Identify useful operational observations without inventing sales, popularity, profitability, ingredient, stock, or customer evidence. Use the Tool catalogue as capability language, preserve every status, and never present a requested Tool as executable.',
    }
  } else {
    operationContext = {
      operation: requestedAgent.operationSlug,
      authority: 'registration-only',
      operational_evidence: 'not-connected',
      context_providers: requestedAgent.contextProviders,
      tool_catalogue: toolCatalogue,
      instruction:
        'No authorized operational records are supplied for this capability. Explain only the registered capability and status-bearing Tool catalogue. Never substitute another capability context, present requested or building Tools as executable, invent live facts, or claim to have changed data.',
    }
  }
  const operationAgents = { [agentName]: operationContext }
  const response = await ai.generateText({
    appId: request.appId,
    task: 'summarise_text',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_summary',
      question: request.prompt,
      kitchen: {
        id: request.kitchenId,
        name: context.kitchenName,
        tagline: context.tagline,
        context: context.kitchenContext || undefined,
      },
      operation_agents: operationAgents,
    },
    context: {
      agent: 'KitchenAI',
      user_context: context.userContext || undefined,
      kitchen_context: context.kitchenContext || undefined,
      menu_context:
        operation === 'menus' ? context.menuContext || undefined : undefined,
      instruction: `Act as KitchenAI for the selected Kitchen and delegate this request to ${agentName}. Answer using only the supplied authorized Kitchen identity, confirmed context, named operation-agent scope, and its status-bearing Tool catalogue. Treat requested or building Tools as planned language that cannot run. Treat saved context as operator knowledge, not measured evidence. State when the records do not support a claim. Do not claim to have changed data. Be concise and conversational. ${fireuxAgentTipInstruction}`,
    },
  })
  const result = extractFireuxAgentTip(response.text, {
    agentId: 'KitchenAI',
    parentId: 'MiseboxAI',
  })
  const answer = text(result.answer)
  if (!response.ok || !answer) {
    throw createError({
      statusCode: response.disabled ? 503 : 502,
      statusMessage: response.reason || 'KitchenAI could not answer.',
    })
  }
  const usage = await writeKitchenAgentUsage({
    appId: request.appId,
    kitchenId: request.kitchenId,
    actorId: access.uid,
    agent: 'KitchenAI',
    task: 'answer_kitchen_question',
    provider: response.provider,
    model: response.model,
    usage: response.usage,
    tip: result.tip,
  })
  return {
    ok: true as const,
    answer,
    scope: {
      source:
        response.execution === 'simulator'
          ? ('simulator' as const)
          : response.execution === 'codex'
            ? ('codex' as const)
            : ('ai' as const),
      kitchenName: context.kitchenName,
      userContext: Boolean(context.userContext),
      kitchenContext: Boolean(context.kitchenContext),
      menuContext: Boolean(context.menuContext),
      menuCount: context.menuManifest.length,
      delegates: [agentName],
      tipRecorded: Boolean(result.tip),
      usage: { amount: usage.amount_label, currency: usage.currency },
    },
  }
}
