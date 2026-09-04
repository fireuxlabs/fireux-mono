import { createError, type H3Event } from 'h3'
import { readAppSession } from 'fireux-core/runtime/app/server/session/read'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { canonicalPropertyRoot } from '../../property/composables/firestore/utils/view/usePropertyInterface.ts'
import {
  PropertyStorage,
  type Property,
} from '../../property/models/property.model.ts'
import { PortfolioStorage } from '../../portfolio/models/portfolio.model.ts'
import { normalizePortfolio } from '../../portfolio/utils/normalize-portfolio.ts'

export type WorkspacePrimaryPresentation = {
  id: string
  name: string
  tagline: string
  url: string
}

const text = (value: unknown) => String(value ?? '').trim()

function invalidSource(family: 'Portfolio' | 'Property'): never {
  throw createError({
    statusCode: 409,
    statusMessage: `${family} Workspace source is invalid.`,
  })
}

export async function readPortfolioWorkspacePrimary(
  event: H3Event
): Promise<{ current: WorkspacePrimaryPresentation | null }> {
  const membership = (await readAppSession(event)).appUser
  const id = membership?.primary_portfolio || ''
  if (!id) return { current: null }

  const snapshot = await getRuntimeFirestore()
    .collection(PortfolioStorage.rootCollection)
    .doc(id)
    .get()
  const portfolio = snapshot.exists
    ? normalizePortfolio(snapshot.id, snapshot.data())
    : null
  if (!portfolio || portfolio.id !== id) invalidSource('Portfolio')

  return {
    current: {
      id,
      name: text(portfolio.name),
      tagline: text(portfolio.tagline),
      url: text(portfolio.image_url),
    },
  }
}

export async function readPropertyWorkspacePrimary(
  event: H3Event
): Promise<{ current: WorkspacePrimaryPresentation | null }> {
  const membership = (await readAppSession(event)).appUser
  const id = membership?.primary_property || ''
  if (!id) return { current: null }

  const snapshot = await getRuntimeFirestore()
    .collection(PropertyStorage.rootCollection)
    .doc(id)
    .get()
  const property = snapshot.exists
    ? canonicalPropertyRoot({
        ...(snapshot.data() as Property),
        id: snapshot.id,
      })
    : null
  if (!property || property.id !== id) invalidSource('Property')

  return {
    current: {
      id,
      name: text(property.identity.name),
      tagline: '',
      url: text(property.identity.image_url),
    },
  }
}
