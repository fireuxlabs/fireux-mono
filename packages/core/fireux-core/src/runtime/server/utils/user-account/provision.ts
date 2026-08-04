// Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: require current Terms acceptance and Privacy acknowledgement for incomplete accounts.
// Concurrent edit — 2026-07-20 13:58 CEST — Account evidence pass: persist explicit current acceptance for legacy accounts without rewriting existing evidence.

import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import {
  UserPrivateModel,
  UserPrivateStorage,
  UserStorage,
} from '../../../models/core/user.model'
import {
  FIREUX_ACCOUNT_TERMS_VERSION,
  type UserAccountProvisioningResult,
} from '../../../models/operations/user-account-provisioning'
import { getRuntimeIdentityFirestore } from '../getRuntimeFirestore'

type ProvisionUserPrivateAccountInput = {
  uid: string
  email: string
  emailVerified: boolean
  termsVersion?: string
}

export async function provisionUserPrivateAccount(
  input: ProvisionUserPrivateAccountInput
): Promise<UserAccountProvisioningResult> {
  const db = getRuntimeIdentityFirestore()
  const userRef = db.collection(UserStorage.rootCollection).doc(input.uid)
  const ref = db
    .collection(UserStorage.rootCollection)
    .doc(input.uid)
    .collection(UserPrivateStorage.collection)
    .doc(UserPrivateStorage.document)

  return db.runTransaction(async (transaction) => {
    const [userSnapshot, snapshot] = await transaction.getAll(userRef, ref)
    if (snapshot.exists) {
      const terms = snapshot.get('terms') as Record<string, unknown> | undefined
      const recordedVersion =
        typeof terms?.version === 'string' ? terms.version.trim() : ''
      const currentTermsRecorded =
        recordedVersion === FIREUX_ACCOUNT_TERMS_VERSION &&
        terms?.accepted_at != null
      const termsUnrecorded =
        recordedVersion === '' && terms?.accepted_at == null
      const shouldRecordCurrentTerms =
        input.termsVersion === FIREUX_ACCOUNT_TERMS_VERSION &&
        termsUnrecorded
      const emailChanged =
        input.emailVerified &&
        String(snapshot.get('email') || '').trim() !== input.email

      if (!currentTermsRecorded && !termsUnrecorded) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Existing terms evidence requires the dedicated account-upgrade flow.',
        })
      }

      if (!userSnapshot.exists && !currentTermsRecorded && !shouldRecordCurrentTerms) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Accept the current Terms of Service and acknowledge the Privacy Policy to recover this incomplete account.',
        })
      }

      if (shouldRecordCurrentTerms || emailChanged) {
        transaction.update(ref, {
          ...(emailChanged ? { email: input.email } : {}),
          ...(shouldRecordCurrentTerms ? {
          terms: {
            version: input.termsVersion,
            accepted_at: FieldValue.serverTimestamp(),
          },
          } : {}),
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
    transaction.create(ref, {
      email: input.email,
      preferences: { ...UserPrivateModel.preferences },
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
