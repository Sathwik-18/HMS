// app/sign-up/page.js
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <SignUp afterSignUpUrl="/student" /> {/* Default redirect after sign-up */}
    </div>
  );
}