import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ClerkProvider, Show, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';

import { RootLayout } from "./components/layout/RootLayout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Apply from "./pages/Apply";
import Track from "./pages/Track";
import { BlogList, BlogDetail } from "./pages/Blog";
import Faq from "./pages/Faq";
import Contact from "./pages/Contact";
import Portal from "./pages/Portal";
import PortalApplicationDetail from "./pages/PortalApplicationDetail";
import OperatorDashboard from "./pages/OperatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { SignInPage, SignUpPage } from "./pages/Auth";
import NotFound from '@/pages/not-found';
import { useGetMe } from "@workspace/api-client-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(24, 95%, 53%)", // Primary: Saffron
    colorForeground: "hsl(220, 40%, 15%)", // Secondary: Navy
    colorMutedForeground: "hsl(30, 15%, 45%)", 
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(0, 0%, 100%)", // White card bg
    colorInput: "hsl(0, 0%, 100%)",
    colorInputForeground: "hsl(220, 40%, 15%)",
    colorNeutral: "hsl(30, 20%, 90%)", // Border
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-[2rem] w-[440px] max-w-full overflow-hidden shadow-xl border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold font-serif text-[hsl(220,40%,15%)]",
    headerSubtitle: "text-[hsl(30,15%,45%)] text-sm",
    socialButtonsBlockButtonText: "text-sm font-semibold",
    formFieldLabel: "text-sm font-bold text-[hsl(220,40%,15%)]",
    footerActionLink: "text-[hsl(24,95%,53%)] font-bold hover:underline",
    footerActionText: "text-[hsl(30,15%,45%)]",
    dividerText: "text-[hsl(30,15%,45%)] text-xs font-semibold",
    identityPreviewEditButton: "text-[hsl(24,95%,53%)]",
    formFieldSuccessText: "text-[hsl(142,60%,35%)] text-xs",
    alertText: "text-sm",
    logoBox: "h-12 flex justify-center mb-6",
    logoImage: "h-full w-auto object-contain",
    socialButtonsBlockButton: "border-2 rounded-xl h-12",
    formButtonPrimary: "bg-[hsl(24,95%,53%)] hover:bg-[hsl(24,95%,45%)] text-white rounded-xl h-12 font-bold text-base shadow-sm transition-all",
    formFieldInput: "rounded-xl h-12 border-[hsl(30,20%,90%)] bg-transparent px-4 py-2",
    footerAction: "bg-[hsl(40,50%,98%)] p-6 mt-6 rounded-b-[2rem] border-t border-[hsl(30,20%,90%)]",
    dividerLine: "bg-[hsl(30,20%,90%)]",
    alert: "rounded-xl p-3 border",
    otpCodeFieldInput: "rounded-xl border-[hsl(30,20%,90%)] h-12 w-10",
    formFieldRow: "space-y-4",
    main: "px-8 pt-8 pb-4",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

// Redirects home based on role
function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: user, isLoading: userLoading } = useGetMe({ query: { enabled: !!isSignedIn } as any });

  if (!isLoaded || (isSignedIn && userLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isSignedIn) {
    if (user?.role === "admin") return <AdminDashboard />;
    if (user?.role === "operator") return <OperatorDashboard />;
    return <Portal />;
  }

  return <Home />;
}

function Router() {
  return (
    <RootLayout>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        
        {/* Clerk Auth Routes */}
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />

        {/* Public Routes */}
        <Route path="/services" component={Services} />
        <Route path="/services/:id" component={ServiceDetail} />
        <Route path="/track" component={Track} />
        <Route path="/faq" component={Faq} />
        <Route path="/blog" component={BlogList} />
        <Route path="/blog/:slug" component={BlogDetail} />
        <Route path="/contact" component={Contact} />

        {/* Protected Routes */}
        <Route path="/apply/:id">
          <Show when="signed-in"><Apply /></Show>
          <Show when="signed-out"><HomeRedirect /></Show>
        </Route>
        
        <Route path="/portal">
          <Show when="signed-in"><Portal /></Show>
          <Show when="signed-out"><HomeRedirect /></Show>
        </Route>
        <Route path="/portal/applications/:id">
          <Show when="signed-in"><PortalApplicationDetail /></Show>
          <Show when="signed-out"><HomeRedirect /></Show>
        </Route>
        
        <Route path="/operator">
          <Show when="signed-in"><OperatorDashboard /></Show>
          <Show when="signed-out"><HomeRedirect /></Show>
        </Route>
        
        <Route path="/admin">
          <Show when="signed-in"><AdminDashboard /></Show>
          <Show when="signed-out"><HomeRedirect /></Show>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </RootLayout>
  );
}

function App() {
  const [, setLocation] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProvider
            publishableKey={clerkPubKey}
            proxyUrl={clerkProxyUrl}
            appearance={clerkAppearance}
            signInUrl={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
            localization={{
              signIn: {
                start: {
                  title: "Welcome back",
                  subtitle: "Sign in to access your portal",
                },
              },
              signUp: {
                start: {
                  title: "Create your account",
                  subtitle: "Your digital service journey starts here",
                },
              },
            }}
            routerPush={(to) => setLocation(stripBase(to))}
            routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
          >
            <ClerkQueryClientCacheInvalidator />
            <Router />
          </ClerkProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
