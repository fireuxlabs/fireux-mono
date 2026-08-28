import type { DemandFamily } from './analysis'

export const foodDemandFamilies: DemandFamily[] = [
  {
    id: 'food-safety-haccp',
    title: 'Food safety and HACCP',
    confidence: 'strong',
    intents: ['learn', 'choose', 'perform', 'troubleshoot'],
    operatorJob: 'Run, evidence and review the controls that keep food safe.',
    interpretation:
      'Operators seek plans, templates, logs, checklists, inspection evidence and corrective-action records—not merely a compliance report.',
    boundary:
      'Requirements vary by jurisdiction. Generic guidance must not be presented as local legal advice.',
    gap: 'Research cooling, cooking, holding, receiving, calibration, cleaning and corrective actions independently by geography.',
    seeds: [
      {
        seed: 'restaurant haccp',
        suggestions: [
          'restaurant haccp plan',
          'restaurant haccp plan template',
          'restaurant haccp plan pdf',
          'restaurant haccp plan example',
          'haccp restaurant meaning',
        ],
      },
      {
        seed: 'restaurant food safety',
        suggestions: [
          'restaurant food safety guidelines',
          'restaurant food safety violations',
          'restaurant food safety certification',
          'restaurant food safety report',
          'restaurant food safety fridge storage',
        ],
      },
      {
        seed: 'restaurant temperature log',
        suggestions: [
          'restaurant temperature log template',
          'restaurant temperature log sheet',
          'restaurant temperature log app',
          'restaurant fridge temperature log template',
          'restaurant food temperature log',
        ],
      },
    ],
  },
  {
    id: 'allergens-nutrition',
    title: 'Allergens and nutrition',
    confidence: 'strong',
    intents: ['learn', 'perform', 'troubleshoot'],
    operatorJob:
      'Maintain reliable allergen and nutrition information as ingredients, recipes and menus change.',
    interpretation:
      'Suggested searches concentrate on allergen sheets, menus, lists, charts and nutrition calculators.',
    boundary:
      'Guest disclosure can be published from Kitchen evidence; medical guarantees remain out of scope.',
    gap: 'Research jurisdiction-specific allergen matrices, labels, cross-contact controls and nutrition calculation.',
    seeds: [
      {
        seed: 'restaurant allergen',
        suggestions: [
          'restaurant allergen sheet',
          'restaurant allergen menu',
          'restaurant allergen list template',
          'restaurant allergen information',
          'restaurant allergen chart',
        ],
      },
      {
        seed: 'restaurant nutrition calculator',
        suggestions: [
          'restaurant nutrition calculator',
          'restaurant food nutrition calculator',
          'free restaurant nutrition calculator',
        ],
      },
    ],
  },
  {
    id: 'cleaning-checklists',
    title: 'Cleaning, hygiene and daily checklists',
    confidence: 'strong',
    intents: ['learn', 'choose', 'perform'],
    operatorJob:
      'Make recurring opening, closing, cleaning and inspection work visible and accountable.',
    interpretation:
      'Template, printable, PDF, spreadsheet and app language exposes a recurring paper-to-digital workflow.',
    gap: 'Separate Kitchen hygiene from Front-of-House and general premises checklists.',
    seeds: [
      {
        seed: 'restaurant cleaning checklist',
        suggestions: [
          'restaurant cleaning checklist pdf free download',
          'restaurant cleaning checklist excel',
          'restaurant cleaning checklist template',
          'restaurant cleaning checklist printable',
        ],
      },
      {
        seed: 'restaurant kitchen checklist',
        suggestions: [
          'restaurant kitchen cleaning checklist',
          'restaurant kitchen closing checklist',
          'restaurant kitchen opening checklist',
          'restaurant kitchen inspection checklist',
          'restaurant kitchen daily checklist',
        ],
      },
      {
        seed: 'restaurant opening closing checklist',
        suggestions: [
          'restaurant opening and closing checklist pdf',
          'restaurant opening and closing checklist excel',
          'restaurant opening and closing checklist template',
        ],
      },
    ],
  },
  {
    id: 'inventory-stocktake',
    title: 'Inventory and stocktake',
    confidence: 'strong',
    intents: ['learn', 'compare', 'choose', 'perform'],
    operatorJob:
      'Know what is on hand, count it efficiently and act before the Kitchen runs short.',
    interpretation:
      'Software, system, app, spreadsheet, template and free-tool modifiers show both product-selection and immediate task demand.',
    gap: 'Research par levels, storage, transfers, expiry, variance, alerts and theoretical-versus-actual usage.',
    seeds: [
      {
        seed: 'restaurant inventory management',
        suggestions: [
          'restaurant inventory management software',
          'restaurant inventory management system',
          'restaurant inventory management app',
          'restaurant inventory management excel template',
          'restaurant inventory management free',
        ],
      },
      {
        seed: 'restaurant stocktake',
        suggestions: [
          'restaurant stocktake template',
          'restaurant stocktake app',
        ],
      },
    ],
  },
  {
    id: 'purchasing-receiving-suppliers',
    title: 'Purchasing, receiving and suppliers',
    confidence: 'moderate',
    intents: ['compare', 'choose', 'perform'],
    operatorJob:
      'Choose suppliers, place orders and verify that the right goods arrive in acceptable condition.',
    interpretation:
      'The exact operational categories are suggested, but this sample has less breadth than inventory or HACCP.',
    boundary:
      'Supplier identity is not purchasing activity; receiving also feeds stock and food-safety evidence.',
    gap: 'Research purchase orders, approvals, prices, invoices, discrepancies, lot traceability and receiving temperatures.',
    seeds: [
      {
        seed: 'restaurant purchasing software',
        suggestions: ['restaurant purchasing software'],
      },
      {
        seed: 'restaurant receiving checklist',
        suggestions: ['restaurant receiving checklist'],
      },
      {
        seed: 'restaurant supplier management',
        suggestions: ['restaurant supplier management'],
      },
    ],
  },
  {
    id: 'waste',
    title: 'Food waste',
    confidence: 'strong',
    intents: ['learn', 'choose', 'perform'],
    operatorJob: 'Record what was wasted, why it was wasted and what it cost.',
    interpretation:
      'Suggested searches span software, management, logs, templates, measurement, recycling and regulation.',
    gap: 'Separate spoilage, prep loss, overproduction, returned dishes and disposal while keeping one coherent waste record.',
    seeds: [
      {
        seed: 'restaurant food waste',
        suggestions: [
          'restaurant food waste app',
          'restaurant food waste management',
          'restaurant food waste log template',
          'restaurant food waste log',
          'restaurant food waste percentage',
          'restaurant food waste disposal regulations',
        ],
      },
    ],
  },
  {
    id: 'recipes-costing',
    title: 'Recipes, yields and costing',
    confidence: 'strong',
    intents: ['learn', 'compare', 'choose', 'perform'],
    operatorJob:
      'Standardise recipes, scale production and understand ingredient and dish cost.',
    interpretation:
      'Observed language joins recipe-costing software and templates with food-cost formula, percentage, calculator and spreadsheet demand.',
    boundary:
      'A recipe-cost estimate is not accounting profit; it depends on authoritative quantities, yields and purchase prices.',
    gap: 'Research sub-recipes, versioning, conversions, yield loss, portions, batch scaling and price-change impact.',
    seeds: [
      {
        seed: 'restaurant recipe costing',
        suggestions: [
          'restaurant recipe costing template',
          'restaurant recipe costing software',
        ],
      },
      {
        seed: 'restaurant food cost',
        suggestions: [
          'restaurant food cost formula',
          'restaurant food cost percentage',
          'restaurant food cost calculator',
          'restaurant food cost spreadsheet free',
          'restaurant food costing & inventory management',
        ],
      },
    ],
  },
]

