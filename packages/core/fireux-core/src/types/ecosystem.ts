export type FireuxEcosystemConfig = {
  id: string
  name: string
  description: string

  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
  }
}
