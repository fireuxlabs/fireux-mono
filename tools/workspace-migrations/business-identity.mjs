import { readFileSync } from 'node:fs'

/** Input is a reviewed export, never a live database connection. Output is a plan only. */
export function planBusinessMigration(input) {
  const { companies = [], places = [], businesses = [], owners = [], suppliers = [], jobs = [] } = input
  const locations = new Map(places.map((row) => [row.id, row]))
  const occupied = new Set(businesses.map((row) => row.id))
  const grants = new Map(owners.map((row) => [row.businessId, row]))
  const creates = companies.map((company) => {
    if (occupied.has(company.id)) throw new Error(`Destination collision: ${company.id}`)
    occupied.add(company.id)
    const place = locations.get(company.id)
    const owner = grants.get(company.id)
    if (!place?.data?.name || !owner?.uid || !owner?.appId || !owner?.membership_created_at)
      throw new Error(`Reviewed Place and membership owner required: ${company.id}`)
    if (Object.keys(company.data).sort().join(',') !== 'created,updated')
      throw new Error(`Malformed legacy Company: ${company.id}`)
    return {
      source: { path: `companies/${company.id}`, preimage: company.data },
      placeSource: { path: `places/${place.id}`, preimage: place.data },
      destination: { path: `businesses/${company.id}`, data: {
        name: place.data.name, description: place.data.about || '', email: place.data.email || '', phone: place.data.phone || '',
        website: place.data.website || '', place_ids: [place.id],
        management: { mode: 'app', app_id: owner.appId },
        created: company.data.created, updated: company.data.updated,
      } },
      owner: { ...owner },
    }
  })
  const ids = new Set(creates.map((row) => row.destination.path.split('/')[1]))
  const references = []
  for (const [collection, rows] of [['suppliers', suppliers], ['jobs', jobs]]) {
    for (const row of rows) {
      if (!row.data.company_id) continue
      if (!ids.has(row.data.company_id) || row.data.business_id)
        throw new Error(`Unresolved or conflicting reference: ${collection}/${row.id}`)
      const { company_id, ...rest } = row.data
      references.push({ path: `${collection}/${row.id}`, preimage: row.data, postimage: { ...rest, business_id: company_id } })
    }
  }
  return { mode: 'plan-only', creates, references, retirement: 'Separate approval after copy verification; do not delete source records from this plan.' }
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  if (!process.argv[2]) throw new Error('Provide a reviewed JSON export file.')
  process.stdout.write(JSON.stringify(planBusinessMigration(JSON.parse(readFileSync(process.argv[2], 'utf8'))), null, 2) + '\n')
}
