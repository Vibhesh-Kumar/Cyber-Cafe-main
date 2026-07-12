import { useRoute, Link } from "wouter";
import { useGetService } from "@workspace/api-client-react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingPage } from "@/components/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, FileText, IndianRupee, ShieldCheck } from "lucide-react";
import { useAuth } from "@clerk/react";

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:id");
  const serviceId = params?.id ? parseInt(params.id) : 0;
  
  const { data: service, isLoading } = useGetService(serviceId);
  const { isSignedIn } = useAuth();

  if (isLoading) return <LoadingPage />;
  
  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-secondary mb-2">Service not found</h2>
        <p className="text-muted-foreground mb-6">The service you are looking for does not exist or has been removed.</p>
        <Link href="/services"><Button>Browse All Services</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title={service.name}
        description={service.categoryName}
      >
        <Link href="/services">
          <Button variant="outline" className="mt-4 bg-white/10 text-white border-white/20 hover:bg-white/20 text-sm h-10 px-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
          </Button>
        </Link>
      </PageHeader>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="prose prose-blue max-w-none">
              <h2 className="text-2xl font-bold font-serif text-secondary mb-4">About this Service</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{service.description}</p>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-secondary mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Required Documents
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Please keep scanned copies or clear photos of these documents ready before starting the application.</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white p-3 rounded-lg border shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-secondary">{doc}</span>
                    </li>
                  ))}
                  {service.requiredDocuments.length === 0 && (
                    <li className="text-sm text-muted-foreground italic">No documents required for this service.</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-bold text-secondary mb-4">Application Form Fields</h3>
              <div className="rounded-xl border overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-border">
                  {service.formSchema.map((field, idx) => (
                    <div key={idx} className="bg-card p-4">
                      <span className="block text-sm font-bold text-secondary">{field.label}</span>
                      <span className="block text-xs text-muted-foreground mt-1 capitalize">{field.type} {field.required ? "(Required)" : "(Optional)"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
                <div className="bg-primary p-6 text-primary-foreground">
                  <h3 className="text-lg font-bold font-serif mb-1">Service Details</h3>
                  <p className="text-primary-foreground/80 text-sm">Official government application</p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-secondary">
                        <IndianRupee className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Processing Fee</p>
                        <p className="text-2xl font-bold text-secondary">₹{service.price}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-secondary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estimated Time</p>
                        <p className="text-lg font-bold text-secondary">{service.estimatedDays} Working Days</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-secondary">Secure Application</p>
                      <p className="text-xs text-muted-foreground mt-1">Your data is transmitted securely to official portals.</p>
                    </div>
                  </div>

                  {isSignedIn ? (
                    <Link href={`/apply/${service.id}`}>
                      <Button size="lg" className="w-full h-14 text-lg">Start Application</Button>
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <Link href="/sign-in">
                        <Button size="lg" className="w-full h-14 text-lg">Sign In to Apply</Button>
                      </Link>
                      <p className="text-xs text-center text-muted-foreground">You must have an account to save your documents and track status.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
