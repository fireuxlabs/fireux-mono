import type { MenuAiExtractionResult } from './extraction'
import {
  countKitchenMenuDraftItems,
  type normalizeKitchenMenuDraftSections,
} from '../draft/sections'

export const menuAiReviewRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export const countExtractedMenuItems = (
  sections: ReturnType<typeof normalizeKitchenMenuDraftSections>
) => countKitchenMenuDraftItems(sections)

export const menuAiReviewErrorMessage = (value: unknown) =>
  value instanceof Error ? value.message : 'Menu AI processing failed.'

export const menuAiCheckpointValue = (value: MenuAiExtractionResult) =>
  JSON.parse(JSON.stringify(value)) as MenuAiExtractionResult
