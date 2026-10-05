import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const industryObservations: AppSearchDemand['observations'] = [
  {
    id: 'swiss-demand-2026',
    source: 'operator-survey',
    query: 'Swiss restaurant demand in Q2 2026',
    geography: 'Switzerland',
    language: 'German',
    observed_at: '2026-10-05',
    source_url:
      'https://gastrosuisse.ch/de/branchenwissen/zahlen-und-trends/aktuelle-geschaeftslage/konjunkturkof',
    finding:
      'Provisional restaurant results report revenue down 4.5% year on year and insufficient demand as an obstacle for 53.9% of surveyed restaurant businesses.',
    limitations:
      'Sector survey; provisional Q2 data. It does not establish demand for Misebox or prove that online ordering attracts additional customers.',
    period: 'Q2 2026',
  },
  {
    id: 'independent-operators-2026',
    source: 'operator-survey',
    query: 'Independent restaurant costs, staffing and technology adoption',
    geography: 'United States',
    language: 'English',
    observed_at: '2026-10-05',
    source_url:
      'https://www.jamesbeard.org/impact/research-and-reports/2026-independent-restaurant-industry-report',
    finding:
      'Public findings from over 380 independent operators describe cost pressure, staffing difficulties and integration challenges. Moderate intentional technology adoption is associated with stronger performance.',
    limitations:
      'Public report summary only; US operators are comparative evidence. Associations are not causal effects or Swiss willingness-to-pay evidence.',
    period: '2026 report',
  },
  {
    id: 'swiss-chef-work',
    source: 'operational-guidance',
    query: 'Professional kitchen planning, purchasing, preparation and hygiene',
    geography: 'Switzerland',
    language: 'German',
    observed_at: '2026-10-05',
    source_url: 'https://www.berufsberatung.ch/de/berufe/koch-koechin-efz',
    finding:
      'The professional role includes menu planning, purchasing quantities, receiving and storing goods, preparation, coordination and hygiene.',
    limitations:
      'Occupational responsibilities establish jobs, not software purchase intent. Restaurants, hotels and institutional kitchens have different needs.',
  },
  {
    id: 'swiss-self-control',
    source: 'regulatory-guidance',
    query: 'Food-business self-control responsibilities',
    geography: 'Switzerland',
    language: 'German',
    observed_at: '2026-10-05',
    source_url:
      'https://gastrosuisse.ch/de/branchenwissen/hygiene-und-lebensmittelsicherheit/selbstkontrolle',
    finding:
      'Industry guidance describes responsible people, good practice, HACCP-based controls, traceability, recall and documentation.',
    limitations:
      'Industry guidance is not a complete jurisdiction-specific compliance assessment. Existing records may meet the job without a new application.',
  },
  {
    id: 'swiss-allergens',
    source: 'regulatory-guidance',
    query: 'Dependable allergen information during preparation and service',
    geography: 'Switzerland',
    language: 'German',
    observed_at: '2026-10-05',
    source_url:
      'https://gastrosuisse.ch/de/branchenwissen/hygiene-und-lebensmittelsicherheit/allergene-lebensmittel',
    finding:
      'Guidance connects ingredient information, staff knowledge, purchasing, preparation and customer communication.',
    limitations:
      'Ingredient labels alone do not establish safe preparation or account for cross-contamination. Product design requires current local requirements and operator validation.',
  },
  {
    id: 'inventory-workflows',
    source: 'product-documentation',
    query: 'Stock, production and purchasing workflow boundaries',
    geography: 'International product documentation',
    language: 'English',
    observed_at: '2026-10-05',
    source_url:
      'https://k-series-support.lightspeedhq.com/hc/en-us/articles/4407517428891-About-Inventory',
    finding:
      'The product distinguishes quantities held and counted, recipes and production batches, and suppliers, purchases and receiving.',
    limitations:
      'Vendor documentation shows an existing workflow design, not independent prevalence, adoption or guaranteed return on investment.',
  },
  {
    id: 'purchasing-workflows',
    source: 'product-documentation',
    query: 'Supplier terms, purchase orders and goods receiving',
    geography: 'DACH product documentation',
    language: 'German',
    observed_at: '2026-10-05',
    source_url:
      'https://www.gastronovi.com/produkte/warenkreislauf/einkaufssystem/',
    finding:
      'The product connects supplier prices, pack sizes and delivery terms with purchasing and receiving.',
    limitations:
      'Commercial product documentation demonstrates supply, not measured demand or confirmed integration fit for Misebox.',
  },
  {
    id: 'waste-measurement-case',
    source: 'operator-case-study',
    query: 'Food-waste measurement and operational changes at Kursaal Bern',
    geography: 'Switzerland',
    language: 'German',
    observed_at: '2026-10-05',
    source_url:
      'https://united-against-waste.ch/kooperation-statt-kompromiss-im-grossbetrieb/',
    finding:
      'The published large-operation case reports a 22% waste reduction between measurement rounds alongside preparation and service changes.',
    limitations:
      'Provider-reported case at a large venue; not a controlled study or representative outcome for small restaurants. No guaranteed savings.',
  },
]

export const industryClusterSources: Record<string, string[]> = {
  menus: ['swiss-demand-2026', 'swiss-chef-work', 'swiss-allergens'],
  'orders-service': ['swiss-demand-2026', 'independent-operators-2026'],
  'recipes-costing': [
    'independent-operators-2026',
    'swiss-chef-work',
    'inventory-workflows',
  ],
  'inventory-stocktake': ['swiss-chef-work', 'inventory-workflows'],
  'purchasing-receiving-suppliers': ['swiss-chef-work', 'purchasing-workflows'],
  'mise-production': ['swiss-chef-work', 'inventory-workflows'],
  'food-safety-haccp': ['swiss-self-control'],
  'allergens-nutrition': ['swiss-allergens'],
  'cleaning-checklists': ['swiss-self-control', 'swiss-chef-work'],
  waste: ['waste-measurement-case', 'swiss-chef-work'],
  'reports-analysis': ['independent-operators-2026'],
  'team-training': ['swiss-chef-work', 'independent-operators-2026'],
  'formats-scale': ['swiss-chef-work'],
}
