import { buildAppLandingJsonLd, type FireuxSeoBuilderContext } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { operator } from '../content/operator'
import type { TourPage } from '../content/tour-pages'

/** Project the same visible catalogue and contact facts through Core's SEO graph. */
export function buildSiteJsonLd(context: FireuxSeoBuilderContext, options: { service?: { name: string; description: string; path: string }; items?: { name: string; path: string }[] } = {}) {
  const base = buildAppLandingJsonLd({ appName: operator.name, canonicalUrl: context.canonicalUrl, description: context.description, image: context.image, language: 'en', title: context.title })
  if (!base || Array.isArray(base)) return null
  const graph = base['@graph'] as Record<string, unknown>[]
  const business = graph.find(item => item['@type'] === 'Organization')!
  Object.assign(business, {
    '@type': 'LocalBusiness', telephone: operator.telephone, email: operator.email,
    address: { '@type': 'PostalAddress', streetAddress: operator.streetAddress, postalCode: operator.postalCode, addressLocality: operator.addressLocality, addressCountry: operator.addressCountry },
  })
  const webpage = graph.find(item => item['@type'] === 'WebPage')!
  const page = options.service
  if (page) {
    const serviceId = `${context.canonicalUrl}#service`
    const breadcrumbsId = `${context.canonicalUrl}#breadcrumbs`
    Object.assign(webpage, { mainEntity: { '@id': serviceId }, breadcrumb: { '@id': breadcrumbsId } })
    graph.push({ '@type': 'Service', '@id': serviceId, name: page.name, description: page.description, url: context.canonicalUrl, provider: { '@id': `${context.origin}/#organization` } })
    graph.push({ '@type': 'BreadcrumbList', '@id': breadcrumbsId, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Swiss Alpine Guides', item: `${context.origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Activities', item: `${context.origin}/activities` },
      { '@type': 'ListItem', position: 3, name: page.name, item: context.canonicalUrl },
    ] })
  } else if (options.items?.length) {
    const listId = `${context.canonicalUrl}#tours`
    webpage.mainEntity = { '@id': listId }
    graph.push({ '@type': 'ItemList', '@id': listId, itemListElement: options.items.map((tour, index) => ({ '@type': 'ListItem', position: index + 1, name: tour.name, url: context.absoluteUrl(tour.path) })) })
  }
  return base
}

export function buildTourJsonLd(context: FireuxSeoBuilderContext, page?: TourPage) { return buildSiteJsonLd(context, page ? { service: page } : {}) }
