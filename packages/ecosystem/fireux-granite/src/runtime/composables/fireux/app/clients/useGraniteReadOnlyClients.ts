import { computed } from 'vue'
import {
  getReadOnlyPortfolioScenarios,
} from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/read-only-scenarios/index'

type ClientPortfolio = {
  id: string
  name: string
  region_label: string
  strategy_label: string
  owner_label: string
  mode: 'read-only'
}

type ClientCard = {
  id: string
  display_name: string
  subtitle: string
  portfolios: ClientPortfolio[]
}

const normalizeKey = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

export const useGraniteReadOnlyClients = () => {
  const scenarios = computed(() => getReadOnlyPortfolioScenarios())

  const clients = computed<ClientCard[]>(() => {
    const byClient = new Map<string, ClientCard>()

    for (const scenario of scenarios.value) {
      const ownerLabel = String(scenario.portfolio.owner_label || '').trim() || 'Unknown client'
      const clientId = `client-${normalizeKey(ownerLabel) || normalizeKey(scenario.id)}`

      if (!byClient.has(clientId)) {
        byClient.set(clientId, {
          id: clientId,
          display_name: ownerLabel,
          subtitle: 'Read-only scenario client',
          portfolios: [],
        })
      }

      const client = byClient.get(clientId)
      if (!client) continue

      client.portfolios.push({
        id: scenario.id,
        name: String(scenario.portfolio.name || scenario.name || scenario.id).trim(),
        region_label: String(scenario.portfolio.region_label || '').trim(),
        strategy_label: String(scenario.portfolio.strategy_label || '').trim(),
        owner_label: ownerLabel,
        mode: 'read-only',
      })
    }

    return Array.from(byClient.values())
      .map((client) => ({
        ...client,
        portfolios: [...client.portfolios].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.display_name.localeCompare(b.display_name))
  })

  return { clients }
}
