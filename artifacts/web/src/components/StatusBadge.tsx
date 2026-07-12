import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, FileWarning, XCircle } from "lucide-react";
import { ApplicationStatus } from "@workspace/api-client-react";

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "submitted":
      return (
        <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
          <Circle className="h-3 w-3" /> Submitted
        </Badge>
      );
    case "under_review":
      return (
        <Badge variant="outline" className="gap-1 border-yellow-200 bg-yellow-50 text-yellow-700">
          <Clock className="h-3 w-3" /> Under Review
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700">
          <XCircle className="h-3 w-3" /> Rejected
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" /> Completed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
  }
}

export function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" /> Paid
      </Badge>
    );
  }
  return (
    <Badge variant="warning" className="gap-1 bg-amber-100 text-amber-800 border-transparent">
      <FileWarning className="h-3 w-3" /> Pending Payment
    </Badge>
  );
}
