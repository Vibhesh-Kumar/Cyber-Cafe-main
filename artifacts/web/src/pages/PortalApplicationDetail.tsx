import { useRoute, Link } from "wouter";
import { useGetApplication, useListApplicationDocuments, usePayApplication } from "@workspace/api-client-react";
import { LoadingPage } from "@/components/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatCurrency } from "@/lib/format";
import { ArrowLeft, FileText, CheckCircle2, Circle, CreditCard, Download, ExternalLink, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PortalApplicationDetail() {
  const [, params] = useRoute("/portal/applications/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: app, isLoading: appLoading, refetch } = useGetApplication(id);
  const { data: documents, isLoading: docsLoading } = useListApplicationDocuments(id);
  const payApplication = usePayApplication();
  const { toast } = useToast();

  if (appLoading || docsLoading) return <LoadingPage />;
  if (!app) return <div className="p-12 text-center text-2xl font-bold">Application not found</div>;

  const handlePayment = async () => {
    try {
      await payApplication.mutateAsync({ id });
      toast({ title: "Payment Successful", description: "Your payment has been recorded." });
      refetch();
    } catch (error: any) {
      toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <div className="bg-secondary text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <Link href="/portal">
            <Button variant="ghost" className="text-white hover:bg-white/10 px-0 mb-6 h-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{app.applicationNumber}</span>
                <StatusBadge status={app.status} />
              </div>
              <h1 className="text-3xl font-bold font-serif">{app.serviceName}</h1>
              <p className="text-white/70 mt-2">Submitted on {formatDateTime(app.createdAt)}</p>
            </div>
            <div className="shrink-0 bg-white/10 p-4 rounded-xl border border-white/20 text-center min-w-[200px]">
              <p className="text-sm text-white/70 uppercase tracking-wider mb-1">Payment Status</p>
              <div className="mb-2"><PaymentStatusBadge status={app.paymentStatus} /></div>
              {app.paymentStatus === 'pending' && (
                <Button size="sm" className="w-full bg-white text-secondary hover:bg-white/90" onClick={handlePayment} disabled={payApplication.isPending}>
                  <CreditCard className="mr-2 h-4 w-4" /> Pay {formatCurrency(app.amount)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-card">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Application Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Object.entries(app.formData).map(([key, value]) => (
                    <div key={key} className="bg-muted/30 p-4 rounded-xl border border-border/50">
                      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="block text-sm font-medium text-secondary">{String(value) || "-"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-card">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Attached Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {documents?.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No documents attached.</div>
                ) : (
                  <div className="divide-y">
                    {documents?.map(doc => (
                      <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-secondary">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">Uploaded {formatDateTime(doc.uploadedAt)}</p>
                          </div>
                        </div>
                        <a href={`/api/storage${doc.objectPath}`} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon" title="View Document" className="text-primary"><ExternalLink className="h-4 w-4" /></Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-28">
              <CardHeader className="border-b bg-card">
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                  {app.statusHistory.map((history, idx) => (
                    <div key={idx} className="relative flex items-start">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 relative z-10 -ml-5 mr-4 mt-1">
                        {idx === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-2 w-2 fill-current" />}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="font-bold text-secondary">{history.status.replace("_", " ").toUpperCase()}</div>
                        <time className="text-xs font-medium text-muted-foreground block mb-2">{formatDateTime(history.createdAt)}</time>
                        {history.note && <div className="text-sm text-secondary-foreground/80 bg-muted/50 p-3 rounded-lg border">{history.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
