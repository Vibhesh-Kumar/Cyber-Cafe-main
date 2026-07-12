export function formatDate(dateString: string | undefined | null) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

export function formatCurrency(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
