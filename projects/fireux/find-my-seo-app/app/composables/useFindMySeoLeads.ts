// Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: use the app-owned Find My SEO fixture.
// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: store submissions only in the local simulation.
import type { DemoSeoLeadDraft, DemoSeoLeadInquiry, DemoSeoLeadStatus, DemoSeoProvider } from '../simulations/findMySeo'
import { buildDemoSeoLeadId, demoSeoLeadInbox } from '../simulations/findMySeo'
import { useState } from '#imports'

const cloneLead = (lead: DemoSeoLeadInquiry): DemoSeoLeadInquiry => ({ ...lead })

export const useFindMySeoLeads = () => {
  const leads = useState<DemoSeoLeadInquiry[]>('find-my-seo-leads', () => demoSeoLeadInbox.map(cloneLead))

  const submitLead = (provider: DemoSeoProvider, draft: DemoSeoLeadDraft) => {
    const lead: DemoSeoLeadInquiry = {
      id: buildDemoSeoLeadId(),
      providerEntityType: provider.entityType,
      providerEntityId: provider.id,
      providerSlug: provider.slug,
      providerDisplayName: provider.displayName,
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
