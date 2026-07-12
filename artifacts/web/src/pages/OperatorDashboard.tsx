import { useState } from "react";
import { useListApplications, useUpdateApplicationStatus } from "@workspace/api-client-react";
import { LoadingPage } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import { StatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { Search, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApplicationStatus } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function OperatorDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  
  const { data: applications, isLoading, refetch } = useListApplications();
  const updateStatus = useUpdateApplicationStatus();
  const { toast } = useToast();

  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [note, setNote] = useState("");

  const filteredApps = applications?.filter(app => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSearch = app.applicationNumber.toLowerCase().includes(search.toLowerCase()) || 
                          app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
                          app.serviceName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedApp.id,
        data: {
          status: newStatus as ApplicationStatus,
          note: note || undefined
        }
      });
      toast({ title: "Status Updated successfully" });
      setSelectedApp(null);
      setNote("");
      refetch();
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <PageHeader title="Operator Workspace" description="Process applications and update statuses." />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between bg-muted/30">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search app number, name, service..." 
                className="pl-9 bg-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App No.</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No applications found.</TableCell>
                </TableRow>
              ) : (
                filteredApps?.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs font-bold text-primary">{app.applicationNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium text-secondary">{app.applicantName}</div>
                      <div className="text-xs text-muted-foreground">{app.applicantEmail}</div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={app.serviceName}>{app.serviceName}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(app.createdAt)}</TableCell>
                    <TableCell><PaymentStatusBadge status={app.paymentStatus} /></TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/portal/applications/${app.id}`}>
                          <Button variant="outline" size="sm" title="View details"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Button 
                          size="sm" 
                          onClick={() => { setSelectedApp(app); setNewStatus(app.status); }}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              {selectedApp?.applicationNumber} - {selectedApp?.applicantName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary">Operator Note (Optional)</label>
              <Textarea 
                placeholder="Reason for rejection, internal note, etc." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending || newStatus === selectedApp?.status}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
