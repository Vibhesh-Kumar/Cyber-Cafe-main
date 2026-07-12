import { Link } from "wouter";
import { ArrowRight, CheckCircle2, FileText, Globe, Landmark, MapPin, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListServices } from "@workspace/api-client-react";

export default function Home() {
  const { data: services, isLoading } = useListServices({ limit: 4 } as any);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary-foreground mb-6 backdrop-blur-sm border border-primary/30">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Government Services Made Easy
            </div>
            <h1 className="text-4xl font-bold font-serif tracking-tight text-white sm:text-6xl mb-6">
              Your neighborhood digital service counter.
            </h1>
            <p className="text-lg text-secondary-foreground/80 mb-8 max-w-xl">
              We help you navigate complex government paperwork, apply for certificates, and manage utilities without needing a computer or getting confused by the forms.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/services">
                <Button size="lg" className="gap-2 text-base shadow-lg shadow-primary/20">
                  Browse Services <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-base">
                  Track Application
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-[3rem]"></div>
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-secondary-foreground/5 shadow-2xl p-8 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: FileText, label: "Certificates", desc: "Income, Caste, Residence" },
                  { icon: Landmark, label: "Banking", desc: "Account Opening, KYC" },
                  { icon: Globe, label: "Education", desc: "Admissions, Scholarships" },
                  { icon: Zap, label: "Utilities", desc: "Electricity, Water Bills" },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-secondary">{item.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-background px-4 py-16 sm:px-6 lg:px-8 border-b border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-secondary text-lg">Official & Secure</h3>
              <p className="text-muted-foreground text-sm mt-2">All applications submitted through official government channels securely.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-secondary text-lg">Error-Free Forms</h3>
              <p className="text-muted-foreground text-sm mt-2">Our operators ensure your forms are filled correctly the first time.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-secondary text-lg">Local Support</h3>
              <p className="text-muted-foreground text-sm mt-2">Help available in your local language from people who understand.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold font-serif text-secondary">Popular Services</h2>
              <p className="mt-2 text-muted-foreground">Most frequently requested forms and applications.</p>
            </div>
            <Link href="/services">
              <Button variant="ghost" className="mt-4 md:mt-0 text-primary">View All Services <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-card animate-pulse border"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services?.slice(0, 4).map((service) => (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <div className="group h-full rounded-2xl border bg-card p-6 shadow-sm hover-elevate transition-all flex flex-col">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-secondary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <span className="text-sm font-semibold">₹{service.price}</span>
                      <span className="text-xs text-muted-foreground">{service.estimatedDays} Days</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="rounded-[2.5rem] bg-primary px-6 py-16 sm:p-20 text-center relative overflow-hidden">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
            <h2 className="relative z-10 text-3xl font-bold font-serif text-white sm:text-4xl max-w-2xl mx-auto">
              Ready to start your application?
            </h2>
            <p className="relative z-10 mt-4 text-lg text-white/90 max-w-xl mx-auto mb-8">
              Create a free account to apply for services, save your documents securely, and track your status online.
            </p>
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-base px-8">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
