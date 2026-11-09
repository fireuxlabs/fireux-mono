export type SignInFeedback = {
  title: string
  description: string
  color: 'warning' | 'error'
}

// Only authored messages reach the page or clipboard; provider payloads may
// contain account identifiers, credentials or internal configuration details.
export function googleSignInFeedback(error: unknown): SignInFeedback {
  const code =
    error && typeof error === 'object' && 'code' in error ? error.code : null

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request'
  ) {
    return {
      title: 'Google sign-in wasn’t completed',
      description:
        'The sign-in window closed before finishing. Try Google again, or sign in with email below.',
      color: 'warning',
    }
  }
  if (code === 'auth/popup-blocked') {
    return {
      title: 'The sign-in window was blocked',
      description:
        'Allow pop-ups for this site, then try Google again. You can also sign in with email below.',
      color: 'warning',
    }
  }
  if (code === 'auth/unauthorized-domain') {
    return {
      title: 'Google sign-in is not configured for this address',
      description:
        'This address is not enabled for Google sign-in. Open the App using its usual address, or sign in with email below.',
      color: 'error',
    }
  }
  if (code === 'auth/operation-not-allowed') {
    return {
      title: 'Google sign-in is not enabled',
      description:
        'Google sign-in needs to be enabled for this App. You can sign in with email below.',
      color: 'error',
    }
  }
  if (code === 'auth/network-request-failed') {
    return {
      title: 'Couldn’t connect to Google',
      description: 'Check your connection and try again.',
      color: 'error',
    }
  }
  return {
    title: 'Google sign-in is unavailable',
    description: 'Try again, or sign in with email below.',
    color: 'error',
  }
}

export function emailSignInFeedback(isSignUp: boolean): SignInFeedback {
  return {
    title: isSignUp
      ? 'Account creation wasn’t completed'
      : 'Sign-in wasn’t completed',
    description: isSignUp
      ? 'Check your details and try again. If you already have an account, choose Sign in.'
      : 'Check your email and password, then try again. If you usually use Google, choose Continue with Google.',
    color: 'error',
  }
}
