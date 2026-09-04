import { kitchenCapabilities } from './capabilities'

export type WasteAIContext = {
  source: 'temporary-development-context'
  summary: string
  promptSuggestions: readonly string[]
  devContext: {
    title: string
    headline: string
    description: string
    literatureIntroduction: string
    keywords: readonly string[]
    literatureSummary: string
    needs: readonly string[]
  }
}

const wasteOperation = kitchenCapabilities.find(
  (operation) => operation.slug === 'waste'
)

if (!wasteOperation) throw new Error('Waste operation is not registered.')

export const wasteAIContext: WasteAIContext = {
  source: 'temporary-development-context',
  summary:
    'Restaurant waste can come from spoilage, preparation loss, overproduction, and returned food. Recording the item, quantity, reason, source, and authoritative cost helps operators see patterns before changing purchasing or preparation.',
  promptSuggestions: ['Ask WasteAI to say hello'],
  devContext: {
    title: wasteOperation.title,
    headline: wasteOperation.headline,
    description: wasteOperation.description,
    literatureIntroduction: `These searches guide problem research, product literature, records, tools, and workflows for ${wasteOperation.headline}.`,
    keywords: wasteOperation.keywords,
    literatureSummary: wasteOperation.guidingLiterature.summary,
    needs: wasteOperation.guidingLiterature.needs,
  },
}
