import type { DemoSeoLeadDraft, DemoSeoLeadInquiry, DemoSeoLeadStatus, DemoSeoProvider } from '../../../../../demo/find-my-seo.demo'
import { buildDemoSeoLeadId, demoFindMySeoOperatorInboxEmail, demoSeoLeadInbox } from '../../../../../demo/find-my-seo.demo'
import { useState } from '#imports'

const cloneLead = (lead: DemoSeoLeadInquiry): DemoSeoLeadInquiry => ({ ...lead })

export const useFindMySeoLeads = () => {
  const leads = useState<DemoSeoLeadInquiry[]>('find-my-seo-leads', () => demoSeoLeadInbox.map(cloneLead))

  const submitLead = (provider: DemoSeoProvider, draft: DemoSeoLeadDraft) => {
    const deliveryEmail = provider.contactEmail || demoFindMySeoOperatorInboxEmail
    const deliveryState = provider.contactEmail ? 'sent' : 'failed'

    const lead: DemoSeoLeadInquiry = {
      id: buildDemoSeoLeadId(),
      providerEntityType: provider.entityType,
      providerEntityId: provider.id,
      providerSlug: provider.slug,
      providerDisplayName: provider.displayName,
      deliveryEmail,
      status: 'new',
      contactName: draft.contactName.trim(),
      contactEmail: draft.contactEmail.trim(),
      companyName: draft.companyName.trim(),
      websiteUrl: draft.websiteUrl?.trim() || undefined,
      sector: draft.sector?.trim() || undefined,
      projectSummary: draft.projectSummary.trim(),
      budgetRange: draft.budgetRange.trim(),
      timeline: draft.timeline.trim(),
      consentContact: draft.consentContact,
      deliveryState,
      createdAt: new Date().toISOString(),
    }

    leads.value = [lead, ...leads.value]
    return lead
  }

  const updateLeadStatus = (leadId: string, status: DemoSeoLeadStatus) => {
    leads.value = leads.value.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
  }

  return {
    leads,
    submitLead,
    updateLeadStatus,
  }
}
