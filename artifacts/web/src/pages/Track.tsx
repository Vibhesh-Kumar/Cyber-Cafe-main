import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useTrackApplication } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { Search, MapPin, CheckCircle2, Circle } from "lucide-react";

export default function Track() {
  const [appNumber, setAppNumber] = useState("");
  const [email, setEmail] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // useTrackApplication is a query hook, we use it with enabled flag
  const { data: tracking, isLoading, isError, refetch } = useTrackApplication(
    { applicationNumber: appNumber, email: email },
    { query: { enabled: false, retry: false } as any }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (appNumber && email) {
      setHasSearched(true);
      refetch();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Track Application" 
        description="Check the real-time status of your submitted applications."
      />

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-xl mx-auto">
          <Card className="shadow-lg border-0 mb-10 overflow-hidden">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
              <h2 className="text-xl font-bold font-serif text-secondary flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" /> Track Status
              </h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appNumber">Application Number</Label>
                  <Input 
                    id="appNumber" 
                    placeholder="e.g. APP-123456" 
                    value={appNumber}
                    onChange={(e) => setAppNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Registered Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter the email used during application" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Track Application"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {hasSearched && isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Finding your application...</p>
            </div>
          )}

          {hasSearched && isError && (
            <Card className="border-destructive bg-destructive/5 text-center p-8">
              <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-destructive mb-2">Application Not Found</h3>
              <p className="text-sm text-destructive/80">Please check your application number and email, then try again.</p>
            </Card>
          )}

          {hasSearched && tracking && (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-secondary p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-secondary-foreground/60 text-sm font-semibold uppercase tracking-wider mb-1">Application Number</p>
                    <h3 className="text-2xl font-bold font-mono">{tracking.applicationNumber}</h3>
                  </div>
                  <StatusBadge status={tracking.status} />
                </div>
                <p className="text-lg font-medium text-white/90">{tracking.serviceName}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-white/80">
                    Applied on: {formatDateTime(tracking.createdAt)}
                  </span>
                  <PaymentStatusBadge status={tracking.paymentStatus} />
                </div>
              </div>
              
              <CardContent className="p-0">
                <div className="p-6 sm:p-8">
                  <h4 className="font-bold text-secondary mb-6 uppercase tracking-wider text-sm border-b pb-2">Status Timeline</h4>
                  <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {tracking.statusHistory.map((history, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                          {idx === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-2 w-2 fill-current" />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm mb-6">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-secondary">{history.status.replace("_", " ").toUpperCase()}</div>
                            <time className="text-xs font-medium text-muted-foreground">{formatDateTime(history.createdAt)}</time>
                          </div>
                          {history.note && <div className="text-sm text-muted-foreground mt-2 bg-muted/50 p-3 rounded-lg">{history.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
