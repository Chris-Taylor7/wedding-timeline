export interface SignInModalProps {
  onSignInComplete: (organizerId: string, weddingTitle: string, isReadOnly: boolean) => void;
}