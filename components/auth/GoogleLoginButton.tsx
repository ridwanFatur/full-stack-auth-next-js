"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
}: GoogleLoginButtonProps) {
  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError ?? (() => {})}
      useOneTap={false}
      theme="outline"
      size="large"
      width="100%"
      text="continue_with"
    />
  );
}
