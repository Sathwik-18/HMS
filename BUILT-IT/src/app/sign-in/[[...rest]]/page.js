// app/sign-in/page.js
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <SignIn afterSignInUrl="/student" /> {/*  Default redirect after sign-in */}
    </div>
  );
}