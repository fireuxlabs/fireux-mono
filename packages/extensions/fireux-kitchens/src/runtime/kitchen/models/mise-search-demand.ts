export type KitchenMiseToolHypothesis = {
  id: `kitchen.mise.${string}`
  label: string
  layer: 'human' | 'ai-assisted' | 'compound'
  purpose: string
  inputs: readonly string[]
  outputs: readonly string[]
  evidence: readonly string[]
  authority: string
  approval: string
  status: 'available' | 'requested'
}

export const kitchenMiseSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do with Mise and prep?',
  method: 'Current search results establish operator language. Independent prep-list and food-production literature validates the jobs. Tool status is then reconciled with the current Kitchen capability source.',
  seeds: [
    { seed: 'restaurant prep list', queries: ['restaurant prep list app', 'restaurant prep list template', 'digital kitchen prep list', 'daily restaurant prep checklist'] },
    { seed: 'kitchen prep management', queries: ['kitchen prep management software', 'kitchen prep task app', 'restaurant prep task management', 'prep list for chefs'] },
    { seed: 'mise en place', queries: ['mise en place checklist', 'mise en place list template', 'restaurant mise en place list', 'kitchen station prep list'] },
    { seed: 'restaurant production planning', queries: ['restaurant production planning', 'restaurant prep quantity calculator', 'restaurant prep forecasting', 'par based prep list'] },
  ],
  clusters: [
    { id: 'define', title: 'Define today’s preparation work', operatorJob: 'List each prep item, target quantity, unit, due time and useful instructions.', evidenceQueries: ['restaurant prep list template', 'mise en place list template'], interpretation: 'A prep task is working intent for a period, not the Recipe definition it may reference.' },
    { id: 'calculate', title: 'Calculate how much to prepare', operatorJob: 'Turn expected demand, Recipes, current prepared stock and pars into reviewable targets.', evidenceQueries: ['restaurant prep quantity calculator', 'par based prep list'], interpretation: 'Forecast and prep target are different deductions; the chef must be able to override a proposed quantity.' },
    { id: 'assign', title: 'Route prep by Station and person', operatorJob: 'Group work where it will be performed and make responsibility clear.', evidenceQueries: ['kitchen station prep list', 'restaurant prep task management'], interpretation: 'Mise assigns planned preparation; Orders owns live ordered-item routing during service.' },
    { id: 'track', title: 'Track readiness and blockers', operatorJob: 'Move work through to do, in progress, done or blocked and retain who changed it.', evidenceQueries: ['digital kitchen prep list', 'kitchen prep task app'], interpretation: 'Status is operational evidence only when actor and time are retained.' },
    { id: 'learn', title: 'Improve the next prep plan', operatorJob: 'Compare planned, completed, service and Waste evidence without hiding uncertainty.', evidenceQueries: ['restaurant prep forecasting', 'restaurant production planning'], interpretation: 'Mise may learn from Orders and Waste, but does not own sales forecasting or Waste records.' },
  ],
  validationSources: [
    { label: 'Institute of Child Nutrition mise en place template', url: 'https://theicn.org/cicn/resources/159/basic-food-prep-skills/109903/how-to-develop-a-mise-en-place-list.pdf', note: 'Validates a structured mise en place list as a distinct kitchen working artefact.' },
    { label: 'Pearson kitchen production chapter', url: 'https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/013474506X.pdf', note: 'Validates production planning from menus, forecasts, on-hand product and station control sheets.' },
    { label: 'FusionPrep prep-list product description', url: 'https://www.fusionprep.com/restaurant-prep-list-app', note: 'Validates par levels, on-hand counts, recipe scaling, assignments and completion as current market language.' },
  ],
  records: [
  {
    id: 'kitchen.mise.task',
    label: 'Mise task',
    kind: 'owned',
    status: 'available',
    owner: 'Mise',
    authority: 'Mise owns the time-bound preparation task, its workflow state, quantity context and responsibility.',
    facts: [
      'task identity and description',
      'status and priority',
      'workflow stage and due context',
      'quantity, Station and assignee references',
      'audit stamps'
    ],
    readBy: [ 'kitchen.mise.update-prep-task', 'kitchen.mise.change-prep-status', 'kitchen.mise.delete-prep-task' ],
    writtenBy: [
      'kitchen.mise.create-prep-task',
      'kitchen.mise.update-prep-task',
      'kitchen.mise.change-prep-status',
      'kitchen.mise.delete-prep-task'
    ]
  },
  {
    id: 'kitchen.mise.production-demand',
    label: 'Production demand',
    kind: 'reference',
    status: 'partial',
    owner: 'Orders, Menus, Recipes and Stations',
    authority: 'Generated prep remains a proposal until demand, Recipe quantities and Station routing are evidenced and approved.',
    facts: [ 'bounded demand', 'Menu item and Recipe mappings', 'Recipe yield and quantities', 'Station routing' ],
    readBy: [ 'kitchen.mise.generate-prep-list', 'kitchen.mise.calculate-quantities', 'kitchen.mise.assign-by-station' ],
    writtenBy: []
  }
],
  recordQuestions: ['What must be prepared, in what target quantity and unit?', 'Which Recipe, Prep Item, Menu, expected demand or operator decision created the requirement?', 'Which Station and Team member own the work?', 'When is it due and what priority or dependency applies?', 'Is it to do, in progress, done or blocked, and who changed that state?', 'What actual yield, completion, shortage or Waste evidence should inform the next plan?'],
  toolHypotheses: [
    { id: 'kitchen.mise.create-prep-task', label: 'Add Prep Task', layer: 'human', purpose: 'Add one explicit task to the Kitchen prep list.', inputs: ['title', 'optional quantity, Station, assignee and due time'], outputs: ['KitchenMiseTask'], evidence: ['current Kitchen and actor'], authority: 'The guarded Mise create mutation targets the selected Kitchen and relies on Firestore rules for write authority.', approval: 'The operator explicitly submits the task.', status: 'available' },
    { id: 'kitchen.mise.update-prep-task', label: 'Update Prep Task', layer: 'human', purpose: 'Change the working details of a prep task.', inputs: ['task identity', 'named changes'], outputs: ['updated KitchenMiseTask'], evidence: ['current stored task'], authority: 'The guarded Mise update mutation targets the selected task and relies on Firestore rules for Kitchen authority.', approval: 'The operator submits the named changes.', status: 'available' },
    { id: 'kitchen.mise.change-prep-status', label: 'Change Prep Status', layer: 'human', purpose: 'Move a prep task through its working states.', inputs: ['task identity', 'new status'], outputs: ['actor-stamped status change'], evidence: ['current task state'], authority: 'The guarded Mise status mutation targets the selected task and relies on Firestore rules for Kitchen authority.', approval: 'The operator explicitly selects the new state.', status: 'available' },
    { id: 'kitchen.mise.delete-prep-task', label: 'Delete Prep Task', layer: 'human', purpose: 'Permanently remove one prep task.', inputs: ['task identity'], outputs: ['confirmed deletion'], evidence: ['current task'], authority: 'The guarded Mise delete mutation targets the selected task and relies on Firestore rules for Kitchen authority.', approval: 'The destructive action requires explicit confirmation.', status: 'available' },
    { id: 'kitchen.mise.generate-prep-list', label: 'Generate Prep List', layer: 'compound', purpose: 'Prepare proposed tasks from service requirements.', inputs: ['Menus', 'Recipes', 'prepared stock', 'expected demand'], outputs: ['reviewable proposed tasks with provenance'], evidence: ['authorized source records'], authority: 'MiseAI may propose but cannot create tasks silently.', approval: 'The chef confirms proposed tasks before creation.', status: 'requested' },
    { id: 'kitchen.mise.calculate-quantities', label: 'Calculate Prep Quantities', layer: 'ai-assisted', purpose: 'Calculate reviewable targets for expected demand.', inputs: ['Recipe yields', 'expected demand', 'on-hand prep'], outputs: ['target quantities with assumptions'], evidence: ['compatible source quantities and units'], authority: 'Unknown or incompatible evidence remains explicit.', approval: 'Calculation is read-only; applying targets requires confirmation.', status: 'requested' },
    { id: 'kitchen.mise.assign-by-station', label: 'Assign Prep by Station', layer: 'compound', purpose: 'Group and propose responsibility for preparation work.', inputs: ['prep tasks', 'Stations', 'available Team context'], outputs: ['assignment proposal'], evidence: ['task Station requirements and authorized Team evidence'], authority: 'MiseAI may propose assignments but not alter Team authority.', approval: 'An operator confirms assignments before tasks change.', status: 'requested' },
  ] satisfies KitchenMiseToolHypothesis[],
  aiContract: {
    miseAI: ['Own Mise interpretation, evidence requirements and its Tool catalogue.', 'Use the four available human Tools only within their existing authority and approval contracts.', 'Keep generated tasks and quantities as proposals until confirmed.', 'Distinguish Recipe definition, planned prep, live Orders and Waste evidence.', 'Return assumptions and source evidence with every derived prep plan.'],
    kitchenAI: ['Recognise prep intent and delegate it to MiseAI.', 'Pass current Kitchen orientation and authorized context without copying Mise expertise.', 'Discover real Tool availability through MiseAI registration.', 'Present proposals and preserve approval for every task mutation.'],
    activation: ['Existing human Tools remain verified against their trusted commands.', 'Requested generators have authoritative Recipe, demand and unit evidence.', 'AI registration reports actual per-Tool availability.', 'Authorization, approvals, audit behaviour, UI and verification remain complete.'],
  },
  conclusion: 'Mise owns planned Kitchen preparation work and its readiness. Recipes define how, demand informs how much, Stations and Team own responsibility, and Orders owns live service routing.',
} as const
