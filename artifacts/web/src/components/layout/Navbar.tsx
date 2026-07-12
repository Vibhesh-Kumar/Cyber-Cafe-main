import { Link, useLocation } from "wouter";
import { useAuth, useClerk } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Home,
  LifeBuoy,
  LogOut,
  MapPin,
  Menu,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { data: user } = useGetMe({ query: { enabled: !!isSignedIn } as any });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const handleSignOut = () => {
    signOut({ redirectUrl: basePath || "/" });
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Track Application", href: "/track" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3">
              {/* Fallback icon if logo not available */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif leading-none tracking-tight text-secondary">
                  Bihar Cyber
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Digital Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-primary",
                  location === link.href || (link.href !== "/" && location.startsWith(link.href))
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                {user?.role === "admin" ? (
                  <Link href="/admin">
                    <Button variant="outline" className="gap-2">
                      <ShieldAlert className="h-4 w-4" /> Admin
                    </Button>
                  </Link>
                ) : user?.role === "operator" ? (
                  <Link href="/operator">
                    <Button variant="outline" className="gap-2">
                      <LifeBuoy className="h-4 w-4" /> Operator
                    </Button>
                  </Link>
                ) : (
                  <Link href="/portal">
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" /> My Portal
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="font-semibold text-secondary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="font-semibold">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <div
                  className={cn(
                    "block rounded-md px-3 py-2 text-base font-semibold",
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t pb-4 pt-4 px-4">
            {isSignedIn ? (
              <div className="space-y-2">
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setMobileMenuOpen(false)}>
                      <ShieldAlert className="h-4 w-4" /> Admin Dashboard
                    </Button>
                  </Link>
                )}
                {user?.role === "operator" && (
                  <Link href="/operator">
                    <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setMobileMenuOpen(false)}>
                      <LifeBuoy className="h-4 w-4" /> Operator Dashboard
                    </Button>
                  </Link>
                )}
                {(!user?.role || user?.role === "customer") && (
                  <Link href="/portal">
                    <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4" /> My Portal
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/sign-in">
                  <Button className="w-full justify-center" variant="outline" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
