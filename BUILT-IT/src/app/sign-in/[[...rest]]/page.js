import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      {/* Redirect to /role-redirect after sign-in */}
      <SignIn afterSignInUrl="/role-redirect" />
    </div>
  );
}
