// Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: require current Terms acceptance and Privacy acknowledgement for incomplete accounts.
// Concurrent edit — 2026-07-20 13:58 CEST — Account evidence pass: persist explicit current acceptance for legacy accounts without rewriting existing evidence.

import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverUserAccountTarget,
} from '../../../utils/firestore-mutations/targets'
import {
  UserAccountModel,
  UserAccountStorage,
} from '../../models/user-account.model.ts'
import {
  FIREUX_ACCOUNT_TERMS_VERSION,
  type UserAccountProvisioningResult,
} from '../../models/user-account-provisioning'

type ProvisionUserAccountInput = {
  uid: string
  email: string
  emailVerified: boolean
  termsVersion?: string
}

export async function provisionUserAccount(
  input: ProvisionUserAccountInput
): Promise<UserAccountProvisioningResult> {
  const users = FIRESTORE_MUTATION_TARGETS.users
  const accounts = serverUserAccountTarget(input.uid)

  return runGuardedServerTransaction(accounts.database, async (mutations) => {
    const [userSnapshot, snapshot] = await Promise.all([
      mutations.read(users, input.uid),
      mutations.read<Record<string, unknown>>(
        accounts,
        UserAccountStorage.document
      ),
    ])
    if (snapshot.exists) {
      const data = snapshot.data ?? {}
      const terms = data.terms as Record<string, unknown> | undefined
      const recordedVersion =
        typeof terms?.version === 'string' ? terms.version.trim() : ''
      const currentTermsRecorded =
        recordedVersion === FIREUX_ACCOUNT_TERMS_VERSION &&
        terms?.accepted_at != null
      const termsUnrecorded =
        recordedVersion === '' && terms?.accepted_at == null
      const shouldRecordCurrentTerms =
        input.termsVersion === FIREUX_ACCOUNT_TERMS_VERSION && termsUnrecorded
      const emailChanged =
        input.emailVerified && String(data.email || '').trim() !== input.email

      if (!currentTermsRecorded && !termsUnrecorded) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Existing terms evidence requires the dedicated account-upgrade flow.',
        })
      }

      if (
        !userSnapshot.exists &&
        !currentTermsRecorded &&
        !shouldRecordCurrentTerms
      ) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Accept the current Terms of Service and acknowledge the Privacy Policy to recover this incomplete account.',
        })
      }

      if (shouldRecordCurrentTerms || emailChanged) {
        mutations.update(accounts, UserAccountStorage.document, {
          ...(emailChanged ? { email: input.email } : {}),
          ...(shouldRecordCurrentTerms
            ? {
                terms: {
                  version: input.termsVersion,
                  accepted_at: FieldValue.serverTimestamp(),
                },
              }
            : {}),
          updated: {
            at: FieldValue.serverTimestamp(),
            by: input.uid,
          },
        })
      }

      return {
        ok: true,
        created: false,
        terms_recorded: currentTermsRecorded || shouldRecordCurrentTerms,
      }
    }

    if (!userSnapshot.exists && !input.termsVersion) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Accept the current Terms of Service and acknowledge the Privacy Policy for a new account.',
      })
    }

    const stamp = {
      at: FieldValue.serverTimestamp(),
      by: input.uid,
    }
    mutations.create(accounts, UserAccountStorage.document, {
      email: input.email,
      preferences: { ...UserAccountModel.preferences },
      terms: input.termsVersion
        ? {
            version: input.termsVersion,
            accepted_at: FieldValue.serverTimestamp(),
          }
        : {
            version: '',
            accepted_at: null,
          },
      created: stamp,
      updated: stamp,
    })

    return {
      ok: true,
      created: true,
      terms_recorded: Boolean(input.termsVersion),
    }
  })
}
