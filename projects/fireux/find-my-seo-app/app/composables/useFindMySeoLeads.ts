import type { LeadDraft, LeadInquiry, LeadStatus, SeoProvider } from '../content/findMySeo'
import { buildLeadId, initialLeadInbox, operatorInboxEmail } from '../content/findMySeo'

const cloneLead = (lead: LeadInquiry): LeadInquiry => ({ ...lead })

export const useFindMySeoLeads = () => {
  const leads = useState<LeadInquiry[]>('find-my-seo-leads', () => initialLeadInbox.map(cloneLead))

  const submitLead = (provider: SeoProvider, draft: LeadDraft) => {
    const deliveryEmail = provider.contactEmail || operatorInboxEmail
    const deliveryState = provider.contactEmail ? 'sent' : 'failed'

    const lead: LeadInquiry = {
      id: buildLeadId(),
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

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    leads.value = leads.value.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
  }

  return {
    leads,
    submitLead,
    updateLeadStatus,
  }
}
