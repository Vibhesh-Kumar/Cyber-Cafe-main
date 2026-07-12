import { SignIn, SignUp } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute -left-40 top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -right-40 bottom-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute -left-40 top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -right-40 bottom-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}
